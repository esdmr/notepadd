import type {MooToken} from '@esdmr/nearley';
import type {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../ast.ts';
import type {ZdtNode} from '../zdt/ast.ts';
import type {DurationNode} from '../duration/ast.ts';
import {RecurringZdt} from './types.ts';

export class ZdtRecurringNode extends SyntaxNode<
	[ZdtNode | undefined, MooToken, DurationNode, ZdtNode | undefined]
> {
	readonly first = this._children[0];
	readonly interval = this._children[2];
	readonly end = this._children[3];

	toRecurringZdt(now: Temporal.ZonedDateTime): RecurringZdt {
		const duration = this.interval.toDuration();

		return new RecurringZdt(
			this.first?.toZdt(now) ?? now.add(duration),
			duration,
			this.end?.toZdt(now),
		);
	}
}
