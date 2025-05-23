import type {MooToken} from '@esdmr/nearley';
import {SyntaxNode} from '../../ast.ts';

export class UnsignedIntegerNode extends SyntaxNode<[MooToken]> {
	readonly value = this._children[0].value;

	toBigInt(): bigint {
		return BigInt(this.value);
	}

	toNumber(): number {
		return Number(this.toBigInt());
	}

	override toString(): string {
		return this.toBigInt().toString();
	}
}
