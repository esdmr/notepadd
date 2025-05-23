import type {MooToken} from '@esdmr/nearley';
import type {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../ast.ts';
import type {PeriodNode} from '../period/ast.ts';
import type {DurationNode} from '../duration/ast.ts';
import type {InstantNode} from '../instant/ast.ts';
import {RecurringPeriod} from './types.ts';

export class PeriodRecurringNode extends SyntaxNode<
	[PeriodNode, MooToken, DurationNode, InstantNode | undefined]
> {
	readonly first = this._children[0];
	readonly interval = this._children[2];
	readonly end = this._children[3];

	toRecurringPeriod(now: Temporal.ZonedDateTime): RecurringPeriod {
		return new RecurringPeriod(
			this.first?.toPeriod(now),
			this.interval.toDuration(),
			this.end?.toInstant(now),
		);
	}
}
