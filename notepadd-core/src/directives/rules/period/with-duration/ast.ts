import type {MooToken} from '@esdmr/nearley';
import {Temporal} from 'temporal-polyfill';
import {Period} from '../types.ts';
import {SyntaxNode} from '../../ast.ts';
import type {InstantNode} from '../../instant/ast.ts';
import type {DurationNode} from '../../duration/ast.ts';
import type {PeriodChildNode} from '../ast.ts';

export class PeriodWithDurationNode
	extends SyntaxNode<[InstantNode, MooToken, DurationNode]>
	implements PeriodChildNode
{
	readonly start = this._children[0];
	readonly duration = this._children[2];

	toPeriod(now: Temporal.ZonedDateTime) {
		return new Period(
			this.start.toInstant(now),
			Temporal.Duration.from({days: 1}),
		);
	}
}
