import type {MooToken} from '@esdmr/nearley';
import {SyntaxNode} from '../ast.ts';

export class NumberSignNode extends SyntaxNode<[MooToken]> {
	readonly negative = this._children[0].value === '-';
}
