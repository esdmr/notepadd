import {Disposable, type CancellationToken} from 'vscode';

export type AsyncDisposable = {
	asyncDispose(): Promise<any>;
};

export class AsyncEventEmitter<T> implements Disposable {
	private readonly _handlers: Array<(value: T) => Promise<void>> = [];

	readonly event = (handler: (value: T) => Promise<void>) => {
		this._handlers.push(handler);

		return new Disposable(() => {
			this._handlers.splice(this._handlers.indexOf(handler), 1);
		});
	};

	async fire(value: T) {
		for (const handler of this._handlers) {
			try {
				await handler(value);
			} catch (error) {
				console.error(error);
			}
		}
	}

	dispose() {
		this._handlers.length = 0;
	}
}

export class TokenWrapper implements Disposable {
	private readonly _controller = new AbortController();
	private _registry: Disposable | undefined;

	get signal() {
		return this._controller.signal;
	}

	constructor(token: CancellationToken) {
		if (token.isCancellationRequested) {
			this._controller.abort();
			this.dispose();
		} else {
			this._registry = token.onCancellationRequested((event) => {
				this._controller.abort(event);
				this.dispose();
			});
		}
	}

	dispose() {
		this._registry?.dispose();
		this._registry = undefined;
	}
}
