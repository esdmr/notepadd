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
import * as v from 'valibot';
import {
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
			this._stalled = false;
			this._setStatus();
			this._didChangeTreeData.fire();
			output.trace(this._logPrefix, 'Marked as running.');
		}),
		onTimekeeperTriggered.event((state) => {
			if (state.instance.currentState !== 'pulse') return;

			this._items.unshift(new BridgeInstance(state));

			// TODO: Make configurable.
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
		commands.registerCommand('notepadd.pastAlarms.clear', () => {
			this._items.length = 0;
			this._didChangeTreeData.fire();
		}),
		commands.registerCommand(
			'notepadd.pastAlarms.dismiss',
			(
				currentTarget: PastAlarmsTreeItem,
				allTargets: readonly PastAlarmsTreeItem[] = [currentTarget],
			) => {
				for (const target of allTargets) {
					const index = this._items.indexOf(target);
					// If the user clicks the dismiss button repeatedly while
					// vscode has not rendered the new tree state yet, we might
					// get repeated command calls, which causes the target to
					// not be in the item anymore. Just skip it, as it is mostly
					// harmless.
					if (index === -1) continue;
					this._items.splice(index, 1);
				}

				this._didChangeTreeData.fire();
			},
		),
	];

	// eslint-disable-next-line unicorn/prefer-event-target
	private readonly _didChangeTreeData = new EventEmitter<
		void | PastAlarmsTreeItem | PastAlarmsTreeItem[] | undefined
	>();

	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
	get onDidChangeTreeData() {
		return this._didChangeTreeData.event;
	}

	private _stalled = true;

	constructor(viewId = 'notepadd.pastAlarms') {
		this._treeView = window.createTreeView(viewId, {
			treeDataProvider: this,
			canSelectMany: true,
		});
	}

	private get _configSortBy(): InstancesSortBy {
		return v.parse(
			sortBySchema,
			workspace
				.getConfiguration(this._configPrefix)
				.get<string>('sortBy'),
		);
	}

	async initialize(): Promise<this> {
		await commands.executeCommand(
			'setContext',
			`${this._contextPrefix}.sortBy`,
			this._configSortBy,
		);

		return this;
	}

	dispose(): void {
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

	private _setStatus(): void {
		if (this._stalled) {
			this._treeView.message =
				'Cannot update: Timekeeper is not running.';
			return;
		}

		this._treeView.message = '';
	}
}
