import process from 'node:process';
import {Temporal} from 'temporal-polyfill';
import {TimekeeperMessage} from './messages/index.ts';
import {TriggerMessage} from './messages/trigger.ts';
import {output} from './output.ts';
import type {DirectiveState} from './types.ts';

const maxTimeoutDelay = 0x7f_ff_ff_ff;

export function onTimeout(state: DirectiveState) {
	state.clearTimeout();
	if (!state.instance.next) return;

	const now = Temporal.Now.zonedDateTimeISO();

	if (Temporal.ZonedDateTime.compare(state.instance.next, now) <= 0) {
		state.instance = state.directive.getNextInstance(state.instance);

		if (
			state.instance.next &&
			Temporal.ZonedDateTime.compare(state.instance.next, now) <= 0
		) {
			output.warn(
				`Next instance is already in the past (${state.instance.next.toString()} ≤ ${now.toString()}). Recalculating instances. Some instances might be skipped by this. (${state.directive.toString()})`,
			);

			state.instance = state.directive.getInstance(now);
		}

		process.send!(new TimekeeperMessage(new TriggerMessage(state)));
	}

	if (state.instance.next) {
		// Recalculating `now.epochMilliseconds` here reduces the delay between
		// retrieving the current time and actually setting the timeout.
		//
		// FIXME: See if the delay is negligible.
		state.setTimeout(
			Math.min(
				state.instance.next.epochMilliseconds -
					Temporal.Now.instant().epochMilliseconds,
				maxTimeoutDelay,
			),
			onTimeout,
		);
	}
}
