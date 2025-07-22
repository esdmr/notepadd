import type {MooToken} from '@esdmr/nearley';
import {type Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../../ast.ts';
import type {DurationNode} from '../../duration/ast.ts';
import type {ZdtNode} from '../../zdt/ast.ts';
import {Period} from '../types.ts';

export class PeriodWithDurationNode extends SyntaxNode<
	[ZdtNode, MooToken, DurationNode]
> {
	readonly start = this._children[0];
	readonly duration = this._children[2];

	toPeriod(now: Temporal.ZonedDateTime): Period {
		return new Period(this.start.toZdt(now), this.duration.toDuration());
	}
}
