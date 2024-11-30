import {
	Directive,
	hasProperty,
	hasTypeBrand,
	Instance,
	isObject,
} from 'notepadd-core';
import {type Temporal} from 'temporal-polyfill';

export class FileState {
	constructor(
		readonly sources: ReadonlyMap<string, Directive>,
		readonly hashes: ReadonlyMap<string, Directive>,
	) {}
}

export class DirectiveState {
	static from(json: unknown) {
		try {
			if (!isObject(json)) {
				throw new TypeError('Directive State is not an object');
			}

			if (
				!hasTypeBrand(
					json,
					'DirectiveState' satisfies DirectiveState['_type'],
				)
			) {
				throw new TypeError('Object is not a list message');
			}

			if (!hasProperty(json, 'directive')) {
				throw new TypeError('Directive is invalid');
			}

			const directive = Directive.from(json.directive);

			if (!hasProperty(json, 'instance')) {
				throw new TypeError('Instance is invalid');
			}

			const instance = Instance.from(json.instance);

			if (!hasProperty(json, 'sources') || !Array.isArray(json.sources)) {
				throw new TypeError('Sources are invalid');
			}

			return new DirectiveState(
				directive,
				instance,
				new Set(json.sources.map(String)),
			);
		} catch (error) {
			throw new Error(
				`Cannot deserialize a Directive State from JSON: ${JSON.stringify(json, undefined, 2)}`,
				{cause: error},
			);
		}
	}

	readonly _type = 'DirectiveState';
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
