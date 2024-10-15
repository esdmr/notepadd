import {createInterface} from 'node:readline';
import {execaNode, type Options, type ResultPromise} from 'execa';
import {
	BookkeeperMessage,
	DiscoveryMessage,
	TimekeeperMessage,
	TriggerMessage,
	UpdateMessage,
} from 'notepadd-timekeeper';
import timekeeperPath from 'notepadd-timekeeper/service?child-process';
import {ListMessage} from '../../notepadd-timekeeper/src/messages/list.ts';
import {LogMessage} from '../../notepadd-timekeeper/src/messages/log.ts';
import {TerminateMessage} from '../../notepadd-timekeeper/src/messages/terminate.ts';
import {
	onBookkeeperCached,
	onBookkeeperUpdated,
	onStatusUpdated,
	onTimekeeperRestartRequested,
	onTimekeeperStarted,
	onTimekeeperStartRequested,
	onTimekeeperStopRequested,
	type NotepaddStatus,
} from './bus.ts';
import {output} from './output.ts';
import {type AsyncDisposable} from './utils.ts';

const execaOptions = {
	ipc: true,
	serialization: 'json',
	forceKillAfterDelay: 1000,
	reject: false,
} satisfies Options;

const updateDebounceDelay = 17;

export class Bookkeeper implements AsyncDisposable {
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
			this._queue.clear();

			this._process?.send(
				new BookkeeperMessage(
					new UpdateMessage(Object.fromEntries(cache), false),
				),
			);
		}),
		onBookkeeperUpdated.event(([key, value]) => {
			this._queue.set(key, value);
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

			const {message} = TimekeeperMessage.from(value);

			if (message instanceof DiscoveryMessage) {
				output.debug('[NotePADD/Timekeeper]', 'Discovery requested.');
				onTimekeeperStarted.fire();
			} else if (message instanceof TriggerMessage) {
				// FIXME: Implement trigger message
				output.debug(
					'[NotePADD/Bookkeeper]',
					'Trigger message is not implemented.',
				);
			} else if (message instanceof LogMessage) {
				output[message.level](
					'[NotePADD/Timekeeper/ipc]',
					...message.items,
				);
			} else if (message instanceof ListMessage) {
				// FIXME: Implement list message
				output.debug(
					'[NotePADD/Bookkeeper]',
					'List message is not implemented.',
				);
			} else {
				throw new TypeError(
					`Unknown timekeeper message: ${JSON.stringify(message, undefined, 2)}`,
				);
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
					new UpdateMessage(Object.fromEntries(this._queue), true),
				),
			);

			this._queue.clear();
		}, updateDebounceDelay);
	}

	private _updateStatus() {
		onStatusUpdated.fire({
			timekeeperHealth: this._health,
		});
	}
}
