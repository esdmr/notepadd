import {filterMap} from 'notepadd-core';
import type {DirectiveState} from 'notepadd-timekeeper';
import type {BridgeDirective} from '../tree-item/directive.ts';
import {DirectivesView} from './directives.ts';

export class ActiveEventsView extends DirectivesView {
	protected override readonly _configPrefix: string =
		'notepadd.view.activeEvents';

	protected override readonly _contextPrefix: string =
		'notepadd.activeEvents';

	protected override readonly _logPrefix: string =
		'[NotePADD/Bridge/Active Events]';

	constructor(viewId = 'notepadd.activeEvents') {
		super(viewId);
	}

	protected override _filterState(state: DirectiveState): boolean {
		return state.instance.currentState !== 'pulse';
	}

	protected override _getItems(): Map<string, BridgeDirective> {
		return filterMap(
			this._items,
			([, directive]) =>
				directive.lastState?.instance.currentState === 'high',
		);
	}

	protected override async _setStatus(): Promise<void> {
		await super._setStatus();

		const {size} = this._getItems();

		if (size === 0) {
			this._treeView.badge = undefined;
			return;
		}

		this._treeView.badge = {
			tooltip: `${size} active ${size === 1 ? 'event' : 'events'}`,
			value: size,
		};
	}
}
