import {uint8ArrayToString} from 'uint8array-extras';
import {
	workspace,
	type FileSystemWatcher,
	type Uri,
	type Disposable,
} from 'vscode';
import {
	onBookkeeperCached,
	onBookkeeperUpdated,
	onStatusUpdated,
	onTimekeeperStarted,
	type NotepaddStatus,
} from './bus.ts';
import {output} from './output.ts';

const filePattern = '**/*.np.md';

export class Bookkeeper implements Disposable {
	private readonly _handlers = [
		onTimekeeperStarted.event(() => {
			onBookkeeperCached.fire(this._cache);
		}),
	] as const;

	private _initializing = false;
	private _watcher: FileSystemWatcher | undefined;
	private readonly _cache = new Map<string, string>();

	constructor() {
		this._updateStatus();
	}

	async initialize(): Promise<this> {
		if (this._initializing && this._watcher) {
			throw new Error(
				'Bug: Tried to initialize bookkeeper multiple times',
			);
		}

		try {
			this._initializing = true;
			this._updateStatus();
			await this._populateCache();
			await this._setupWatcher();
		} finally {
			this._initializing = false;
			this._updateStatus();
		}

		onBookkeeperCached.fire(this._cache);
		return this;
	}

	dispose(): void {
		for (const item of this._handlers) {
			item.dispose();
		}

		this._watcher?.dispose();
		this._cache.clear();
	}

	private async _populateCache(): Promise<void> {
		const files = await workspace.findFiles(filePattern);

		for (const item of files) {
			try {
				const content = await workspace.fs.readFile(item);
				const text = uint8ArrayToString(content);
				this._cache.set(item.toString(), text);
			} catch (error) {
				output.error('[NotePADD/Bookkeeper]', error);
			}
		}
	}

	private async _setupWatcher(): Promise<void> {
		this._watcher = workspace.createFileSystemWatcher(filePattern);

		this._watcher.onDidCreate((uri) => {
			void this._updateFile(uri);
		});

		this._watcher.onDidChange((uri) => {
			void this._updateFile(uri);
		});

		this._watcher.onDidDelete((uri) => {
			this._deleteFile(uri);
		});
	}

	private async _updateFile(uri: Uri): Promise<void> {
		const content = await workspace.fs.readFile(uri);
		const text = uint8ArrayToString(content);
		const fileUrl = uri.toString();
		this._cache.set(fileUrl, text);
		onBookkeeperUpdated.fire([fileUrl, text]);
	}

	private _deleteFile(uri: Uri): void {
		const fileUrl = uri.toString();
		this._cache.delete(fileUrl);
		onBookkeeperUpdated.fire([fileUrl, '']);
	}

	private _updateStatus(): void {
		let health: NotepaddStatus['bookkeeperHealth'];

		if (this._watcher) {
			health = 'active';
		} else if (this._initializing) {
			health = 'starting';
		} else {
			health = 'error';
		}

		onStatusUpdated.fire({
			bookkeeperHealth: health,
		});
	}
}
