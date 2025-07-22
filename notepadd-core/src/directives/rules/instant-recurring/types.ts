import {Temporal} from 'temporal-polyfill';
import * as v from 'valibot';
import {
	durationSchema,
	transformFallible,
	getDiscriminator,
	getSmallestDurationUnit,
	multiplyDuration,
	zonedDateTimeSchema,
	addZdtNegativeSafe,
} from '../../../utils.ts';
import {Instance} from '../directive/base.ts';

export class RecurringInstant {
	static readonly schema = v.pipe(
		v.object({
			_type: v.literal('RecurringInstant'),
			first: zonedDateTimeSchema,
			interval: durationSchema,
			end: v.optional(zonedDateTimeSchema),
		}),
		transformFallible(
			(i) => new RecurringInstant(i.first, i.interval, i.end),
		),
	);

	readonly _type = getDiscriminator(RecurringInstant);

	constructor(
		readonly first: Temporal.ZonedDateTime,
		readonly interval: Temporal.Duration,
		readonly end?: Temporal.ZonedDateTime,
	) {
		if (end && Temporal.ZonedDateTime.compare(end, first) < 0) {
			throw new RangeError(
				`Recurring instant ends (${end.toString()}) before it starts (${first.toString()})`,
			);
		}

		if (interval.sign <= 0) {
			throw new RangeError(
				'Recurring instant has a non-positive interval',
			);
		}
	}

	toString(): string {
		return `R/${this.first.toString()}/${this.interval.toString()}/${this.end?.toString()}`;
	}

	getInstance(now: Temporal.ZonedDateTime): Instance {
		switch (this._checkBounds(now)) {
			case -1: {
				// Edge case for before recurrence starts, because the following
				// algorithm would likely estimate some instance from before the
				// start and then filter it at the bounds checking, yielding no
				// instance.
				return new Instance(undefined, this.first);
			}

			case 0: {
				break;
			}

			case 1: {
				// Edge case for after recurrence ends, similar to above.
				// However, since the last instance may be before the end of
				// recurrence, we must calculate it and cannot return early.
				// This case can only happen if the recurrence ends.
				now = this.end!;
			}
		}

		const guessedInstant = this._estimateInstancePrecise(now);

		// The guessed instance might be before or after now. We will
		// distinguish it and calculate the other.
		const previous =
			Temporal.ZonedDateTime.compare(now, guessedInstant) < 0
				? addZdtNegativeSafe(guessedInstant, this.interval.negated())
				: guessedInstant;

		const next =
			Temporal.ZonedDateTime.compare(now, guessedInstant) < 0
				? guessedInstant
				: guessedInstant.add(this.interval);

		return new Instance(
			this._checkBounds(previous) === 0 ? previous : undefined,
			this._checkBounds(next) === 0 ? next : undefined,
		);
	}

	getNextInstance(instance: Instance): Instance {
		if (!instance.next) return instance;

		const next = instance.next.add(this.interval);

		return new Instance(
			instance.next,
			this._checkBounds(next) === 0 ? next : undefined,
		);
	}

	private _checkBounds(
		instant: Temporal.ZonedDateTime,
	): Temporal.ComparisonResult {
		return Temporal.ZonedDateTime.compare(instant, this.first) < 0
			? -1
			: this.end && Temporal.ZonedDateTime.compare(this.end, instant) < 0
				? 1
				: 0;
	}

	private _estimateInstanceImprecise(
		now: Temporal.ZonedDateTime,
	): Temporal.ZonedDateTime {
		const smallestUnit = getSmallestDurationUnit(this.interval);

		// This is ‘estimated’ because it represents the interval between the first
		// two instances only, unlike `self.interval` which represents the interval
		// between any two pair of instances.
		const estimatedInterval = this.interval.total({
			unit: smallestUnit,
			relativeTo: this.first,
		});

		// This is ‘exact’ because it is nonrecurring, unlike `self.interval`.
		const deltaTime = this.first
			.until(now.withCalendar(this.first.calendarId))
			.total({
				unit: smallestUnit,
				relativeTo: this.first,
			});

		const estimatedCoefficient = Math.trunc(deltaTime / estimatedInterval);

		return addZdtNegativeSafe(
			this.first,
			multiplyDuration(this.interval, estimatedCoefficient),
		);
	}

	private _estimateInstancePrecise(
		now: Temporal.ZonedDateTime,
	): Temporal.ZonedDateTime {
		let guessedInstant = this._estimateInstanceImprecise(now);

		const errorDirection = Temporal.ZonedDateTime.compare(
			guessedInstant,
			now,
		);

		// We will compensate for the estimation inaccuracy. This will adjust the
		// instant to the closest instance before or after now.
		if (errorDirection !== 0) {
			const instantStep =
				errorDirection > 0 ? this.interval.negated() : this.interval;

			do {
				guessedInstant = addZdtNegativeSafe(
					guessedInstant,
					instantStep,
				);
			} while (
				Temporal.ZonedDateTime.compare(guessedInstant, now) ===
				errorDirection
			);
		}

		return guessedInstant;
	}
}
