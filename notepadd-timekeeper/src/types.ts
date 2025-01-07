import {
	Directive,
	getDiscriminator,
	Instance,
	transformFallible,
	v,
} from 'notepadd-core';

export class FileState {
	constructor(
		readonly sources: ReadonlyMap<string, Directive>,
		readonly hashes: ReadonlyMap<string, Directive>,
	) {}
}

export class DirectiveState {
	static readonly schema = v.pipe(
		v.object({
			_type: v.literal('DirectiveState'),
			directive: Directive.schema,
			instance: Instance.schema,
			sources: v.pipe(
				v.array(v.string()),
				transformFallible((i) => new Set(i)),
			),
		}),
		transformFallible(
			(i) => new DirectiveState(i.directive, i.instance, i.sources),
		),
	);

	readonly _type = getDiscriminator(DirectiveState);
	private _lastTimeout: ReturnType<typeof setTimeout> | undefined;

	constructor(
		readonly directive: Directive,
		public instance: Instance,
		readonly sources = new Set<string>(),
	) {}

	setTimeout(ms: number, callback: (state: this) => void) {
		this.clearTimeout();
		this._lastTimeout = setTimeout(callback, ms, this);
	}

	clearTimeout() {
		if (this._lastTimeout === undefined) return;
		clearTimeout(this._lastTimeout);
		this._lastTimeout = undefined;
	}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	toJSON() {
		return {
			_type: this._type,
			directive: this.directive,
			instance: this.instance,
			sources: [...this.sources],
		};
	}
}

export class UpdateDelta {
	constructor(
		readonly fileUrl: string,
		readonly deleted: ReadonlyMap<string, Directive> = new Map(),
		readonly added: ReadonlyMap<string, Directive> = new Map(),
	) {}
}
