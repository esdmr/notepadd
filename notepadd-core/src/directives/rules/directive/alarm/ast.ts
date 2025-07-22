import type {MooToken} from '@esdmr/nearley';
import type {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../../ast.ts';
import {DurationNode} from '../../duration/ast.ts';
import {ZdtRecurringNode} from '../../zdt-recurring/ast.ts';
import {ZdtNode} from '../../zdt/ast.ts';
import {OneShotAlarm, RecurringAlarm} from './types.ts';

export class AlarmNode extends SyntaxNode<
	[MooToken, ZdtRecurringNode | ZdtNode | DurationNode]
> {
	readonly when = this._children[1];

	toDirective(now: Temporal.ZonedDateTime): OneShotAlarm | RecurringAlarm {
		if (this.when instanceof ZdtRecurringNode) {
			return new RecurringAlarm(this.when.toRecurringZdt(now));
		}

		if (this.when instanceof ZdtNode) {
			return new OneShotAlarm(this.when.toZdt(now));
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
