/* eslint-disable @typescript-eslint/ban-types */
import {Temporal} from 'temporal-polyfill';
import {indexOf} from 'uint8array-extras';
import * as v from 'valibot';

export function isNullish(value: unknown): value is null | undefined {
	return value === null || value === undefined;
}

export function includes<T>(
	collection: readonly T[] | ReadonlySet<T> | ReadonlyMap<T, unknown>,
	value: unknown,
): value is T {
	return 'includes' in collection
		? collection.includes(value as T)
		: collection.has(value as T);
}

export function filterNullishValues<K extends PropertyKey, V>(
	object: Record<K, V | null | undefined>,
) {
	return Object.fromEntries(
		Object.entries(object).filter((i) => !isNullish(i[1])),
	) as Record<K, V>;
}

export function filterRecord<
	K1 extends PropertyKey,
	V1,
	K2 extends K1,
	V2 extends V1,
>(
	object: Record<K1, V1>,
	predicate: (entry: [K1, V1]) => entry is [K2, V2],
): Record<K2, V2>;

export function filterRecord<K extends PropertyKey, V>(
	object: Record<K, V>,
	predicate: (entry: [K, V]) => unknown,
): Record<K, V>;

export function filterRecord(
	object: Record<PropertyKey, unknown>,
	predicate: (entry: [PropertyKey, unknown]) => unknown,
) {
	return Object.fromEntries(
		Object.entries(object).filter((i) => predicate(i)),
	);
}

export function mapRecord<
	K1 extends PropertyKey,
	V1,
	K2 extends PropertyKey,
	V2,
>(object: Record<K1, V1>, mapper: (entry: [K1, V1]) => [K2, V2]) {
	return Object.fromEntries(
		Object.entries(object).map((i) => mapper(i as [K1, V1])),
	) as Record<K2, V2>;
}

export function filterMap<K1, V1, K2 extends K1, V2 extends V1>(
	map: Map<K1, V1>,
	predicate: (entry: [K1, V1]) => entry is [K2, V2],
): Map<K2, V2>;

export function filterMap<K, V>(
	map: Map<K, V>,
	predicate: (entry: [K, V]) => unknown,
): Map<K, V>;

export function filterMap(
	map: Map<unknown, unknown>,
	predicate: (entry: [unknown, unknown]) => unknown,
) {
	const filtered = new Map<unknown, unknown>();

	for (const entry of map) {
		if (predicate(entry)) {
			filtered.set(entry[0], entry[1]);
		}
	}

	return filtered;
}

export function filterSet<V1, V2 extends V1>(
	set: Set<V1>,
	predicate: (value: V1) => value is V2,
): Set<V2>;

export function filterSet<V>(
	set: Set<V>,
	predicate: (value: V) => unknown,
): Set<V>;

export function filterSet(
	set: Set<unknown>,
	predicate: (value: unknown) => unknown,
) {
	const filtered = new Set<unknown>();

	for (const value of set) {
		if (predicate(value)) {
			filtered.add(value);
		}
	}

	return filtered;
}

const uriSafeChars = new Set([
	// From RFC 2396:
	//     uric = reserved | unreserved | escaped
	//     unreserved = alphanum | mark
	//     alphanum = alpha | digit
	//     alpha = lowalpha | upalpha

	// `reserved`:
	';'.codePointAt(0)!,
	'/'.codePointAt(0)!,
	'?'.codePointAt(0)!,
	':'.codePointAt(0)!,
	'@'.codePointAt(0)!,
	'&'.codePointAt(0)!,
	'='.codePointAt(0)!,
	'+'.codePointAt(0)!,
	'$'.codePointAt(0)!,
	','.codePointAt(0)!,

	// `lowalpha`:
	...Array.from({length: 26}, (_, i) => i + 'a'.codePointAt(0)!),

	// `upalpha`:
	...Array.from({length: 26}, (_, i) => i + 'A'.codePointAt(0)!),

	// `digit`:
	...Array.from({length: 10}, (_, i) => i + '0'.codePointAt(0)!),

	// `mark`:
	'-'.codePointAt(0)!,
	'_'.codePointAt(0)!,
	'.'.codePointAt(0)!,
	'!'.codePointAt(0)!,
	'~'.codePointAt(0)!,
	'*'.codePointAt(0)!,
	"'".codePointAt(0)!,
	'('.codePointAt(0)!,
	')'.codePointAt(0)!,
]);

/**
 * @see {@link uriSafeChars}
 */
const uriSafeRegExp = /^[;/?:@&=+$,a-zA-Z0-9-_.!~*'()]*$/u;

export function isUriSafe(body: Uint8Array | string) {
	return typeof body === 'string'
		? uriSafeRegExp.test(body)
		: body.every((i) => uriSafeChars.has(i));
}

export function isBinary(body: Uint8Array | string) {
	return typeof body === 'string' ? body.includes('\0') : body.includes(0);
}

export function transformFallible<Input, Output>(
	operation: (input: Input) => Output,
): v.RawTransformAction<Input, Output> {
	return v.rawTransform<Input, Output>((context) => {
		try {
			return operation(context.dataset.value);
		} catch (error) {
			context.addIssue({
				message: String(error),
			});

			return context.NEVER;
		}
	});
}

export const durationSchema = v.pipe(
	v.string(),
	transformFallible((i) => Temporal.Duration.from(i)),
);

export const zonedDateTimeSchema = v.pipe(
	v.string(),
	transformFallible((i) => Temporal.ZonedDateTime.from(i)),
);

export const plainDateSchema = v.pipe(
	v.string(),
	transformFallible((i) => Temporal.PlainDate.from(i)),
);

export const plainTimeSchema = v.pipe(
	v.string(),
	transformFallible((i) => Temporal.PlainTime.from(i)),
);

export const plainDateTimeSchema = v.pipe(
	v.string(),
	transformFallible((i) => Temporal.PlainDateTime.from(i)),
);

export function getDiscriminator<K extends string>(class_: {
	schema: {entries: {_type: v.LiteralSchema<K, any>}};
}): K {
	return class_.schema.entries._type.literal;
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
	if (coefficient === 1) return duration;
	if (coefficient === -1) return duration.negated();

	return new Temporal.Duration(
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

export function minDuration(
	one: Temporal.Duration,
	two: Temporal.Duration,
	relativeTo: Temporal.ZonedDateTime,
) {
	return Temporal.Duration.compare(one, two, {relativeTo}) < 0 ? one : two;
}

export function splitUint8Array(buffer: Uint8Array, substring: Uint8Array) {
	const parts = [];

	while (buffer.length > 0) {
		const index = indexOf(buffer, substring);

		if (index === -1) {
			parts.push(buffer);
			break;
		}

		let {length} = substring;

		// Skip end of line after substring
		if (buffer[index + length] === 0xa) {
			length++;
		} else if (
			buffer[index + length] === 0xd &&
			buffer[index + length + 1] === 0xa
		) {
			length += 2;
		}

		parts.push(buffer.subarray(0, index));
		buffer = buffer.subarray(index + length);
	}

	return parts;
}
