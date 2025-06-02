import {inspect} from 'node:util';
import type {DirectiveState} from 'notepadd-timekeeper';
import * as v from 'valibot';
import {
	commands,
	DataTransferItem,
	EventEmitter,
	ThemeIcon,
	Uri,
	window,
	workspace,
	type CancellationToken,
	type DataTransfer,
	type Disposable,
	type ProviderResult,
	type TreeDataProvider,
	type TreeDragAndDropController,
	type TreeItem,
} from 'vscode';
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
	implements
		TreeDataProvider<DirectivesTreeItem>,
		TreeDragAndDropController<DirectivesTreeItem>,
		Disposable
{
	readonly dragMimeTypes: readonly string[] = ['text/uri-list'];
	readonly dropMimeTypes: readonly string[] = [];
	protected readonly _items = new Map<string, BridgeDirective>();
	protected readonly _configPrefix: string = 'notepadd.view.directives';
	protected readonly _contextPrefix: string = 'notepadd.directives';
	protected readonly _logPrefix: string = '[NotePADD/Bridge/Directives]';
	protected readonly _treeView;

	protected get _configSortBy(): DirectivesSortBy {
		return v.parse(
			sortBySchema,
			workspace
				.getConfiguration(this._configPrefix)
				.get<string>('sortBy'),
		);
	}

	protected get _configViewAsTree(): boolean {
		return Boolean(
			workspace
				.getConfiguration(this._configPrefix)
				.get<boolean>('viewAsTree'),
		);
	}

	// eslint-disable-next-line unicorn/prefer-event-target
	protected readonly _didChangeTreeData = new EventEmitter<
		void | DirectivesTreeItem | DirectivesTreeItem[] | undefined
	>();

	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
	get onDidChangeTreeData() {
		return this._didChangeTreeData.event;
	}

	private readonly _handlers = [
		onTimekeeperUpdated.event(async (states) => {
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
			output.trace(this._logPrefix, 'Updated all.');

			await this._setStatus();
			this._didChangeTreeData.fire();
		}),
		onTimekeeperTriggered.event(async (state) => {
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
			output.trace(this._logPrefix, 'Updated one.');

			await this._setStatus();

			this._didChangeTreeData.fire(
				stableSortBy.has(this._configSortBy) ? treeItem : undefined,
			);
		}),
		onTimekeeperStalled.event(async () => {
			this._stalled = true;
			output.trace(this._logPrefix, 'Marked as stalled.');

			await this._setStatus();
			this._didChangeTreeData.fire();
		}),
		workspace.onDidChangeConfiguration(async (event) => {
			if (event.affectsConfiguration(this._configPrefix)) {
				output.trace(this._logPrefix, 'Configuration changed.');

				await this._setStatus();
				this._didChangeTreeData.fire();
			}
		}),
	];

	private readonly _connection = bridgeSocket.connect();
	private _stalled = true;

	constructor(viewId = 'notepadd.directives') {
		this._treeView = window.createTreeView(viewId, {
			treeDataProvider: this,
			showCollapseAll: true,
			canSelectMany: true,
			dragAndDropController: this,
		});
	}

	async initialize(): Promise<this> {
		await this._setStatus();
		return this;
	}

	dispose(): void {
		this._connection.dispose();
		this._treeView.dispose();

		for (const handler of this._handlers) {
			handler.dispose();
		}
	}

	getTreeItem(element: DirectivesTreeItem): TreeItem | Thenable<TreeItem> {
		return element;
	}

	getChildren(
		element?: DirectivesTreeItem,
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

			for (const [hash, directive] of this._getItems()) {
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

		for (const item of this._getItems().values()) {
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

	handleDrag(
		source: readonly DirectivesTreeItem[],
		dataTransfer: DataTransfer,
		token: CancellationToken,
	): void {
		dataTransfer.set(
			'text/uri-list',
			new DataTransferItem(
				source
					.filter((i) => i instanceof BridgeFile)
					.map((i) => i.uri.toString())
					.join('\r\n'),
			),
		);
	}

	protected _filterState(state: DirectiveState): boolean {
		return true;
	}

	protected _getItems(): Map<string, BridgeDirective> {
		return this._items;
	}

	protected async _setStatus(): Promise<void> {
		if (this._stalled) {
			this._treeView.message =
				'Cannot update: Timekeeper is not running.';
			return;
		}

		this._treeView.message = '';

		await commands.executeCommand(
			'setContext',
			`${this._contextPrefix}.notEmpty`,
			this._getItems().size > 0,
		);

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
}
