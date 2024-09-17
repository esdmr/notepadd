import {Temporal} from 'temporal-polyfill';
import type {JsonValue} from 'type-fest';
import type {DirectiveNode} from './ast.ts';

export class Period {
	readonly _type = 'Period';

	constructor(
		readonly start: Temporal.ZonedDateTime,
		readonly endOrDuration: Temporal.ZonedDateTime | Temporal.Duration,
	) {
		const end = periodGetEnd(this);

		if (Temporal.ZonedDateTime.compare(end, start) <= 0) {
			throw new RangeError(
				`Period ends (${end.toString()}) before it starts (${start.toString()})`,
			);
		}
	}
}

export function periodFrom(json: JsonValue) {
	if (
		typeof json !== 'object' ||
		!json ||
		!('_type' in json) ||
		json._type !== 'Period' ||
		typeof json.start !== 'string' ||
		typeof json.endOrDuration !== 'string'
	) {
		throw new Error(
			`Cannot deserialize a period from JSON: ${JSON.stringify(json)}`,
		);
	}

	return new Period(
		Temporal.ZonedDateTime.from(json.start),
		json.endOrDuration.startsWith('P')
			? Temporal.Duration.from(json.endOrDuration)
			: Temporal.ZonedDateTime.from(json.endOrDuration),
	);
}

export function periodGetEnd(self: Period) {
	return self.endOrDuration instanceof Temporal.ZonedDateTime
		? self.endOrDuration
		: self.start.add(self.endOrDuration);
}

export function periodGetDuration(self: Period) {
	return self.endOrDuration instanceof Temporal.Duration
		? self.endOrDuration
		: self.start.until(self.endOrDuration);
}

export function periodCompare(self: Period, other: Temporal.ZonedDateTime) {
	const end = periodGetEnd(self);

	const isBeforeStart = Temporal.ZonedDateTime.compare(other, self.start) < 0;
	const isAfterEnd = Temporal.ZonedDateTime.compare(end, other) <= 0;

	return isBeforeStart ? -1 : isAfterEnd ? 1 : 0;
}

export class RecurringInstant {
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

		if (Temporal.ZonedDateTime.compare(first.add(interval), first) <= 0) {
			throw new RangeError(
				`Recurring instant has a non-positive interval (${interval.toString()})`,
			);
		}
	}
}

export function recurringInstantFrom(json: JsonValue) {
	if (
		typeof json !== 'object' ||
		!json ||
		!('_type' in json) ||
		json._type !== 'RecurringInstant' ||
		typeof json.first !== 'string' ||
		typeof json.interval !== 'string'
	) {
		throw new Error(
			`Cannot deserialize a recurring instant from JSON: ${JSON.stringify(json)}`,
		);
	}

	return new RecurringInstant(
		Temporal.ZonedDateTime.from(json.first),
		Temporal.Duration.from(json.interval),
		typeof json.end === 'string'
			? Temporal.ZonedDateTime.from(json.end)
			: undefined,
	);
}

export function getSmallestDurationUnit(duration: Temporal.Duration) {
	if (duration.nanoseconds !== 0) return 'nanoseconds';
	if (duration.microseconds !== 0) return 'microseconds';
	if (duration.milliseconds !== 0) return 'milliseconds';
	if (duration.seconds !== 0) return 'seconds';
	if (duration.minutes !== 0) return 'minutes';
	if (duration.hours !== 0) return 'hours';
	if (duration.days !== 0) return 'days';
	if (duration.weeks !== 0) return 'weeks';
	if (duration.months !== 0) return 'months';
	return 'years';
}

export function multiplyDuration(
	duration: Temporal.Duration,
	coefficient: number,
) {
	return coefficient === 1
		? duration
		: new Temporal.Duration(
				duration.years * coefficient,
				duration.months * coefficient,
				duration.weeks * coefficient,
				duration.days * coefficient,
				duration.hours * coefficient,
				duration.minutes * coefficient,
				duration.seconds * coefficient,
				duration.milliseconds * coefficient,
				duration.microseconds * coefficient,
				duration.nanoseconds * coefficient,
			);
}

function recurringInstantCheckBounds(
	self: RecurringInstant,
	other: Temporal.ZonedDateTime,
) {
	return Temporal.ZonedDateTime.compare(other, self.first) < 0
		? -1
		: self.end && Temporal.ZonedDateTime.compare(self.end, other) < 0
			? 1
			: 0;
}

function recurringInstantEstimateInstanceImprecise(
	self: RecurringInstant,
	now: Temporal.ZonedDateTime,
) {
	const smallestUnit = getSmallestDurationUnit(self.interval);

	// This is ‘estimated’ because it represents the interval between the first
	// two instances only, unlike `self.interval` which represents the interval
	// between any two pair of instances.
	const estimatedInterval = self.interval.total({
		unit: smallestUnit,
		relativeTo: self.first,
	});

	// This is ‘exact’ because it is nonrecurring, unlike `self.interval`.
	const deltaTime = self.first.until(now).total({
		unit: smallestUnit,
		relativeTo: self.first,
	});

	const estimatedCoefficient = Math.trunc(deltaTime / estimatedInterval);

	return self.first.add(
		multiplyDuration(self.interval, estimatedCoefficient),
	);
}

function recurringInstantEstimateInstancePrecise(
	self: RecurringInstant,
	now: Temporal.ZonedDateTime,
) {
	let guessedInstant = recurringInstantEstimateInstanceImprecise(self, now);
	const errorDirection = Temporal.ZonedDateTime.compare(guessedInstant, now);

	// We will compensate for the estimation inaccuracy. This will adjust the
	// instant to the closest instance before or after now.
	if (errorDirection !== 0) {
		const instantStep =
			errorDirection > 0 ? self.interval.negated() : self.interval;

		do {
			guessedInstant = guessedInstant.add(instantStep);
		} while (
			Temporal.ZonedDateTime.compare(guessedInstant, now) ===
			errorDirection
		);
	}

	return guessedInstant;
}

export function recurringInstantGetInstance(
	self: RecurringInstant,
	now: Temporal.ZonedDateTime,
) {
	const guessedInstant = recurringInstantEstimateInstancePrecise(self, now);

	let previous;
	let next;

	// The guessed instance might be before or after now. We will distinguish it
	// and calculate the other.
	if (Temporal.ZonedDateTime.compare(now, guessedInstant) < 0) {
		previous = guessedInstant.subtract(self.interval);
		next = guessedInstant;
	} else {
		previous = guessedInstant;
		next = guessedInstant.add(self.interval);
	}

	if (recurringInstantCheckBounds(self, previous) !== 0) {
		previous = undefined;
	}

	if (recurringInstantCheckBounds(self, next) !== 0) {
		next = undefined;
	}

	return {
		previous,
		next,
	};
}

export class RecurringPeriod {
	readonly _type = 'RecurringPeriod';

	constructor(
		readonly first: Period,
		readonly interval: Temporal.Duration,
		readonly end?: Temporal.ZonedDateTime,
	) {
		if (end && Temporal.ZonedDateTime.compare(end, first.start) < 0) {
			throw new RangeError(
				`Recurring period ends (${end.toString()}) before it starts (${first.start.toString()})`,
			);
		}

		if (
			Temporal.ZonedDateTime.compare(
				first.start.add(interval),
				first.start,
			) <= 0
		) {
			throw new RangeError(
				`Recurring period has a non-positive interval (${interval.toString()})`,
			);
		}
	}
}

export function recurringPeriodFrom(json: JsonValue) {
	if (
		typeof json !== 'object' ||
		!json ||
		!('_type' in json) ||
		json._type !== 'RecurringPeriod' ||
		json.first === undefined ||
		typeof json.interval !== 'string'
	) {
		throw new Error(
			`Cannot deserialize a recurring period from JSON: ${JSON.stringify(json)}`,
		);
	}

	return new RecurringPeriod(
		periodFrom(json.first),
		Temporal.Duration.from(json.interval),
		typeof json.end === 'string'
			? Temporal.ZonedDateTime.from(json.end)
			: undefined,
	);
}

function minDuration(
	one: Temporal.Duration,
	two: Temporal.Duration,
	relativeTo: Temporal.ZonedDateTime,
) {
	return Temporal.Duration.compare(one, two, {relativeTo}) < 0 ? one : two;
}

export function recurringPeriodGetInstance(
	self: RecurringPeriod,
	now: Temporal.ZonedDateTime,
) {
	const recurringInstant = new RecurringInstant(
		self.first.start,
		self.interval,
		self.end,
	);

	const {previous, next} = recurringInstantGetInstance(recurringInstant, now);
	const periodDuration = periodGetDuration(self.first);

	return {
		previous:
			previous &&
			new Period(
				previous,
				minDuration(periodDuration, self.interval, previous),
			),
		next:
			next &&
			new Period(next, minDuration(periodDuration, self.interval, next)),
	};
}

export class RecurringAlarm {
	readonly _type = 'RecurringAlarm';

	constructor(
		readonly when: RecurringInstant,
		readonly comment: string[],
	) {}
}

export function recurringAlarmFrom(json: JsonValue) {
	if (
		typeof json !== 'object' ||
		!json ||
		!('_type' in json) ||
		json._type !== 'RecurringAlarm' ||
		json.when === undefined ||
		Array.isArray(json.comment)
	) {
		throw new Error(
			`Cannot deserialize a recurring alarm from JSON: ${JSON.stringify(json)}`,
		);
	}

	return new RecurringAlarm(
		recurringInstantFrom(json.when),
		(json.comment as unknown[]).map(String),
	);
}

export class OneShotAlarm {
	readonly _type = 'OneShotAlarm';

	constructor(
		readonly when: Temporal.ZonedDateTime,
		readonly comment: string[],
	) {}
}

export function oneShotAlarmFrom(json: JsonValue) {
	if (
		typeof json !== 'object' ||
		!json ||
		!('_type' in json) ||
		json._type !== 'OneShotAlarm' ||
		typeof json.when !== 'string' ||
		Array.isArray(json.comment)
	) {
		throw new Error(
			`Cannot deserialize a one-shot alarm from JSON: ${JSON.stringify(json)}`,
		);
	}

	return new OneShotAlarm(
		Temporal.ZonedDateTime.from(json.when),
		(json.comment as unknown[]).map(String),
	);
}

export class Timer {
	readonly _type = 'Timer';

	constructor(
		readonly when: Temporal.Duration,
		readonly comment: string[],
	) {}
}

export function timerFrom(json: JsonValue) {
	if (
		typeof json !== 'object' ||
		!json ||
		!('_type' in json) ||
		json._type !== 'Timer' ||
		typeof json.when !== 'string' ||
		Array.isArray(json.comment)
	) {
		throw new Error(
			`Cannot deserialize a timer from JSON: ${JSON.stringify(json)}`,
		);
	}

	return new Timer(
		Temporal.Duration.from(json.when),
		(json.comment as unknown[]).map(String),
	);
}

export class RecurringEvent {
	readonly _type = 'RecurringEvent';

	constructor(
		readonly when: RecurringPeriod,
		readonly comment: string[],
	) {}
}

export function recurringEventFrom(json: JsonValue) {
	if (
		typeof json !== 'object' ||
		!json ||
		!('_type' in json) ||
		json._type !== 'RecurringEvent' ||
		json.when === undefined ||
		Array.isArray(json.comment)
	) {
		throw new Error(
			`Cannot deserialize a recurring event from JSON: ${JSON.stringify(json)}`,
		);
	}

	return new RecurringEvent(
		recurringPeriodFrom(json.when),
		(json.comment as unknown[]).map(String),
	);
}

export class OneShotEvent {
	readonly _type = 'OneShotEvent';

	constructor(
		readonly when: Period,
		readonly comment: string[],
	) {}
}

export function oneShotEventFrom(json: JsonValue) {
	if (
		typeof json !== 'object' ||
		!json ||
		!('_type' in json) ||
		json._type !== 'OneShotEvent' ||
		typeof json.when !== 'object' ||
		json.when === undefined ||
		Array.isArray(json.comment)
	) {
		throw new Error(
			`Cannot deserialize a one-shot event from JSON: ${JSON.stringify(json)}`,
		);
	}

	return new OneShotEvent(
		periodFrom(json.when),
		(json.comment as unknown[]).map(String),
	);
}

export class Directive {
	readonly _type = 'Directive';

	constructor(
		readonly directive:
			| RecurringAlarm
			| OneShotAlarm
			| Timer
			| RecurringEvent
			| OneShotEvent,
		readonly ast?: DirectiveNode | JsonValue,
	) {}
}

export function directiveFrom(json: JsonValue) {
	if (
		typeof json !== 'object' ||
		!json ||
		!('_type' in json) ||
		json._type !== 'Directive' ||
		typeof json.directive !== 'object' ||
		!json.directive ||
		!('_type' in json.directive)
	) {
		throw new Error(
			`Cannot deserialize a directive from JSON: ${JSON.stringify(json)}`,
		);
	}

	let directive;

	switch (json.directive._type) {
		case 'RecurringAlarm': {
			directive = recurringAlarmFrom(json.directive);
			break;
		}

		case 'OneShotAlarm': {
			directive = oneShotAlarmFrom(json.directive);
			break;
		}

		case 'Timer': {
			directive = timerFrom(json.directive);
			break;
		}

		case 'RecurringEvent': {
			directive = recurringEventFrom(json.directive);
			break;
		}

		case 'OneShotEvent': {
			directive = oneShotEventFrom(json.directive);
			break;
		}

		default: {
			throw new TypeError(
				`Bug: Unhandled directive kind: ${JSON.stringify(json.directive)}`,
			);
		}
	}

	return new Directive(directive, json.ast);
}
