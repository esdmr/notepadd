import type {MooToken} from '@esdmr/nearley';
import {SyntaxNode} from '../../ast.ts';

export class TimeZoneUtcNode extends SyntaxNode<[MooToken]> {
	toTimeZone() {
		return 'UTC';
	}
}
