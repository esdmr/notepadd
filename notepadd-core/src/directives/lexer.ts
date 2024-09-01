import * as nearley from '@esdmr/nearley';

export const lexer = nearley.lexer.compile({
	unknown: {
		match: /\p{ID_Start}\p{ID_Continue}*/u,
		type: nearley.lexer.keywords({
			alarm: 'alarm',
			timer: 'timer',
			event: 'event',
			every: 'every',
			until: 'until',
			for: 'for',
			wholeDay: 'whole day',
			now: 'now',
			today: 'today',
			tomorrow: 'tomorrow',
			gregory: 'gregory',
			islamic: 'islamic',
			persian: 'persian',
			thisTime: 'this time',
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
	dash: /-/u,
	calendar: {
		match: /\[u-ca=[\w-]+\]/u,
		value(x) {
			return /\[u-ca=([\w-]+)\]/u.exec(x)![1]!;
		},
	},
	colon: /:/u,
	plus: /\+/u,
	digits: /[0-9]+/u,
	commentLine: {
		match: /\n\s+[^\n]*/u,
		lineBreaks: true,
		value(x) {
			return /\n\s+([^\n]*)/u.exec(x)![1]!;
		},
	},
	_newLine: {
		match: /\n/u,
		lineBreaks: true,
	},
	_whitespace: /(?!\n)\s/u,
});

const oldNext = lexer.next;

lexer.next = function () {
	let token: nearley.MooToken | undefined;

	do {
		token = oldNext.apply(this);
	} while (token?.type?.startsWith('_'));

	return token;
};
