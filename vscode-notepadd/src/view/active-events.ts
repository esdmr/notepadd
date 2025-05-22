import {filterMap} from 'notepadd-core';
import type {DirectiveState} from 'notepadd-timekeeper';
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

	protected override _getItems() {
		return filterMap(
			this._items,
			([, directive]) =>
				directive.lastState?.instance.currentState === 'high',
		);
	}
}
