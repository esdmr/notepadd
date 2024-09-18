import type {MooToken} from '@esdmr/nearley';
import type {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../../ast.ts';
import type {CommentNode} from '../../comment/ast.ts';
import type {DurationNode} from '../../duration/ast.ts';
import type {DirectiveChildNode} from '../ast.ts';
import {Timer} from './types.ts';

export class TimerNode
	extends SyntaxNode<[MooToken, DurationNode, CommentNode | undefined]>
	implements DirectiveChildNode
{
	readonly when = this._children[1];
	readonly comment = this._children[2];

	toDirective(_now: Temporal.ZonedDateTime) {
		return new Timer(this.when.toDuration(), this.comment?.lines ?? []);
	}
}
