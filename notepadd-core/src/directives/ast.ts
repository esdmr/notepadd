import type {MooToken} from '@esdmr/nearley';

export abstract class SyntaxNode<Children extends readonly any[]> {
	constructor(protected readonly children: Children) {}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	toJSON() {
		return {
			...this.serialize(),
			type: this.constructor.name,
		};
	}

	abstract serialize(): Record<string, any>;
}

export function builder<
	Children extends readonly any[],
	Node extends SyntaxNode<Children>,
>(Class: new (argument: Children) => Node) {
	return (argument: readonly [...Children, ...any[]]) =>
		new Class(argument as unknown as Children);
}

export type DirectiveNode = AlarmNode | TimerNode | EventNode;

export class AlarmNode extends SyntaxNode<
	[
		MooToken,
		AbsoluteDateTimeMaybeRecurringInstantNode,
		CommentNode | undefined,
	]
> {
	override serialize() {
		return {
			dateTime: this.children[1],
			comment: this.children[2],
		};
	}
}

export class TimerNode extends SyntaxNode<
	[MooToken, RelativeDateTimeNode, CommentNode | undefined]
> {
	override serialize() {
		return {
			dateTime: this.children[1],
			comment: this.children[2],
		};
	}
}

export class EventNode extends SyntaxNode<
	[
		MooToken,
		AbsoluteDateTimeMaybeRecurringPeriodNode,
		CommentNode | undefined,
	]
> {
	override serialize() {
		return {
			dateTime: this.children[1],
			comment: this.children[2],
		};
	}
}

export type AbsoluteDateTimeMaybeRecurringPeriodNode =
	| AbsoluteDateTimeRecurringPeriodNode
	| AbsoluteDateTimePeriodNode;

export class AbsoluteDateTimeRecurringPeriodNode extends SyntaxNode<
	[
		AbsoluteDateTimePeriodNode,
		MooToken,
		RelativeDateTimeNode,
		[MooToken, AbsoluteDateTimeInstantNode] | undefined,
	]
> {
	override serialize() {
		return {
			start: this.children[0],
			period: this.children[2],
			end: this.children[3]?.[1],
		};
	}
}

export type AbsoluteDateTimePeriodNode =
	| AbsoluteDateTimePeriodWithDurationNode
	| AbsoluteDateTimePeriodWithEndNode
	| AbsoluteDateTimePeriodWholeDayNode;

export class AbsoluteDateTimePeriodWithDurationNode extends SyntaxNode<
	[AbsoluteDateTimeInstantNode, MooToken, RelativeDateTimeNode]
> {
	override serialize() {
		return {
			start: this.children[0],
			duration: this.children[2],
		};
	}
}

export class AbsoluteDateTimePeriodWithEndNode extends SyntaxNode<
	[AbsoluteDateTimeInstantNode, MooToken, AbsoluteDateTimeInstantNode]
> {
	override serialize() {
		return {
			start: this.children[0],
			end: this.children[2],
		};
	}
}

export class AbsoluteDateTimePeriodWholeDayNode extends SyntaxNode<
	[AbsoluteDateNode, MooToken]
> {
	override serialize() {
		return {
			date: this.children[0],
		};
	}
}

export type AbsoluteDateTimeMaybeRecurringInstantNode =
	| AbsoluteDateTimeRecurringInstantNode
	| AbsoluteDateTimeInstantNode;

export class AbsoluteDateTimeRecurringInstantNode extends SyntaxNode<
	[
		AbsoluteDateTimeInstantNode | undefined,
		MooToken,
		RelativeDateTimeNode,
		[MooToken, AbsoluteDateTimeInstantNode] | undefined,
	]
> {
	override serialize() {
		return {
			start: this.children[0],
			period: this.children[2],
			end: this.children[3]?.[1],
		};
	}
}

export type AbsoluteDateTimeInstantNode =
	| AbsoluteDateTimeInstantExactNode
	| AbsoluteDateTimeInstantContextualNode;

export class AbsoluteDateTimeInstantExactNode extends SyntaxNode<
	[AbsoluteDateNode, AbsoluteTimeNode]
> {
	override serialize() {
		return {
			date: this.children[0],
			time: this.children[1],
		};
	}
}

export class AbsoluteDateTimeInstantContextualNode extends SyntaxNode<
	[AbsoluteTimeNode | RelativeDateTimeNode | MooToken]
> {
	override serialize() {
		return {
			value:
				this.children[0] instanceof SyntaxNode
					? this.children[0]
					: this.children[0].value,
		};
	}
}

export type AbsoluteDateNode =
	| AbsoluteDateExactNode
	| AbsoluteDateContextualNode;

export class AbsoluteDateExactNode extends SyntaxNode<
	[
		[CalendarNode, MooToken] | undefined,
		UnsignedIntegerNode,
		MooToken,
		UnsignedIntegerNode,
		MooToken,
		UnsignedIntegerNode,
	]
> {
	override serialize() {
		return {
			calendar: this.children[0]?.[0],
			year: this.children[1],
			month: this.children[3],
			day: this.children[5],
		};
	}
}

export class AbsoluteDateContextualNode extends SyntaxNode<[MooToken]> {
	override serialize() {
		return {
			value: this.children[0].value,
		};
	}
}

export class CalendarNode extends SyntaxNode<[MooToken]> {
	override serialize() {
		return {
			value:
				this.children[0].type === 'islamic'
					? 'islamic-umalqura'
					: this.children[0].value,
		};
	}
}

export type AbsoluteTimeNode =
	| AbsoluteTimeExactNode
	| AbsoluteTimeStaticNode
	| AbsoluteTimeContextualNode;

export class AbsoluteTimeExactNode extends SyntaxNode<
	[UnsignedIntegerNode, MooToken, UnsignedIntegerNode, OffsetNode | undefined]
> {
	override serialize() {
		return {
			hour: this.children[0],
			minute: this.children[2],
			offset: this.children[3],
		};
	}
}

export class AbsoluteTimeStaticNode extends SyntaxNode<
	[AbsoluteTimeOfDayNode, OffsetNode | undefined]
> {
	override serialize() {
		return {
			value: this.children[0],
			offset: this.children[1],
		};
	}
}

export class AbsoluteTimeContextualNode extends SyntaxNode<[MooToken]> {
	override serialize() {
		return {
			value: this.children[0].type,
		};
	}
}

export class AbsoluteTimeOfDayNode extends SyntaxNode<[MooToken]> {
	override serialize() {
		return {
			value: this.children[0].type,
		};
	}
}

export type OffsetNode = LocalOffsetNode | UtcOffsetNode;

export class LocalOffsetNode extends SyntaxNode<
	[MooToken, UnsignedIntegerNode, MooToken, UnsignedIntegerNode]
> {
	override serialize() {
		return {
			sign: this.children[0]?.value,
			hours: this.children[1],
			minutes: this.children[3],
		};
	}
}

export class UtcOffsetNode extends SyntaxNode<[MooToken]> {
	override serialize() {
		return {};
	}
}

export class RelativeDateTimeNode extends SyntaxNode<
	[[RelativeDateNode, RelativeTimeNode]]
> {
	override serialize() {
		return {
			date: this.children[0][0],
			time: this.children[0][1],
		};
	}
}

export class RelativeDateNode extends SyntaxNode<
	[
		[
			SignedIntegerNode | undefined,
			SignedIntegerNode | undefined,
			SignedIntegerNode | undefined,
		],
	]
> {
	override serialize() {
		return {
			years: this.children[0][0],
			months: this.children[0][1],
			days: this.children[0][2],
		};
	}
}

export class RelativeTimeNode extends SyntaxNode<
	[
		[
			SignedIntegerNode | undefined,
			SignedIntegerNode | undefined,
			SignedIntegerNode | undefined,
		],
	]
> {
	override serialize() {
		return {
			hours: this.children[0][0],
			minutes: this.children[0][1],
			seconds: this.children[0][2],
		};
	}
}

export class SignedIntegerNode extends SyntaxNode<
	[MooToken | undefined, UnsignedIntegerNode]
> {
	override serialize() {
		return {
			sign: this.children[0]?.value,
			value: this.children[1],
		};
	}
}

export class UnsignedIntegerNode extends SyntaxNode<[MooToken]> {
	override serialize() {
		return {
			value: Number.parseInt(this.children[0].value, 10),
		};
	}
}

export class CommentNode extends SyntaxNode<[CommentLineNode[]]> {
	override serialize() {
		return {
			lines: this.children[0],
		};
	}
}

export class CommentLineNode extends SyntaxNode<[MooToken]> {
	override serialize() {
		return {
			text: this.children[0].value,
		};
	}
}
