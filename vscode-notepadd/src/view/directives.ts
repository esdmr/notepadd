import {inspect} from 'node:util';
import {type Directive, type InstanceState} from 'notepadd-core';
import {DirectiveState} from 'notepadd-timekeeper';
import {
	type Disposable,
	EventEmitter,
	type ProviderResult,
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

const previousLabels: Record<InstanceState, string> = {
	pulse: 'Previously at',
	high: 'Started at',
	low: 'Previously ended at',
};

const nextLabels: Record<InstanceState, string> = {
	pulse: 'At',
	high: 'Ends at',
	low: 'Starts at',
};

export class BridgeDirective extends TreeItem {
	readonly directive: Directive;

	constructor(data: {directive: Directive} | DirectiveState) {
		// FIXME: Add proper instance and directive toLabel method
		super(data.directive.getLabel() ?? '[Untitled]');

		this.directive = data.directive;
		this.id = data.directive.toString();

		if (data instanceof DirectiveState) {
			this.setState(data);
		}
	}

	setState(state: DirectiveState) {
		if (state.directive.toString() !== this.id) {
			throw new Error(
				'Bug: Directive state does not belong to this bridge item',
			);
		}

		// TODO: Show a pop-up to select the source.
		const [source] = state.sources;

		if (source === undefined) {
			this.command = undefined;
		} else {
			// TODO: Add configuration to switch this to `vscode.open`. Make
			// sure to delete the URI fragments when that happens.
			this.command = {
				title: 'Open',
				command: 'notepadd.openNotebook',
				arguments: [source],
			};
		}

		// TODO: Make locale configurable. Also make the display
		// timezone/calendar configurable.
		if (state.instance.currentState === 'high') {
			this.description = state.instance.previous?.toLocaleString(
				'en-GB',
				{
					calendar: state.instance.previous.calendarId,
				},
			);
		} else {
			this.description =
				state.instance.next?.toLocaleString('en-GB', {
					calendar: state.instance.next.calendarId,
				}) ??
				state.instance.previous?.toLocaleString('en-GB', {
					calendar: state.instance.previous.calendarId,
				});
		}

		this.tooltip =
			`${this.directive.comment.join('\n')}\n` +
			(state.instance.next
				? `\n${nextLabels[state.instance.currentState]} ${state.instance.next.toLocaleString(
						'en-GB',
						{
							calendar: state.instance.next.calendarId,
						},
					)}`
				: '') +
			(state.instance.previous
				? `\n${previousLabels[state.instance.currentState]} ${state.instance.previous.toLocaleString(
						'en-GB',
						{
							calendar: state.instance.previous.calendarId,
						},
					)}`
				: '');
	}
}

type DirectivesTreeItem = BridgeDirective;

export class DirectivesView
	implements TreeDataProvider<DirectivesTreeItem>, Disposable
{
	private readonly _treeView;

	private readonly _handlers = [
		onTimekeeperUpdated.event((states) => {
			if (!this._connection) return;
			this._items.clear();

			for (const state of states) {
				this._items.set(
					state.directive.toString(),
					new BridgeDirective(state),
				);
			}

			this._stalled = false;
			this._setStatus();
			this._didChangeTreeData.fire();
			output.trace('[NotePADD/Bridge/Directives]', 'Updated all.');
		}),
		onTimekeeperTriggered.event((state) => {
			if (!this._connection) return;

			const hash = state.directive.toString();
			const treeItem = this._items.get(hash);

			if (!treeItem) {
				output.error(
					'[NotePADD/Bridge/Directives]',
					'Bug: Unknown directive was triggered:',
					hash,
				);
				output.trace(
					'[NotePADD/Bridge/Directives]',
					'Items:',
					inspect(this._items),
				);
				return;
			}

			treeItem.setState(state);
			this._setStatus();
			this._didChangeTreeData.fire(treeItem);
			output.trace('[NotePADD/Bridge/Directives]', 'Updated one.');
		}),
		onTimekeeperStalled.event(() => {
			this._stalled = true;
			this._setStatus();
			this._didChangeTreeData.fire();
			output.trace('[NotePADD/Bridge/Directives]', 'Marked as stalled.');
		}),
	];

	// eslint-disable-next-line unicorn/prefer-event-target
	private readonly _didChangeTreeData = new EventEmitter<
		void | DirectivesTreeItem | DirectivesTreeItem[] | undefined
	>();

	get onDidChangeTreeData() {
		return this._didChangeTreeData.event;
	}

	private _connection: Disposable | undefined;
	private _stalled = true;
	private readonly _items = new Map<string, DirectivesTreeItem>();

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

	getTreeItem(element: DirectivesTreeItem): TreeItem | Thenable<TreeItem> {
		return element;
	}

	getChildren(
		element?: DirectivesTreeItem | undefined,
	): ProviderResult<DirectivesTreeItem[]> {
		if (element !== undefined) return;
		return [...this._items.values()];
	}

	private _setConnected(connected: boolean) {
		const changed = Boolean(connected) !== Boolean(this._connection);

		if (connected && !this._connection) {
			this._connection = bridgeSocket.connect();
			output.debug('[NotePADD/Bridge/Directives]', 'Connected.');
		} else if (!connected && this._connection) {
			this._connection.dispose();
			this._connection = undefined;
			this._items.clear();
			output.debug('[NotePADD/Bridge/Directives]', 'Disconnected.');
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
