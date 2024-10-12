import {Temporal} from 'temporal-polyfill';
import {
	getSmallestDurationUnit,
	hasProperty,
	hasTypeBrand,
	isObject,
	multiplyDuration,
} from '../../../utils.ts';
import {Instance} from '../directive/base.ts';
import type {Directive} from '../types.ts';

export class RecurringInstant {
	static from(json: unknown) {
		try {
			if (!isObject(json)) {
				throw new TypeError('Recurring instant is not an object');
			}

			if (
				!hasTypeBrand(
					json,
					'RecurringInstant' satisfies RecurringInstant['_type'],
				)
			) {
				throw new TypeError('Object is not a recurring instant');
			}

			if (!hasProperty(json, 'first') || typeof json.first !== 'string') {
				throw new TypeError('First instant is invalid');
			}

			if (
				!hasProperty(json, 'interval') ||
				typeof json.interval !== 'string'
			) {
				throw new TypeError('Interval is invalid');
			}

			return new RecurringInstant(
				Temporal.ZonedDateTime.from(json.first),
				Temporal.Duration.from(json.interval),
				'end' in json && typeof json.end === 'string'
					? Temporal.ZonedDateTime.from(json.end)
					: undefined,
			);
		} catch (error) {
			throw new Error(
				`Cannot deserialize a recurring instant from JSON: ${JSON.stringify(json, undefined, 2)}`,
				{cause: error},
			);
		}
	}

	readonly _type = 'RecurringInstant';

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

		if (interval.blank) {
			throw new RangeError('Recurring instant has a zero interval');
		}
	}

	toString() {
		return `R/${this.first.toString()}/${this.interval.toString()}/${this.end?.toString()}`;
	}

	getInstance(now: Temporal.ZonedDateTime, directive: Directive) {
		if (this._checkBounds(now) < 0) {
			// Edge case for before recurrence starts, because the following
			// algorithm would likely estimate some instance from before the
			// start and then filter it at the bounds checking, yielding no
			// instance.
			return new Instance(directive, undefined, this.first);
		}

		const guessedInstant = this._estimateInstancePrecise(now);

		// The guessed instance might be before or after now. We will
		// distinguish it and calculate the other.
		const previous =
			Temporal.ZonedDateTime.compare(now, guessedInstant) < 0
				? guessedInstant.subtract(this.interval)
				: guessedInstant;

		const next =
			Temporal.ZonedDateTime.compare(now, guessedInstant) < 0
				? guessedInstant
				: guessedInstant.add(this.interval);

		return new Instance(
			directive,
			this._checkBounds(previous) === 0 ? previous : undefined,
			this._checkBounds(next) === 0 ? next : undefined,
		);
	}

	getNextInstance(instance: Instance) {
		const next = instance.next?.add(this.interval);

		return new Instance(
			instance.directive,
			instance.next,
			next && this._checkBounds(next) === 0 ? next : undefined,
		);
	}

	private _checkBounds(instant: Temporal.ZonedDateTime) {
		return Temporal.ZonedDateTime.compare(instant, this.first) < 0
			? -1
			: this.end && Temporal.ZonedDateTime.compare(this.end, instant) < 0
				? 1
				: 0;
	}

	private _estimateInstanceImprecise(now: Temporal.ZonedDateTime) {
		const smallestUnit = getSmallestDurationUnit(this.interval);

		// This is ‘estimated’ because it represents the interval between the first
		// two instances only, unlike `self.interval` which represents the interval
		// between any two pair of instances.
		const estimatedInterval = this.interval.total({
			unit: smallestUnit,
			relativeTo: this.first,
		});

		// This is ‘exact’ because it is nonrecurring, unlike `self.interval`.
		const deltaTime = this.first.until(now).total({
			unit: smallestUnit,
			relativeTo: this.first,
		});

		const estimatedCoefficient = Math.trunc(deltaTime / estimatedInterval);

		return this.first.add(
			multiplyDuration(this.interval, estimatedCoefficient),
		);
	}

	private _estimateInstancePrecise(now: Temporal.ZonedDateTime) {
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
				guessedInstant = guessedInstant.add(instantStep);
			} while (
				Temporal.ZonedDateTime.compare(guessedInstant, now) ===
				errorDirection
			);
		}

		return guessedInstant;
	}
}
