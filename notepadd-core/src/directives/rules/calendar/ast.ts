import type {MooToken} from '@esdmr/nearley';
import {SyntaxNode} from '../ast.ts';

export class CalendarNode extends SyntaxNode<[MooToken, readonly MooToken[]]> {
	// TODO: Make configurable.
	readonly calendar = this._children
		.flat()
		.map((i) => i.value)
		.join('-');
}
