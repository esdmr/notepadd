import {
	EventEmitter,
	window,
	type Disposable,
	type ProviderResult,
	type TreeDataProvider,
	type TreeItem,
} from 'vscode';
import {
	bridgeSocket,
	onTimekeeperStalled,
	onTimekeeperTriggered,
	onTimekeeperUpdated,
} from '../bus.ts';
import {output} from '../output.ts';
import {BridgeInstance} from '../tree-item/instance.ts';

type PastAlarmsTreeItem = BridgeInstance;

export class PastAlarmsView
	implements TreeDataProvider<PastAlarmsTreeItem>, Disposable
{
	private readonly _treeView;

	private readonly _handlers = [
		onTimekeeperUpdated.event(() => {
			if (!this._connection) return;
			this._stalled = false;
			this._setStatus();
			this._didChangeTreeData.fire();
			output.trace('[NotePADD/Bridge/Past Alarms]', 'Marked as running.');
		}),
		onTimekeeperTriggered.event((state) => {
			if (state.instance.currentState !== 'pulse') return;

			this._items.unshift(new BridgeInstance(state));

			if (this._items.length > 50) {
				this._items.length = 50;
			}

			this._setStatus();
			this._didChangeTreeData.fire();
			output.trace('[NotePADD/Bridge/Past Alarms]', 'Updated.');
		}),
		onTimekeeperStalled.event(() => {
			this._stalled = true;
			this._setStatus();
			this._didChangeTreeData.fire();
			output.trace('[NotePADD/Bridge/Past Alarms]', 'Marked as stalled.');
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
	private readonly _items: PastAlarmsTreeItem[] = [];

	constructor() {
		this._treeView = window.createTreeView('notepadd-past-alarms', {
			treeDataProvider: this,
		});
		this._handlers.push(
			this._treeView.onDidChangeVisibility((event) => {
				this._setConnected(event.visible);
			}),
		);
		this._setConnected(this._treeView.visible);
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
		return this._items;
	}

	private _setConnected(connected: boolean) {
		const changed = Boolean(connected) !== Boolean(this._connection);

		if (connected && !this._connection) {
			this._connection = bridgeSocket.connect();
			output.debug('[NotePADD/Bridge/Past Alarms]', 'Connected.');
		} else if (!connected && this._connection) {
			this._connection.dispose();
			this._connection = undefined;
			this._items.length = 0;
			output.debug('[NotePADD/Bridge/Past Alarms]', 'Disconnected.');
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
