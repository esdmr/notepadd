import {createInterface} from 'node:readline';
import {execaNode, type Options, type ResultPromise} from 'execa';
import {
	BookkeeperMessage,
	DiscoveryMessage,
	TimekeeperMessage,
	TriggerMessage,
	UpdateMessage,
	type TimekeeperMessageChild,
} from 'notepadd-timekeeper';
import timekeeperPath from 'notepadd-timekeeper/service?child-process';
import {
	type Disposable,
	StatusBarAlignment,
	window,
	type ExtensionContext,
	commands,
	MarkdownString,
	ThemeColor,
	workspace,
	type FileSystemWatcher,
	type Uri,
} from 'vscode';
import {uint8ArrayToString} from 'uint8array-extras';
import {LogMessage} from '../../notepadd-timekeeper/src/messages/log.ts';
import {TerminateMessage} from '../../notepadd-timekeeper/src/messages/terminate.ts';
import {output} from './output.ts';

const execaOptions = {
	ipc: true,
	serialization: 'json',
	forceKillAfterDelay: 1000,
	reject: false,
} satisfies Options;

const filePattern = '**/*.md';
const timekeeperUpdateDebounceDelay = 17;

function hashUri(uri: Uri) {
	return `${uri.scheme}:${uri.fsPath}`;
}

class Bookkeeper implements Disposable {
	private readonly _status = window.createStatusBarItem(
		StatusBarAlignment.Left,
	);

	private readonly _commands = [
		commands.registerCommand('notepadd.restartTimekeeper', async () => {
			await this.stopTimekeeper();
			this.startTimekeeper();
		}),
		commands.registerCommand('notepadd.startTimekeeper', () => {
			this.startTimekeeper();
		}),
		commands.registerCommand('notepadd.stopTimekeeper', async () => {
			await this.stopTimekeeper();
		}),
	] as const;

	private _bookkeeperInitializing = false;
	private _bookkeeperWatcher: FileSystemWatcher | undefined;
	private readonly _bookkeeperCache = new Map<string, string>();

	private _timekeeper: ResultPromise<typeof execaOptions> | undefined;
	private _timekeeperHealth: 'running' | 'starting' | 'error' | 'stopped' =
		'stopped';

	private readonly _timekeeperQueue = new Map<string, string>();

	private _timekeeperTimeout: ReturnType<typeof setTimeout> | undefined;

	constructor() {
		this._updateStatus();
	}

	async initialize() {
		if (this._bookkeeperInitializing && this._bookkeeperWatcher) {
			throw new Error('Tried to initialize bookkeeper multiple times');
		}

		try {
			this._bookkeeperInitializing = true;
			this._updateStatus();
			await this._populateCache();
			await this._setupWatcher();
		} finally {
			this._bookkeeperInitializing = false;
			this._updateStatus();
		}
	}

	startTimekeeper() {
		if (!this._bookkeeperWatcher || this._timekeeper) return;

		this._timekeeper = execaNode(timekeeperPath, execaOptions);

		createInterface(this._timekeeper.stdout).on('line', (line) => {
			output.debug('[NotePADD/Timekeeper/1]', line);
		});

		createInterface(this._timekeeper.stderr).on('line', (line) => {
			output.error('[NotePADD/Timekeeper/2]', line);
		});

		this._timekeeper.on('message', (value) => {
			if (this._timekeeperHealth !== 'running') {
				this._timekeeperHealth = 'running';
				this._updateStatus();
			}

			const {message} = TimekeeperMessage.from(value);

			if (message instanceof DiscoveryMessage) {
				output.debug('[NotePADD/Timekeeper]', 'Discovery requested.');

				this._timekeeper!.send(
					new BookkeeperMessage(
						new UpdateMessage(
							Object.fromEntries(this._bookkeeperCache),
						),
					),
				);
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
			} else {
				throw new TypeError(
					`Unknown timekeeper message: ${JSON.stringify(message, undefined, 2)}`,
				);
			}
		});

		this._timekeeper.on('error', () => {
			this._timekeeper = undefined;
			this._timekeeperHealth = 'error';
			this._updateStatus();
		});

		this._timekeeper.on('exit', (code) => {
			if (code !== 0) {
				this._timekeeper = undefined;
				this._timekeeperHealth = 'error';
				this._updateStatus();
				return;
			}

			// In case error event was emitted first, skip the exit event.
			if (!this._timekeeper) return;

			this._timekeeper = undefined;
			this._timekeeperHealth = 'stopped';
			this._updateStatus();
		});

		this._timekeeperHealth = 'starting';
		this._updateStatus();
	}

	async stopTimekeeper() {
		if (!this._timekeeper) return;

		this._timekeeper.send(new BookkeeperMessage(new TerminateMessage()));

		const timeout = setTimeout(() => {
			this._timekeeper?.kill();
		}, execaOptions.forceKillAfterDelay);

		await this._timekeeper;

		clearTimeout(timeout);
	}

	dispose() {
		for (const item of this._commands) {
			item.dispose();
		}

		void this.stopTimekeeper();
		this._bookkeeperWatcher?.dispose();
		this._bookkeeperCache.clear();
		this._status.dispose();
	}

	private async _populateCache() {
		const files = await workspace.findFiles(filePattern);

		for (const item of files) {
			try {
				// eslint-disable-next-line no-await-in-loop
				const content = await workspace.fs.readFile(item);
				const text = uint8ArrayToString(content);
				this._bookkeeperCache.set(hashUri(item), text);
			} catch (error) {
				output.error('[NotePADD/Bookkeeper]', error);
			}
		}
	}

	private async _setupWatcher() {
		this._bookkeeperWatcher =
			workspace.createFileSystemWatcher(filePattern);

		this._bookkeeperWatcher.onDidCreate((uri) => {
			void this._updateFile(uri);
		});

		this._bookkeeperWatcher.onDidChange((uri) => {
			void this._updateFile(uri);
		});

		this._bookkeeperWatcher.onDidDelete((uri) => {
			this._deleteFile(uri);
		});
	}

	private async _updateFile(uri: Uri) {
		const content = await workspace.fs.readFile(uri);
		const text = uint8ArrayToString(content);
		const hashed = hashUri(uri);
		this._bookkeeperCache.set(hashed, text);
		this._timekeeperQueue.set(hashed, text);
		this._queueTimekeeperUpdate();
	}

	private _deleteFile(uri: Uri) {
		const hashed = hashUri(uri);
		this._bookkeeperCache.delete(hashed);
		this._timekeeperQueue.set(hashed, '');
		this._queueTimekeeperUpdate();
	}

	private _queueTimekeeperUpdate() {
		if (!this._timekeeper) return;

		if (this._timekeeperTimeout) {
			clearTimeout(this._timekeeperTimeout);
		}

		this._timekeeperTimeout = setTimeout(() => {
			if (!this._timekeeper) return;

			this._timekeeper.send(
				new BookkeeperMessage(
					new UpdateMessage(
						Object.fromEntries(this._timekeeperQueue),
					),
				),
			);

			this._timekeeperQueue.clear();
		}, timekeeperUpdateDebounceDelay);
	}

	private _updateStatus() {
		const tooltip = new MarkdownString('', true);
		tooltip.isTrusted = true;
		tooltip.appendMarkdown('# NotePADD Service Status');

		let command: string | undefined;
		let color: 'normal' | 'warning' | 'error' = 'normal';
		let status: 'inactive' | 'busy' | 'active' = 'inactive';

		if (this._bookkeeperWatcher) {
			tooltip.appendMarkdown('\n\nBookkeeper is $(play) **active**.');
		} else if (this._bookkeeperInitializing) {
			status = 'busy';
			tooltip.appendMarkdown(
				'\n\nBookkeeper is $(loading~spin) **starting**.',
			);
			color = 'warning';
		} else {
			tooltip.appendMarkdown(
				'\n\nBookkeeper is $(error) **faulty**.\n\n[Restart Extension Host](command:workbench.action.restartExtensionHost)',
			);
			color = 'error';
		}

		switch (this._timekeeperHealth) {
			case 'running': {
				status = 'active';
				tooltip.appendMarkdown(
					'\n\nTimekeeper is $(play) **running**.\n\n[Stop Timekeeper](command:notepadd.stopTimekeeper)\n\n[Restart Timekeeper](command:notepadd.restartTimekeeper)',
				);
				break;
			}

			case 'starting': {
				status = 'busy';
				tooltip.appendMarkdown(
					'\n\nTimekeeper is $(loading~spin) **starting**.\n\n[Stop Timekeeper](command:notepadd.stopTimekeeper)\n\n[Restart Timekeeper](command:notepadd.restartTimekeeper)',
				);
				if (color !== 'error') color = 'warning';
				break;
			}

			case 'error': {
				tooltip.appendMarkdown(
					'\n\nTimekeeper is $(error) **faulty**.\n\n[Start Timekeeper](command:notepadd.startTimekeeper)',
				);
				color = 'error';
				command = 'notepadd.startTimekeeper';
				break;
			}

			case 'stopped': {
				tooltip.appendMarkdown(
					'\n\nTimekeeper is $(circle-slash) **not running**.\n\n[Start Timekeeper](command:notepadd.startTimekeeper)',
				);
				if (color !== 'error') color = 'warning';
				command = 'notepadd.startTimekeeper';
				break;
			}
		}

		switch (color) {
			case 'normal': {
				this._status.color = undefined;
				this._status.backgroundColor = undefined;
				break;
			}

			case 'warning': {
				this._status.color = new ThemeColor(
					'statusBarItem.warningForeground',
				);
				this._status.backgroundColor = new ThemeColor(
					'statusBarItem.warningBackground',
				);
				break;
			}

			case 'error': {
				this._status.color = new ThemeColor(
					'statusBarItem.errorForeground',
				);
				this._status.backgroundColor = new ThemeColor(
					'statusBarItem.errorBackground',
				);
				break;
			}
		}

		switch (status) {
			case 'inactive': {
				this._status.text = '$(compass)';
				break;
			}

			case 'busy': {
				this._status.text = '$(compass-dot)';
				break;
			}

			case 'active': {
				this._status.text = '$(compass-active)';
				break;
			}
		}

		this._status.name = 'NotePADD Service Status';
		this._status.tooltip = tooltip;
		this._status.command = command;
		this._status.show();
	}
}

export async function setupBookkeeper(context: ExtensionContext) {
	const bookkeeper = new Bookkeeper();
	context.subscriptions.push(bookkeeper);
	await bookkeeper.initialize();
	bookkeeper.startTimekeeper();
}
