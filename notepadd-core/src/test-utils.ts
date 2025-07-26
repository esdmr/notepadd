import * as fc from 'fast-check';
import {Temporal, toTemporalInstant} from 'temporal-polyfill';

export type StringFilterConstraints = {
	include?: ReadonlyArray<string | RegExp>;
	exclude?: ReadonlyArray<string | RegExp>;
};

function applyFilter(
	values: readonly string[],
	criteria: ReadonlyArray<string | RegExp>,
	kind: boolean,
): string[] {
	const strings = new Set(criteria.filter((i) => typeof i === 'string'));
	const regexps = criteria.filter((i) => i instanceof RegExp);

	return values.filter(
		(i) => (strings.has(i) || regexps.some((j) => j.test(i))) === kind,
	);
}

export function genConstString(
	values: readonly string[],
	constraints?: StringFilterConstraints,
): fc.Arbitrary<string> {
	if (values.length === 0) {
		throw new RangeError('genConstString expects at least one value');
	}

	if (constraints?.include && constraints.include.length > 0) {
		values = applyFilter(values, constraints.include, true);
	}

	if (constraints?.exclude && constraints.exclude.length > 0) {
		values = applyFilter(values, constraints.exclude, false);
	}

	return fc.noShrink(fc.constantFrom(...values));
}

export type CalendarConstraints = StringFilterConstraints;

export function genCalendar(
	constraints?: CalendarConstraints,
): fc.Arbitrary<string> {
	// The polyfill throws “Protocol Error” for some years of the islamic calendar.
	constraints ??= {};
	constraints.exclude ??= [
		'islamic',
		'islamic-civil',
		'islamic-rgsa',
		'islamic-tbla',
		'islamic-umalqura',
	];

	return genConstString(Intl.supportedValuesOf('calendar'), constraints);
}

export type TimeZoneConstraints = StringFilterConstraints;

export function genTimeZone(
	constraints?: TimeZoneConstraints,
): fc.Arbitrary<string> {
	return genConstString(Intl.supportedValuesOf('timeZone'), constraints);
}

const realisticMinZdt = Temporal.Instant.from('1846-01-01T00:00:00Z');
const realisticMaxZdt = Temporal.Instant.from('2138-12-31T23:59:59Z');

export type InstantConstraints = {
	min?: Temporal.Instant;
	max?: Temporal.Instant;
};

export function genInstant({
	min = realisticMinZdt,
	max = realisticMaxZdt,
}: InstantConstraints = {}): fc.Arbitrary<Temporal.Instant> {
	return fc
		.date({
			min: new Date(min.epochMilliseconds),
			max: new Date(max.epochMilliseconds),
			noInvalidDate: true,
		})
		.map((i) => {
			try {
				return toTemporalInstant.call(i);
			} catch (error) {
				console.warn(
					'Incorrect constraints on Instant generator.',
					error,
				);
				return undefined;
			}
		})
		.filter((i) => i !== undefined);
}

export type ZdtConstraints = {
	timeZone?: TimeZoneConstraints;
	calendar?: CalendarConstraints;
} & InstantConstraints;

export function genZdt(
	constraints?: ZdtConstraints,
): fc.Arbitrary<Temporal.ZonedDateTime> {
	return fc
		.record({
			instant: genInstant(constraints),
			timeZone: genTimeZone(constraints?.timeZone),
			calendar: genCalendar(constraints?.calendar),
		})
		.map((i) => {
			try {
				return i.instant
					.toZonedDateTimeISO(i.timeZone)
					.withCalendar(i.calendar);
			} catch (error) {
				console.warn(
					'Incorrect constraints on ZonedDateTime generator.',
					error,
				);
				return undefined;
			}
		})
		.filter((i) => i !== undefined);
}

export function genPlainDateTime(
	constraints?: ZdtConstraints,
): fc.Arbitrary<Temporal.PlainDateTime> {
	return genZdt(constraints)
		.map((i) => {
			try {
				return i.toPlainDateTime();
			} catch (error) {
				console.warn(
					'Incorrect constraints on PlainDateTime generator.',
					error,
				);
				return undefined;
			}
		})
		.filter((i) => i !== undefined);
}

export function genPlainDate(
	constraints?: ZdtConstraints,
): fc.Arbitrary<Temporal.PlainDate> {
	return genZdt(constraints)
		.map((i) => {
			try {
				return i.toPlainDate();
			} catch (error) {
				console.warn(
					'Incorrect constraints on PlainDate generator.',
					error,
				);
				return undefined;
			}
		})
		.filter((i) => i !== undefined);
}

export function genPlainYearMonth(
	constraints?: ZdtConstraints,
): fc.Arbitrary<Temporal.PlainYearMonth> {
	return genZdt(constraints)
		.map((i) => {
			try {
				return Temporal.PlainYearMonth.from(i);
			} catch (error) {
				console.warn(
					'Incorrect constraints on PlainYearMonth generator.',
					error,
				);
				return undefined;
			}
		})
		.filter((i) => i !== undefined);
}

export function genPlainMonthDay(
	constraints?: ZdtConstraints,
): fc.Arbitrary<Temporal.PlainMonthDay> {
	return genZdt(constraints)
		.map((i) => {
			try {
				return Temporal.PlainMonthDay.from(i);
			} catch (error) {
				console.warn(
					'Incorrect constraints on PlainMonthDay generator.',
					error,
				);
				return undefined;
			}
		})
		.filter((i) => i !== undefined);
}

export function genPlainTimeMonth(
	constraints?: ZdtConstraints,
): fc.Arbitrary<Temporal.PlainTime> {
	return genZdt(constraints)
		.map((i) => {
			try {
				return Temporal.PlainTime.from(i);
			} catch (error) {
				console.warn(
					'Incorrect constraints on PlainTime generator.',
					error,
				);
				return undefined;
			}
		})
		.filter((i) => i !== undefined);
}

export type DurationConstraints = Partial<
	Record<Temporal.PluralUnit<Temporal.DateTimeUnit>, number>
> & {
	nonNegativeOnly?: boolean;
	allowZero?: boolean;
};

// eslint-disable-next-line complexity
export function genDuration(
	constraints?: DurationConstraints,
): fc.Arbitrary<Temporal.Duration> {
	return fc
		.record({
			nanoseconds: fc.integer({
				min: 0,
				max: constraints?.nanoseconds ?? 0,
			}),
			microseconds: fc.integer({
				min: 0,
				max: constraints?.microseconds ?? 0,
			}),
			milliseconds: fc.integer({
				min: 0,
				max: constraints?.milliseconds ?? 0,
			}),
			seconds: fc.integer({
				min: 0,
				max: constraints?.seconds ?? 60 * 2.5,
			}),
			minutes: fc.integer({
				min: 0,
				max: constraints?.minutes ?? 60 * 2.5,
			}),
			hours: fc.integer({min: 0, max: constraints?.hours ?? 24 * 2.5}),
			days: fc.integer({min: 0, max: constraints?.days ?? 30 * 2.5}),
			weeks: fc.integer({min: 0, max: constraints?.weeks ?? 0}),
			months: fc.integer({min: 0, max: constraints?.months ?? 12 * 2.5}),
			years: fc.integer({min: 0, max: constraints?.years ?? 1000 * 2.5}),
			sign:
				(constraints?.nonNegativeOnly ?? true)
					? fc.constant(true)
					: fc.boolean(),
		})
		.map((i) => {
			try {
				const duration = Temporal.Duration.from(i);
				if (duration.blank && !constraints?.allowZero) return undefined;
				return i.sign ? duration : duration.negated();
			} catch (error) {
				console.warn('Incorrect range on Duration generator.', error);
				return undefined;
			}
		})
		.filter((i) => i !== undefined);
}
