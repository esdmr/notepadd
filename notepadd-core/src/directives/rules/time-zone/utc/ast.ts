import type {MooToken} from '@esdmr/nearley';
import {SyntaxNode} from '../../ast.ts';
import type {TimeZoneChildNode} from '../ast.ts';

export class TimeZoneUtcNode
	extends SyntaxNode<[MooToken]>
	implements TimeZoneChildNode
{
	toTimeZone() {
		return 'UTC';
	}
}
