import type {MooToken} from '@esdmr/nearley';
import {SyntaxNode} from '../ast.ts';

export class LinkTargetNode extends SyntaxNode<[MooToken]> {
	readonly href = this._children[0].value;

	toUrl(base?: string | URL) {
		return new URL(this.href, base);
	}
}
