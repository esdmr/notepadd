import type {MooToken} from '@esdmr/nearley';
import {SyntaxNode} from '../../ast.ts';

export class UnsignedIntegerNode extends SyntaxNode<[MooToken]> {
	readonly value = this._children[0].value;

	toBigInt() {
		return BigInt(this.value);
	}

	toNumber() {
		return Number(this.toBigInt());
	}

	override toString() {
		return this.toBigInt().toString();
	}
}
