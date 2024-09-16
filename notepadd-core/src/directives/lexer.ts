import * as nearley from '@esdmr/nearley';

export const lexer = nearley.lexer.compile({
	identifier: {
		match: /[a-zA-Z_]+/,
		type: nearley.lexer.keywords({
			alarm: 'alarm',
			timer: 'timer',
			event: 'event',
			every: 'every',
			until: 'until',
			for: 'for',
			whole: 'whole',
			now: 'now',
			today: 'today',
			tomorrow: 'tomorrow',
			this: 'this',
			time: 'time',
			midnight: 'midnight',
			noon: 'noon',
			morning: 'morning',
			afternoon: 'afternoon',
			evening: 'evening',
			z: ['Z', 'z'],
			years: ['years', 'year', 'yrs', 'yr', 'y'],
			months: ['months', 'month', 'mos', 'mo'],
			days: ['days', 'day', 'dys', 'dy', 'd'],
			hours: ['hours', 'hour', 'hrs', 'hr', 'h'],
			minutes: ['minutes', 'minute', 'mins', 'min', 'm'],
			seconds: ['seconds', 'second', 'secs', 'sec', 's'],
		}),
	},
	timeZoneIdentifier: {
		match: /\[[\w/+-]+]/,
		value(x) {
			return x.slice(1, -1);
		},
	},
	dash: /-/,
	colon: /:/,
	plus: /\+/,
	digits: /\d+/,
	commentLine: {
		match: /(?:\n\s|;)[^\n]*/,
		lineBreaks: true,
		value(x) {
			return x.slice(1).trim();
		},
	},
	_newLine: {
		match: /\n/,
		lineBreaks: true,
	},
	_whitespace: /(?!\n)\s/,
});

const oldNext = lexer.next;

lexer.next = function () {
	let token: nearley.MooToken | undefined;

	do {
		token = oldNext.apply(this);
	} while (token?.type?.startsWith('_'));

	return token;
};
