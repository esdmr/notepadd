import {describe, expect} from 'vitest';
import {Temporal} from 'temporal-polyfill';
import {fc, it} from '@fast-check/vitest';
import {genDuration, genZdt} from '../../../test-utils.ts';
import {RecurringZdt} from './types.ts';

describe('getInstance', () => {
	it('returns a next-only instance for future alarms', () => {
		const uut = new RecurringZdt(
			Temporal.ZonedDateTime.from('2025-01-01T00:00:00+00:00[UTC]'),
			Temporal.Duration.from({days: 7}),
		);

		const result = uut.getInstance(
			Temporal.ZonedDateTime.from('2024-01-01T00:00:00+00:00[UTC]'),
		);

		expect(result.previous).toBeUndefined();
		expect(result.next).toBe(uut.first);
	});

	it('returns a previous-only instance for past alarms', () => {
		const uut = new RecurringZdt(
			Temporal.ZonedDateTime.from('2025-01-01T00:00:00+00:00[UTC]'),
			Temporal.Duration.from({days: 7}),
			Temporal.ZonedDateTime.from('2026-01-01T00:00:00+00:00[UTC]'),
		);

		const result = uut.getInstance(
			Temporal.ZonedDateTime.from('2027-01-01T00:00:00+00:00[UTC]'),
		);

		expect(result.previous?.toString()).toBe(
			'2025-12-31T00:00:00+00:00[UTC]',
		);
		expect(result.next).toBeUndefined();
	});

	it('corrects early estimation', () => {
		const uut = new RecurringZdt(
			Temporal.ZonedDateTime.from('2025-02-01T00:00:00+00:00[UTC]'),
			Temporal.Duration.from({months: 1, days: 1}),
		);

		const result = uut.getInstance(
			Temporal.ZonedDateTime.from('2025-03-30T00:00:00+00:00[UTC]'),
		);

		expect(result.previous?.toString()).toBe(
			'2025-03-02T00:00:00+00:00[UTC]',
		);
		expect(result.next?.toString()).toBe('2025-04-03T00:00:00+00:00[UTC]');
	});

	it('corrects late estimation', () => {
		const uut = new RecurringZdt(
			Temporal.ZonedDateTime.from('2025-01-01T00:00:00+00:00[UTC]'),
			Temporal.Duration.from({months: 1, days: 1}),
		);

		const result = uut.getInstance(
			Temporal.ZonedDateTime.from('2025-03-05T00:00:00+00:00[UTC]'),
		);

		expect(result.previous?.toString()).toBe(
			'2025-03-03T00:00:00+00:00[UTC]',
		);
		expect(result.next?.toString()).toBe('2025-04-04T00:00:00+00:00[UTC]');
	});

	it.prop({
		first: genZdt(),
		interval: genDuration(),
		endInterval: fc.option(genDuration(), {nil: undefined}),
		now: genZdt(),
	})(
		'returns the instances between the current time',
		({first, interval, endInterval, now}) => {
			const end = endInterval && first.add(endInterval);
			const uut = new RecurringZdt(first, interval, end);
			const result = uut.getInstance(now);

			expect(result.previous ?? result.next).toBeTruthy();

			if (result.previous) {
				expect(
					Temporal.ZonedDateTime.compare(result.previous, now),
				).toBeLessThanOrEqual(0);
			}

			if (result.next) {
				expect(
					Temporal.ZonedDateTime.compare(now, result.next),
				).toBeLessThan(0);
			}
		},
	);
});
