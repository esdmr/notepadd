import {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../ast.ts';
import type {DurationDateNode} from './date/ast.ts';
import type {DurationTimeNode} from './time/ast.ts';

export class DurationNode extends SyntaxNode<
	[[DurationDateNode | undefined, DurationTimeNode | undefined]]
> {
	readonly date = this._children[0][0];
	readonly time = this._children[0][1];

	toDuration(): Temporal.Duration {
		return Temporal.Duration.from({
			years: this.date?.years?.toNumber(),
			months: this.date?.months?.toNumber(),
			days: this.date?.days?.toNumber(),
			hours: this.time?.hours?.toNumber(),
			minutes: this.time?.minutes?.toNumber(),
			seconds: this.time?.seconds?.toNumber(),
		});
	}
}
