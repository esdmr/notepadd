import {inspect} from 'node:util';
import {
	type Disposable,
	EventEmitter,
	type ProviderResult,
	type TreeDataProvider,
	type TreeItem,
	window,
} from 'vscode';
import {
	bridgeSocket,
	onTimekeeperStalled,
	onTimekeeperTriggered,
	onTimekeeperUpdated,
} from '../bus.ts';
import {output} from '../output.ts';
import {BridgeDirective} from '../tree-item/directive.ts';

type ActiveEventsTreeItem = BridgeDirective;

export class ActiveEventsView
	implements TreeDataProvider<ActiveEventsTreeItem>, Disposable
{
	private readonly _treeView;

	private readonly _handlers = [
		onTimekeeperUpdated.event((states) => {
			if (!this._connection) return;
			this._items.clear();

			for (const state of states) {
				if (state.instance.currentState === 'pulse') continue;

				this._items.set(
					state.directive.toString(),
					new BridgeDirective(state),
				);
			}

			this._stalled = false;
			this._setStatus();
			this._didChangeTreeData.fire();
			output.trace('[NotePADD/Bridge/Active Events]', 'Updated.');
		}),
		onTimekeeperTriggered.event((state) => {
			if (!this._connection || state.instance.currentState === 'pulse') {
				return;
			}

			const hash = state.directive.toString();
			const treeItem = this._items.get(hash);

			if (!treeItem) {
				output.error(
					'[NotePADD/Bridge/Active Events]',
					'Bug: Unknown directive was triggered:',
					hash,
				);
				output.trace(
					'[NotePADD/Bridge/Active Events]',
					'Items:',
					inspect(this._items),
				);
				return;
			}

			treeItem.setState(state);
			this._setStatus();
			this._didChangeTreeData.fire();
			output.trace('[NotePADD/Bridge/Active Events]', 'Updated.');
		}),
		onTimekeeperStalled.event(() => {
			this._stalled = true;
			this._setStatus();
			this._didChangeTreeData.fire();
			output.trace(
				'[NotePADD/Bridge/Active Events]',
				'Marked as stalled.',
			);
		}),
	];

	// eslint-disable-next-line unicorn/prefer-event-target
	private readonly _didChangeTreeData = new EventEmitter<
		void | ActiveEventsTreeItem | ActiveEventsTreeItem[] | undefined
	>();

	get onDidChangeTreeData() {
		return this._didChangeTreeData.event;
	}

	private _connection: Disposable | undefined;
	private _stalled = true;
	private readonly _items = new Map<string, ActiveEventsTreeItem>();

	constructor() {
		this._treeView = window.createTreeView('notepadd-active-events', {
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

	getTreeItem(element: ActiveEventsTreeItem): TreeItem | Thenable<TreeItem> {
		return element;
	}

	getChildren(
		element?: ActiveEventsTreeItem | undefined,
	): ProviderResult<ActiveEventsTreeItem[]> {
		if (element !== undefined) return;
		return [...this._items.values()].filter(
			(i) => i.lastState?.instance.currentState === 'high',
		);
	}

	private _setConnected(connected: boolean) {
		const changed = Boolean(connected) !== Boolean(this._connection);

		if (connected && !this._connection) {
			this._connection = bridgeSocket.connect();
			output.debug('[NotePADD/Bridge/Active Events]', 'Connected.');
		} else if (!connected && this._connection) {
			this._connection.dispose();
			this._connection = undefined;
			this._items.clear();
			output.debug('[NotePADD/Bridge/Active Events]', 'Disconnected.');
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
