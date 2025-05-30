import type {MooToken} from '@esdmr/nearley';
import type {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../../ast.ts';
import type {DurationNode} from '../../duration/ast.ts';
import {Timer} from './types.ts';

export class TimerNode extends SyntaxNode<[MooToken, DurationNode]> {
	readonly when = this._children[1];

	toDirective(_now: Temporal.ZonedDateTime): Timer {
		return new Timer(this.when.toDuration());
	}
}
