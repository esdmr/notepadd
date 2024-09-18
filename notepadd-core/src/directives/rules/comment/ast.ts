import type {MooToken} from '@esdmr/nearley';
import {SyntaxNode} from '../ast.ts';

export class CommentNode extends SyntaxNode<[MooToken[]]> {
	readonly lines = this._children[0].map((i) => i.value);
}
