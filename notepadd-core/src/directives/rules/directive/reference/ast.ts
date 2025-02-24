import type {MooToken} from '@esdmr/nearley';
import type {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../../ast.ts';
import type {DirectiveChildNode} from '../ast.ts';
import type {LinkTargetNode} from '../../link-target/ast.ts';
import {Reference} from './types.ts';

export class ReferenceNode
	extends SyntaxNode<[MooToken, LinkTargetNode]>
	implements DirectiveChildNode
{
	readonly target = this._children[1];

	toDirective(_now: Temporal.ZonedDateTime) {
		return new Reference(this.target.href);
	}
}
