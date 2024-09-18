import {SyntaxNode} from '../../ast.ts';
import type {SignedIntegerNode} from '../../integer/signed/ast.ts';

export class DurationTimeNode extends SyntaxNode<
	[
		[
			SignedIntegerNode | undefined,
			SignedIntegerNode | undefined,
			SignedIntegerNode | undefined,
		],
	]
> {
	readonly hours = this._children[0][0];
	readonly minutes = this._children[0][1];
	readonly seconds = this._children[0][2];
}
