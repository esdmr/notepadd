import {
	commands,
	EventEmitter,
	window,
	workspace,
	type Disposable,
	type ProviderResult,
	type TreeDataProvider,
	type TreeItem,
} from 'vscode';
import {v} from 'notepadd-core';
import {
	bridgeSocket,
	onTimekeeperStalled,
	onTimekeeperTriggered,
	onTimekeeperUpdated,
} from '../bus.ts';
import {output} from '../output.ts';
import {BridgeInstance} from '../tree-item/instance.ts';

type PastAlarmsTreeItem = BridgeInstance;

const sortBySchema = v.picklist(['timeAscending', 'timeDescending']);

export type InstancesSortBy = v.InferOutput<typeof sortBySchema>;

export class PastAlarmsView
	implements TreeDataProvider<PastAlarmsTreeItem>, Disposable
{
	protected readonly _items: PastAlarmsTreeItem[] = [];
	protected readonly _configPrefix: string = 'notepadd.view.pastAlarms';
	protected readonly _contextPrefix: string = 'notepadd.pastAlarms';
	protected readonly _logPrefix: string = '[NotePADD/Bridge/Past Alarms]';
	private readonly _treeView;

	private readonly _handlers = [
		onTimekeeperUpdated.event(() => {
			if (!this._connection) return;
			this._stalled = false;
			this._setStatus();
			this._didChangeTreeData.fire();
			output.trace(this._logPrefix, 'Marked as running.');
		}),
		onTimekeeperTriggered.event((state) => {
			if (state.instance.currentState !== 'pulse') return;

			this._items.unshift(new BridgeInstance(state));

			if (this._items.length > 50) {
				this._items.length = 50;
			}

			this._setStatus();
			this._didChangeTreeData.fire();
			output.trace(this._logPrefix, 'Updated.');
		}),
		onTimekeeperStalled.event(() => {
			this._stalled = true;
			this._setStatus();
			this._didChangeTreeData.fire();
			output.trace(this._logPrefix, 'Marked as stalled.');
		}),
		workspace.onDidChangeConfiguration(async (event) => {
			if (event.affectsConfiguration(this._configPrefix)) {
				output.trace(this._logPrefix, 'Configuration changed.');

				this._didChangeTreeData.fire();

				await commands.executeCommand(
					'setContext',
					`${this._contextPrefix}.sortBy`,
					this._configSortBy,
				);
			}
		}),
	];

	// eslint-disable-next-line unicorn/prefer-event-target
	private readonly _didChangeTreeData = new EventEmitter<
		void | PastAlarmsTreeItem | PastAlarmsTreeItem[] | undefined
	>();

	get onDidChangeTreeData() {
		return this._didChangeTreeData.event;
	}

	private _connection: Disposable | undefined;
	private _stalled = true;

	constructor(viewId = 'notepadd.pastAlarms') {
		this._treeView = window.createTreeView(viewId, {
			treeDataProvider: this,
		});
		this._handlers.push(
			this._treeView.onDidChangeVisibility((event) => {
				this._setConnected(event.visible);
			}),
		);
		this._setConnected(this._treeView.visible);
	}

	private get _configSortBy() {
		return v.parse(
			sortBySchema,
			workspace
				.getConfiguration(this._configPrefix)
				.get<string>('sortBy'),
		);
	}

	async initialize() {
		await commands.executeCommand(
			'setContext',
			`${this._contextPrefix}.sortBy`,
			this._configSortBy,
		);

		return this;
	}

	dispose() {
		this._connection?.dispose();
		this._treeView.dispose();

		for (const handler of this._handlers) {
			handler.dispose();
		}
	}

	getTreeItem(element: PastAlarmsTreeItem): TreeItem | Thenable<TreeItem> {
		return element;
	}

	getChildren(
		element?: PastAlarmsTreeItem | undefined,
	): ProviderResult<PastAlarmsTreeItem[]> {
		if (element !== undefined) return;

		return this._configSortBy === 'timeAscending'
			? this._items.slice().reverse()
			: this._items;
	}

	private _setConnected(connected: boolean) {
		const changed = Boolean(connected) !== Boolean(this._connection);

		if (connected && !this._connection) {
			this._connection = bridgeSocket.connect();
			output.debug(this._logPrefix, 'Connected.');
		} else if (!connected && this._connection) {
			this._connection.dispose();
			this._connection = undefined;
			this._items.length = 0;
			output.debug(this._logPrefix, 'Disconnected.');
		}

		if (changed) {
			this._stalled = true;
			this._setStatus();
			this._didChangeTreeData.fire();
		}
	}

	private _setStatus() {
		if (this._stalled) {
			this._treeView.message =
				'Cannot update: Timekeeper is not running.';
			return;
		}

		this._treeView.message = '';
	}
}
