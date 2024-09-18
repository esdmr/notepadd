import type {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../ast.ts';
import type {Period} from './types.ts';

export type PeriodChildNode = {
	toPeriod(now: Temporal.ZonedDateTime): Period;
};

export class PeriodNode extends SyntaxNode<[PeriodChildNode]> {
	readonly period = this._children[0];

	toPeriod(now: Temporal.ZonedDateTime) {
		return this.period.toPeriod(now);
	}
}
