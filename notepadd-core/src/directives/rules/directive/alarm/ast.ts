import type {MooToken} from '@esdmr/nearley';
import type {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../../ast.ts';
import {DurationNode} from '../../duration/ast.ts';
import {InstantRecurringNode} from '../../instant-recurring/ast.ts';
import {InstantNode} from '../../instant/ast.ts';
import {OneShotAlarm, RecurringAlarm} from './types.ts';

export class AlarmNode extends SyntaxNode<
	[MooToken, InstantRecurringNode | InstantNode | DurationNode]
> {
	readonly when = this._children[1];

	toDirective(now: Temporal.ZonedDateTime): OneShotAlarm | RecurringAlarm {
		if (this.when instanceof InstantRecurringNode) {
			return new RecurringAlarm(this.when.toRecurringInstant(now));
		}

		if (this.when instanceof InstantNode) {
			return new OneShotAlarm(this.when.toInstant(now));
		}

		if (this.when instanceof DurationNode) {
			return new OneShotAlarm(now.add(this.when.toDuration()));
		}

		this.when satisfies never;

		throw new TypeError(
			`Bug: Unhandled alarm kind: ${JSON.stringify(this.when, undefined, 2)}`,
		);
	}
}
