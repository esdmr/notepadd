import type {MooToken} from '@esdmr/nearley';
import {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../../ast.ts';

export class PlainTimeOfDayNode extends SyntaxNode<[MooToken]> {
	readonly timeOfDay = this._children[0].type;

	toPlainTime(_now: Temporal.PlainTime): Temporal.PlainTime {
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

			// eslint-disable-next-line unicorn/no-useless-switch-case
			case undefined:
			default: {
				throw new RangeError(
					`Bug: Unhandled time of day: ${this.timeOfDay}, ${this._children[0].value}`,
				);
			}
		}
	}
}
