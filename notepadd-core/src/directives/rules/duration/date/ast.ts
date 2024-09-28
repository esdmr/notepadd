import {SyntaxNode} from '../../ast.ts';
import type {UnsignedIntegerNode} from '../../integer/unsigned/ast.ts';

export class DurationDateNode extends SyntaxNode<
	[
		[
			UnsignedIntegerNode | undefined,
			UnsignedIntegerNode | undefined,
			UnsignedIntegerNode | undefined,
		],
	]
> {
	readonly years = this._children[0][0];
	readonly months = this._children[0][1];
	readonly days = this._children[0][2];
}
