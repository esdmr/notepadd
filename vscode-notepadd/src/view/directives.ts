import {inspect} from 'node:util';
import * as v from 'valibot';
import {
	commands,
	EventEmitter,
	ThemeIcon,
	Uri,
	window,
	workspace,
	type Disposable,
	type ProviderResult,
	type TreeDataProvider,
	type TreeItem,
} from 'vscode';
import type {DirectiveState} from 'notepadd-timekeeper';
import {
	bridgeSocket,
	onTimekeeperStalled,
	onTimekeeperTriggered,
	onTimekeeperUpdated,
} from '../bus.ts';
import {output} from '../output.ts';
import {BridgeDirective} from '../tree-item/directive.ts';
import {BridgeDirectory} from '../tree-item/directory.ts';
import {BridgeFile} from '../tree-item/file.ts';

type DirectivesTreeItem = BridgeDirectory | BridgeFile | BridgeDirective;

const sortBySchema = v.picklist([
	'timeAscending',
	'timeDescending',
	'orderAscending',
	'orderDescending',
]);

export type DirectivesSortBy = v.InferOutput<typeof sortBySchema>;

const stableSortBy = new Set<DirectivesSortBy>([
	'orderAscending',
	'orderDescending',
]);

export class DirectivesView
	implements TreeDataProvider<DirectivesTreeItem>, Disposable
{
	protected readonly _items = new Map<string, BridgeDirective>();
	protected readonly _configPrefix: string = 'notepadd.view.directives';
	protected readonly _contextPrefix: string = 'notepadd.directives';
	protected readonly _logPrefix: string = '[NotePADD/Bridge/Directives]';
	private readonly _treeView;

	private readonly _handlers = [
		onTimekeeperUpdated.event((states) => {
			if (!this._connection) return;
			this._items.clear();

			for (const state of states) {
				if (!this._filterState(state)) continue;

				this._items.set(
					state.directive.toString(),
					new BridgeDirective(state),
				);
			}

			this._stalled = false;
			this._setStatus();
			this._didChangeTreeData.fire();
			output.trace(this._logPrefix, 'Updated all.');
		}),
		onTimekeeperTriggered.event((state) => {
			if (!this._connection || !this._filterState(state)) return;

			const hash = state.directive.toString();
			const treeItem = this._items.get(hash);

			if (!treeItem) {
				output.error(
					this._logPrefix,
					'Bug: Unknown directive was triggered:',
					hash,
				);
				output.trace(this._logPrefix, 'Items:', inspect(this._items));
				return;
			}

			treeItem.setState(state);
			this._setStatus();

			this._didChangeTreeData.fire(
				stableSortBy.has(this._configSortBy) ? treeItem : undefined,
			);

			output.trace(this._logPrefix, 'Updated one.');
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

				await commands.executeCommand(
					'setContext',
					`${this._contextPrefix}.viewAsTree`,
					this._configViewAsTree,
				);
			}
		}),
	];

	private get _configSortBy() {
		return v.parse(
			sortBySchema,
			workspace
				.getConfiguration(this._configPrefix)
				.get<string>('sortBy'),
		);
	}

	private get _configViewAsTree() {
		return Boolean(
			workspace
				.getConfiguration(this._configPrefix)
				.get<boolean>('viewAsTree'),
		);
	}

	// eslint-disable-next-line unicorn/prefer-event-target
	private readonly _didChangeTreeData = new EventEmitter<
		void | DirectivesTreeItem | DirectivesTreeItem[] | undefined
	>();

	get onDidChangeTreeData() {
		return this._didChangeTreeData.event;
	}

	private _connection: Disposable | undefined;
	private _stalled = true;

	constructor(viewId = 'notepadd.directives') {
		this._treeView = window.createTreeView(viewId, {
			treeDataProvider: this,
			showCollapseAll: true,
		});
		this._handlers.push(
			this._treeView.onDidChangeVisibility((event) => {
				this._setConnected(event.visible);
			}),
		);
		this._setConnected(this._treeView.visible);
	}

	async initialize() {
		await commands.executeCommand(
			'setContext',
			`${this._contextPrefix}.sortBy`,
			this._configSortBy,
		);

		await commands.executeCommand(
			'setContext',
			`${this._contextPrefix}.viewAsTree`,
			this._configViewAsTree,
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

	getTreeItem(element: DirectivesTreeItem): TreeItem | Thenable<TreeItem> {
		return element;
	}

	getChildren(
		element?: DirectivesTreeItem | undefined,
	): ProviderResult<DirectivesTreeItem[]> {
		if (element instanceof BridgeDirective) return;

		if (
			element instanceof BridgeFile ||
			element instanceof BridgeDirectory
		) {
			return element.getChildren();
		}

		output.trace(
			this._logPrefix,
			`Generating a ${this._configViewAsTree ? 'tree' : 'list'}, sorted by ${this._configSortBy}`,
		);

		if (!this._configViewAsTree) {
			const root = new BridgeFile(Uri.from({scheme: 'placeholder'}));

			for (const [hash, directive] of this._items) {
				root.children.set(
					Uri.from({scheme: 'placeholder', path: hash}).toString(
						true,
					),
					directive,
				);
			}

			root.updateOrder(this._configSortBy);
			return root.getChildren();
		}

		const files = new Map<string, BridgeFile>();
		const directories = new Map<string, BridgeDirectory>();
		const root = new BridgeDirectory(Uri.from({scheme: 'placeholder'}));

		for (const item of this._items.values()) {
			if (!item.lastState) continue;

			for (const source of item.lastState.sources) {
				const fileItem = new BridgeDirective(item.lastState, source);

				const fileUri = Uri.parse(source, true).with({fragment: ''});

				const file =
					files.get(fileUri.toString(true)) ??
					new BridgeFile(fileUri);

				file.children.set(source, fileItem);
				files.set(file.href, file);

				const rootHref = workspace
					.getWorkspaceFolder(fileUri)
					?.uri.toString(true);

				let node: BridgeDirectory | BridgeFile = file;

				do {
					const uri = Uri.joinPath(node.uri, '..');

					const parent =
						directories.get(uri.toString(true)) ??
						new BridgeDirectory(uri);

					if (parent.href === node.href) break;

					parent.children.set(node.href, node);
					directories.set(parent.href, parent);
					node = parent;
				} while (node.href !== rootHref);

				if (node.href === rootHref) {
					node.iconPath = new ThemeIcon('repo');
				}

				root.children.set(node.href, node);
			}
		}

		root.updateOrder(this._configSortBy);
		const children = root.getChildren();

		return children.length === 1 && workspace.workspaceFolders?.length === 1
			? children[0]!.getChildren()
			: children;
	}

	protected _filterState(state: DirectiveState): boolean {
		return true;
	}

	protected _getItems(): Map<string, BridgeDirective> {
		return this._items;
	}

	private _setConnected(connected: boolean) {
		const changed = Boolean(connected) !== Boolean(this._connection);

		if (connected && !this._connection) {
			this._connection = bridgeSocket.connect();
			output.debug(this._logPrefix, 'Connected.');
		} else if (!connected && this._connection) {
			this._connection.dispose();
			this._connection = undefined;
			this._items.clear();
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
