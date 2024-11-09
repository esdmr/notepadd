import {inspect} from 'node:util';
import {type Directive, type Instance} from 'notepadd-core';
import {
	commands,
	type Disposable,
	EventEmitter,
	type ProviderResult,
	ThemeColor,
	ThemeIcon,
	type TreeDataProvider,
	TreeItem,
	window,
} from 'vscode';
import {
	bridgeSocket,
	onTimekeeperStalled,
	onTimekeeperTriggered,
	onTimekeeperUpdated,
} from '../bus.ts';
import {output} from '../output.ts';

class BridgeInstance extends TreeItem {
	static of(instance: Instance) {
		return new BridgeInstance(instance.directive, instance);
	}

	constructor(
		readonly directive: Directive,
		instance?: Instance,
	) {
		// FIXME: Add proper instance and directive toLabel method
		super(directive.getLabel() ?? '[Untitled]');

		this.id = directive.toString();

		if (directive.fileUrl) {
			// TODO: Add configuration to switch this to `vscode.open`. Make
			// sure to delete the URI fragments when that happens.
			this.command = {
				title: 'Open',
				command: 'notepadd.openNotebook',
				arguments: [directive.fileUrl],
			};
		}

		if (instance) {
			this.setInstance(instance);
		}
	}

	setInstance(instance: Instance) {
		if (instance.directive.toString() !== this.id) {
			throw new Error('Instance does not belong to this directive');
		}

		// TODO: Make locale configurable
		this.description =
			instance.next?.toLocaleString('en-GB', {
				calendar: instance.next.calendarId,
			}) ??
			instance.previous?.toLocaleString('en-GB', {
				calendar: instance.previous.calendarId,
			});
	}
}

type BridgeTreeItem = BridgeInstance;

export class NotepaddBridgeView
	implements TreeDataProvider<BridgeTreeItem>, Disposable
{
	private readonly _treeView;

	private readonly _handlers = [
		onTimekeeperUpdated.event((instances) => {
			if (!this._connection) return;
			this._items.clear();

			for (const instance of instances) {
				this._items.set(
					instance.directive.toString(),
					BridgeInstance.of(instance),
				);
			}

			this._stalled = false;
			this._setStatus();
			this._didChangeTreeData.fire();
			output.trace('[NotePADD/Bridge]', 'Updated all.');
		}),
		onTimekeeperTriggered.event((instance) => {
			if (!this._connection) return;

			const hash = instance.directive.toString();
			const treeItem = this._items.get(hash);

			if (!treeItem) {
				output.error(
					'[NotePADD/Bridge]',
					'Bug: Unknown directive was triggered:',
					hash,
				);
				output.trace(
					'[NotePADD/Bridge]',
					'Items:',
					inspect(this._items),
				);
				return;
			}

			treeItem.setInstance(instance);
			this._setStatus();
			this._didChangeTreeData.fire(treeItem);
			output.trace('[NotePADD/Bridge]', 'Updated one.');
		}),
		onTimekeeperStalled.event(() => {
			this._stalled = true;
			this._setStatus();
			this._didChangeTreeData.fire();
			output.trace('[NotePADD/Bridge]', 'Marked as stalled.');
		}),
	];

	// eslint-disable-next-line unicorn/prefer-event-target
	private readonly _didChangeTreeData = new EventEmitter<
		void | BridgeTreeItem | BridgeTreeItem[] | undefined
	>();

	get onDidChangeTreeData() {
		return this._didChangeTreeData.event;
	}

	private _connection: Disposable | undefined;
	private _stalled = true;
	private readonly _items = new Map<string, BridgeTreeItem>();

	constructor() {
		this._treeView = window.createTreeView('notepadd-directives', {
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

	getTreeItem(element: BridgeTreeItem): TreeItem | Thenable<TreeItem> {
		return element;
	}

	getChildren(
		element?: BridgeTreeItem | undefined,
	): ProviderResult<BridgeTreeItem[]> {
		if (element !== undefined) return;
		return [...this._items.values()];
	}

	private _setConnected(connected: boolean) {
		const changed = Boolean(connected) !== Boolean(this._connection);

		if (connected && !this._connection) {
			this._connection = bridgeSocket.connect();
			output.debug('[NotePADD/Bridge]', 'Connected.');
		} else if (!connected && this._connection) {
			this._connection.dispose();
			this._connection = undefined;
			this._items.clear();
			output.debug('[NotePADD/Bridge]', 'Disconnected.');
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
