import type {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../ast.ts';
import type {PeriodWholeDayNode} from './whole-day/ast.ts';
import type {PeriodWithDurationNode} from './with-duration/ast.ts';
import type {PeriodWithEndNode} from './with-end/ast.ts';

export type PeriodChildNode =
	| PeriodWholeDayNode
	| PeriodWithDurationNode
	| PeriodWithEndNode;

export class PeriodNode extends SyntaxNode<[PeriodChildNode]> {
	readonly period = this._children[0];

	toPeriod(now: Temporal.ZonedDateTime) {
		return this.period.toPeriod(now);
	}
}
