import type {MooToken} from '@esdmr/nearley';
import {type Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../../ast.ts';
import type {DurationNode} from '../../duration/ast.ts';
import type {InstantNode} from '../../instant/ast.ts';
import {Period} from '../types.ts';

export class PeriodWithDurationNode extends SyntaxNode<
	[InstantNode, MooToken, DurationNode]
> {
	readonly start = this._children[0];
	readonly duration = this._children[2];

	toPeriod(now: Temporal.ZonedDateTime) {
		return new Period(
			this.start.toInstant(now),
			this.duration.toDuration(),
		);
	}
}
