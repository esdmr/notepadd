import process from 'node:process';
import {Temporal} from 'temporal-polyfill';
import {TimekeeperMessage} from './messages/index.ts';
import {TriggerMessage} from './messages/trigger.ts';
import {output} from './output.ts';
import type {DirectiveContext} from './types.ts';

const maxTimeoutDelay = 0x7f_ff_ff_ff;

export function onTimeout(this: DirectiveContext) {
	this.lastTimeout = undefined;
	if (!this.instance.next) return;

	const now = Temporal.Now.zonedDateTimeISO();

	if (Temporal.ZonedDateTime.compare(this.instance.next, now) <= 0) {
		this.instance = this.instance.directive.getNextInstance(this.instance);

		if (
			this.instance.next &&
			Temporal.ZonedDateTime.compare(this.instance.next, now) <= 0
		) {
			output.warn(
				`Next instance is already in the past (${this.instance.next.toString()} ≤ ${now.toString()}). Recalculating instances. Some instances might be skipped by this. (${this.instance.directive.toString()})`,
			);

			this.instance = this.instance.directive.getInstance(now);
		}

		process.send!(new TimekeeperMessage(new TriggerMessage(this.instance)));
	}

	if (this.instance.next) {
		// Recalculating `now.epochMilliseconds` here reduces the delay between
		// retrieving the current time and actually setting the timeout.
		//
		// FIXME: See if the delay is negligible.
		this.lastTimeout = setTimeout(
			this.onTimeout,
			Math.min(
				this.instance.next.epochMilliseconds -
					Temporal.Now.instant().epochMilliseconds,
				maxTimeoutDelay,
			),
		);
	}
}
