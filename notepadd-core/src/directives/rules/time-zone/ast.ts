import {SyntaxNode} from '../ast.ts';
import type {TimeZoneIdentifierNode} from './identifier/ast.ts';
import type {TimeZoneOffsetNode} from './offset/ast.ts';
import type {TimeZoneUtcNode} from './utc/ast.ts';

export type TimeZoneChildNode =
	| TimeZoneIdentifierNode
	| TimeZoneOffsetNode
	| TimeZoneUtcNode;

export class TimeZoneNode extends SyntaxNode<[TimeZoneChildNode]> {
	readonly timeZone = this._children[0];

	toTimeZone() {
		return this.timeZone.toTimeZone();
	}
}
