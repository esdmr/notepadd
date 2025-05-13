import {createInterface} from 'node:readline';
import process from 'node:process';
import {execaNode, type Options, type ResultPromise} from 'execa';
import {v} from 'notepadd-core';
import {
	BookkeeperMessage,
	TimekeeperMessage,
	UpdateMessage,
	TerminateMessage,
} from 'notepadd-timekeeper';
import timekeeperPath from 'notepadd-timekeeper/service?child-process';
import {
	bridgeSocket,
	onBookkeeperCached,
	onBookkeeperUpdated,
	onStatusUpdated,
	onTimekeeperRestartRequested,
	onTimekeeperStalled,
	onTimekeeperStarted,
	onTimekeeperStartRequested,
	onTimekeeperStopRequested,
	onTimekeeperTriggered,
	onTimekeeperUpdated,
	type NotepaddStatus,
} from './bus.ts';
import {output} from './output.ts';
import {type AsyncDisposable} from './utils.ts';

const execaOptions = {
	ipc: true,
	serialization: 'json',
	forceKillAfterDelay: 1000,
	reject: false,
	nodeOptions: [...process.execArgv],
} satisfies Options;

if (import.meta.env.MODE !== 'production') {
	execaOptions.nodeOptions.push('--enable-source-maps');
}

const updateDebounceDelay = 17;

export class Timekeeper implements AsyncDisposable {
	private readonly _handlers = [
		onTimekeeperRestartRequested.event(async () => {
			return this.restart();
		}),
		onTimekeeperStartRequested.event(() => {
			this.start();
		}),
		onTimekeeperStopRequested.event(async () => {
			return this.stop();
		}),
		onBookkeeperCached.event((cache) => {
			this._clearQueue();

			this._process?.send(
				new BookkeeperMessage(
					new UpdateMessage(
						Object.fromEntries(cache),
						false,
						bridgeSocket.connected,
					),
				),
			);
		}),
		onBookkeeperUpdated.event(([fileUrl, content]) => {
			this._queue.set(fileUrl, content);
			this._queueUpdate();
		}),
		bridgeSocket.onDidConnect(() => {
			this._queueUpdate();
		}),
	] as const;

	private _process: ResultPromise<typeof execaOptions> | undefined;
	private _health: NotepaddStatus['timekeeperHealth'] = 'stopped';
	private _timeout: ReturnType<typeof setTimeout> | undefined;
	private readonly _queue = new Map<string, string>();

	constructor() {
		this._updateStatus();
	}

	initialize() {
		this.start();
		return this;
	}

	start() {
		if (this._process) return;

		this._process = execaNode(timekeeperPath, execaOptions);

		createInterface(this._process.stdout).on('line', (line) => {
			output.debug('[NotePADD/Timekeeper/1]', line);
		});

		createInterface(this._process.stderr).on('line', (line) => {
			output.error('[NotePADD/Timekeeper/2]', line);
		});

		this._process.on('message', (value) => {
			if (this._health !== 'running') {
				this._health = 'running';
				this._updateStatus();
			}

			const {message} = v.parse(TimekeeperMessage.schema, value);

			switch (message._type) {
				case 'DiscoveryMessage': {
					output.debug(
						'[NotePADD/Timekeeper]',
						'Discovery requested.',
					);
					onTimekeeperStarted.fire();
					break;
				}

				case 'TriggerMessage': {
					output.debug(
						'[NotePADD/Timekeeper]',
						'Directive triggered.',
						message.state,
					);
					onTimekeeperTriggered.fire(message.state);
					break;
				}

				case 'LogMessage': {
					output[message.level](
						'[NotePADD/Timekeeper/ipc]',
						...message.items,
					);
					break;
				}

				case 'ListMessage': {
					output.debug(
						'[NotePADD/Timekeeper]',
						'Received list of instances.',
					);
					output.trace(
						'[NotePADD/Timekeeper]',
						'Instances:',
						message.states,
					);
					onTimekeeperUpdated.fire(message.states);
					break;
				}
			}
		});

		this._process.on('error', () => {
			this._process = undefined;
			this._health = 'error';
			this._updateStatus();
		});

		this._process.on('exit', (code) => {
			if (code !== 0) {
				this._process = undefined;
				this._health = 'error';
				this._updateStatus();
				return;
			}

			// In case error event was emitted first, skip the exit event.
			if (!this._process) return;

			this._process = undefined;
			this._health = 'stopped';
			this._updateStatus();
		});

		this._health = 'starting';
		this._updateStatus();
	}

	async stop() {
		if (!this._process) return;

		onTimekeeperStalled.fire();
		this._process.send(new BookkeeperMessage(new TerminateMessage()));

		const timeout = setTimeout(() => {
			this._process?.kill();
		}, execaOptions.forceKillAfterDelay);

		await this._process;

		clearTimeout(timeout);
	}

	async restart() {
		await this.stop();
		this.start();
	}

	async asyncDispose() {
		for (const item of this._handlers) {
			item.dispose();
		}

		await this.stop();
	}

	private _queueUpdate() {
		if (!this._process) return;

		if (this._timeout) {
			clearTimeout(this._timeout);
		}

		this._timeout = setTimeout(() => {
			if (!this._process) return;

			this._process.send(
				new BookkeeperMessage(
					new UpdateMessage(
						Object.fromEntries(this._queue),
						true,
						bridgeSocket.connected,
					),
				),
			);

			this._queue.clear();
		}, updateDebounceDelay);
	}

	private _clearQueue() {
		this._queue.clear();

		if (this._timeout) {
			clearTimeout(this._timeout);
		}
	}

	private _updateStatus() {
		onStatusUpdated.fire({
			timekeeperHealth: this._health,
		});
	}
}
