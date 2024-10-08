import type {MooToken} from '@esdmr/nearley';
import type {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../../ast.ts';
import type {PlainDateChildNode} from '../ast.ts';

export class PlainDateKeywordNode
	extends SyntaxNode<[MooToken]>
	implements PlainDateChildNode
{
	readonly keyword = this._children[0].type;

	toPlainDate(today: Temporal.PlainDate) {
		switch (this.keyword) {
			case 'today': {
				return today;
			}

			case 'tomorrow': {
				return today.add({days: 1});
			}

			default: {
				throw new RangeError(
					`Bug: Unhandled date keyword: ${this.keyword}, ${this._children[0].value}`,
				);
			}
		}
	}
}
