import {SyntaxNode} from '../../ast.ts';
import type {SignedIntegerNode} from '../../integer/signed/ast.ts';

export class DurationDateNode extends SyntaxNode<
	[
		[
			SignedIntegerNode | undefined,
			SignedIntegerNode | undefined,
			SignedIntegerNode | undefined,
		],
	]
> {
	readonly years = this._children[0][0];
	readonly months = this._children[0][1];
	readonly days = this._children[0][2];
}
