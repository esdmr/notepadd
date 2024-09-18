import type {MooToken} from '@esdmr/nearley';
import type {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../../ast.ts';
import type {CommentNode} from '../../comment/ast.ts';
import {DurationNode} from '../../duration/ast.ts';
import {InstantRecurringNode} from '../../instant-recurring/ast.ts';
import {InstantNode} from '../../instant/ast.ts';
import type {DirectiveChildNode} from '../ast.ts';
import {RecurringAlarm, OneShotAlarm} from './types.ts';

export class AlarmNode
	extends SyntaxNode<
		[
			MooToken,
			InstantRecurringNode | InstantNode | DurationNode,
			CommentNode | undefined,
		]
	>
	implements DirectiveChildNode
{
	readonly when = this._children[1];
	readonly comment = this._children[2];

	toDirective(now: Temporal.ZonedDateTime) {
		const comment = this.comment?.lines ?? [];

		if (this.when instanceof InstantRecurringNode) {
			return new RecurringAlarm(
				this.when.toRecurringInstant(now),
				comment,
			);
		}

		if (this.when instanceof InstantNode) {
			return new OneShotAlarm(this.when.toInstant(now), comment);
		}

		if (this.when instanceof DurationNode) {
			return new OneShotAlarm(now.add(this.when.toDuration()), comment);
		}

		throw new TypeError(
			`Bug: Unhandled alarm kind: [${typeof this.when} ${new Object(this.when).constructor.name}] ${String(this.when)}`,
		);
	}
}
