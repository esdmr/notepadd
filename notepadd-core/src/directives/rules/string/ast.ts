import type {MooToken} from '@esdmr/nearley';
import {SyntaxNode} from '../ast.ts';

export class StringNode extends SyntaxNode<[MooToken]> {
	readonly text = this._children[0].value;
}
