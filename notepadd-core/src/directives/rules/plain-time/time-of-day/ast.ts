import type {MooToken} from '@esdmr/nearley';
import {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../../ast.ts';
import type {PlainTimeChildNode} from '../ast.ts';

export class PlainTimeOfDayNode
	extends SyntaxNode<[MooToken]>
	implements PlainTimeChildNode
{
	readonly timeOfDay = this._children[0].type;

	toPlainTime(_now: Temporal.PlainTime) {
		// TODO: Make configurable.
		switch (this.timeOfDay) {
			case 'midnight': {
				return new Temporal.PlainTime(0);
			}

			case 'morning': {
				return new Temporal.PlainTime(8);
			}

			case 'noon': {
				return new Temporal.PlainTime(12);
			}

			case 'afternoon': {
				return new Temporal.PlainTime(13);
			}

			case 'evening': {
				return new Temporal.PlainTime(18);
			}

			default: {
				throw new RangeError(
					`Bug: Unhandled time of day: ${this.timeOfDay}, ${this._children[0].value}`,
				);
			}
		}
	}
}
