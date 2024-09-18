import {SyntaxNode} from '../../ast.ts';
import type {NumberSignNode} from '../../number-sign/ast.ts';
import type {UnsignedIntegerNode} from '../unsigned/ast.ts';

export class SignedIntegerNode extends SyntaxNode<
	[NumberSignNode | undefined, UnsignedIntegerNode]
> {
	readonly sign = this._children[0];
	readonly magnitude = this._children[1];

	toBigInt() {
		const magnitude = this.magnitude.toBigInt();
		return this.sign?.negative ? -magnitude : magnitude;
	}

	toNumber() {
		return Number(this.toBigInt());
	}

	override toString() {
		return this.toBigInt().toString();
	}
}
