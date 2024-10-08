import type {MooToken} from '@esdmr/nearley';
import type {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../../ast.ts';
import {PeriodRecurringNode} from '../../period-recurring/ast.ts';
import {PeriodNode} from '../../period/ast.ts';
import type {CommentNode} from '../../comment/ast.ts';
import type {DirectiveChildNode} from '../ast.ts';
import {OneShotEvent, RecurringEvent} from './types.ts';

export class EventNode
	extends SyntaxNode<
		[MooToken, PeriodRecurringNode | PeriodNode, CommentNode | undefined]
	>
	implements DirectiveChildNode
{
	readonly when = this._children[1];
	readonly comment = this._children[2];

	toDirective(now: Temporal.ZonedDateTime) {
		const comment = this.comment?.lines ?? [];

		if (this.when instanceof PeriodRecurringNode) {
			return new RecurringEvent(
				this.when.toRecurringPeriod(now),
				comment,
			);
		}

		if (this.when instanceof PeriodNode) {
			return new OneShotEvent(this.when.toPeriod(now), comment);
		}

		throw new TypeError(
			`Bug: Unhandled event kind: ${JSON.stringify(this.when, undefined, 2)}`,
		);
	}
}
