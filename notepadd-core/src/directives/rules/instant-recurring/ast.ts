import type {MooToken} from '@esdmr/nearley';
import type {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../ast.ts';
import type {InstantNode} from '../instant/ast.ts';
import type {DurationNode} from '../duration/ast.ts';
import {RecurringInstant} from './types.ts';

export class InstantRecurringNode extends SyntaxNode<
	[InstantNode | undefined, MooToken, DurationNode, InstantNode | undefined]
> {
	readonly first = this._children[0];
	readonly interval = this._children[2];
	readonly end = this._children[3];

	toRecurringInstant(now: Temporal.ZonedDateTime) {
		const duration = this.interval.toDuration();

		return new RecurringInstant(
			this.first?.toInstant(now) ?? now.add(duration),
			duration,
			this.end?.toInstant(now),
		);
	}
}
