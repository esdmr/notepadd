import type {MooToken} from '@esdmr/nearley';
import {type Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../../ast.ts';
import type {ZdtNode} from '../../zdt/ast.ts';
import {Period} from '../types.ts';

export class PeriodWithEndNode extends SyntaxNode<
	[ZdtNode, MooToken, ZdtNode]
> {
	readonly start = this._children[0];
	readonly end = this._children[2];

	toPeriod(now: Temporal.ZonedDateTime): Period {
		return new Period(this.start.toZdt(now), this.end.toZdt(now));
	}
}
