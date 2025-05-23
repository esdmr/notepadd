import type {DirectiveState} from 'notepadd-timekeeper';
import {BridgeDirective} from './directive.ts';

export class BridgeInstance extends BridgeDirective {
	constructor(data: DirectiveState) {
		super(data);
		this.id = `${this.id}@${String(data.instance.previous)}`;
	}

	override setState(state: DirectiveState): void {
		super.setState(state);

		// TODO: Make locale configurable. Also make the display
		// timezone/calendar configurable.
		//
		// FIXME: This duplicates the calculation done in the overriden
		// function.
		this.description = state.instance.previous?.toLocaleString('en-GB', {
			calendar: state.instance.previous.calendarId,
		});

		this.contextValue = 'instance';
	}
}
