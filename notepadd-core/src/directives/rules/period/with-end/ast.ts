import type {MooToken} from '@esdmr/nearley';
import {type Temporal} from 'temporal-polyfill';
import {Period} from '../types.ts';
import {SyntaxNode} from '../../ast.ts';
import type {InstantNode} from '../../instant/ast.ts';
import type {PeriodChildNode} from '../ast.ts';

export class PeriodWithEndNode
	extends SyntaxNode<[InstantNode, MooToken, InstantNode]>
	implements PeriodChildNode
{
	readonly start = this._children[0];
	readonly end = this._children[2];

	toPeriod(now: Temporal.ZonedDateTime) {
		return new Period(this.start.toInstant(now), this.end.toInstant(now));
	}
}
