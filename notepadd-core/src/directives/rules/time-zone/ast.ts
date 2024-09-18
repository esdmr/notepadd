import {SyntaxNode} from '../ast.ts';

export type TimeZoneChildNode = {
	toTimeZone(): string;
};

export class TimeZoneNode extends SyntaxNode<[TimeZoneChildNode]> {
	readonly timeZone = this._children[0];

	toTimeZone() {
		return this.timeZone.toTimeZone();
	}
}
