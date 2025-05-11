import type {MooToken} from '@esdmr/nearley';
import {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../../ast.ts';
import type {CalendarNode} from '../../calendar/ast.ts';
import type {UnsignedIntegerNode} from '../../integer/unsigned/ast.ts';

export class PlainDateLiteralNode extends SyntaxNode<
	[
		CalendarNode | undefined,
		UnsignedIntegerNode,
		MooToken,
		UnsignedIntegerNode,
		MooToken,
		UnsignedIntegerNode,
	]
> {
	readonly calendar = this._children[0];
	readonly year = this._children[1];
	readonly month = this._children[3];
	readonly day = this._children[5];

	toPlainDate(_today: Temporal.PlainDate) {
		// TODO: Make configurable.
		return Temporal.PlainDate.from({
			calendar: this.calendar?.calendar,
			year: this.year.toNumber(),
			month: this.month.toNumber(),
			day: this.day.toNumber(),
		});
	}
}
