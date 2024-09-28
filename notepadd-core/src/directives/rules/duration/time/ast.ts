import {SyntaxNode} from '../../ast.ts';
import type {UnsignedIntegerNode} from '../../integer/unsigned/ast.ts';

export class DurationTimeNode extends SyntaxNode<
	[
		[
			UnsignedIntegerNode | undefined,
			UnsignedIntegerNode | undefined,
			UnsignedIntegerNode | undefined,
		],
	]
> {
	readonly hours = this._children[0][0];
	readonly minutes = this._children[0][1];
	readonly seconds = this._children[0][2];
}
