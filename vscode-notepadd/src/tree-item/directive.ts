import {
	type Directive,
	type DirectiveChild,
	type InstanceState,
} from 'notepadd-core';
import {DirectiveState} from 'notepadd-timekeeper';
import {ThemeIcon, TreeItem} from 'vscode';

const previousLabels: Readonly<Record<InstanceState, string>> = {
	pulse: 'Previously at',
	high: 'Started at',
	low: 'Previously ended at',
};

const nextLabels: Readonly<Record<InstanceState, string>> = {
	pulse: 'At',
	high: 'Ends at',
	low: 'Starts at',
};

const icons: Readonly<Record<DirectiveChild['_type'], string>> = {
	/* eslint-disable @typescript-eslint/naming-convention */
	OneShotAlarm: 'bell',
	RecurringAlarm: 'bell',
	Timer: 'watch',
	Reference: 'link',
	OneShotEvent: 'calendar',
	RecurringEvent: 'calendar',
	/* eslint-enable @typescript-eslint/naming-convention */
};

export class BridgeDirective extends TreeItem {
	readonly directive: Directive;
	lastState: DirectiveState | undefined;
	override id: string;

	constructor(
		data: {directive: Directive} | DirectiveState,
		id = data.directive.toString(),
	) {
		// FIXME: Add proper instance and directive toLabel method
		super(data.directive.getLabel() ?? '[Untitled]');

		this.id = id;
		this.directive = data.directive;
		this.iconPath = new ThemeIcon(icons[data.directive.directive._type]);

		if (data instanceof DirectiveState) {
			this.setState(data);
		}
	}

	setState(state: DirectiveState): void {
		if (state.directive.toString() !== this.directive.toString()) {
			throw new Error(
				'Bug: Directive state does not belong to this bridge item',
			);
		}

		this.lastState = state;

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
