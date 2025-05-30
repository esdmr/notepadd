import type {MooToken} from '@esdmr/nearley';
import type {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../../ast.ts';
import {PeriodRecurringNode} from '../../period-recurring/ast.ts';
import {PeriodNode} from '../../period/ast.ts';
import {OneShotEvent, RecurringEvent} from './types.ts';

export class EventNode extends SyntaxNode<
	[MooToken, PeriodRecurringNode | PeriodNode]
> {
	readonly when = this._children[1];

	toDirective(now: Temporal.ZonedDateTime): OneShotEvent | RecurringEvent {
		if (this.when instanceof PeriodRecurringNode) {
			return new RecurringEvent(this.when.toRecurringPeriod(now));
		}

		if (this.when instanceof PeriodNode) {
			return new OneShotEvent(this.when.toPeriod(now));
		}

		this.when satisfies never;

		throw new TypeError(
			`Bug: Unhandled event kind: ${JSON.stringify(this.when, undefined, 2)}`,
		);
	}
}
