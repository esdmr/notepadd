import {inspect} from 'node:util';
import {
	Disposable,
	EventEmitter,
	Uri,
	type CancellationToken,
	type Event,
} from 'vscode';
import {output} from './output.ts';

export type AsyncDisposable = {
	asyncDispose(): Promise<any>;
};

export class AsyncEventEmitter<T> implements Disposable {
	private readonly _handlers: Array<(value: T) => Promise<void>> = [];

	readonly event = (handler: (value: T) => Promise<void>): Disposable => {
		this._handlers.push(handler);

		return new Disposable(() => {
			this._handlers.splice(this._handlers.indexOf(handler), 1);
		});
	};

	async fire(value: T): Promise<void> {
		for (const handler of this._handlers) {
			try {
				await handler(value);
			} catch (error) {
				output.error(inspect(error));
			}
		}
	}

	dispose(): void {
		this._handlers.length = 0;
	}
}

export class TokenWrapper implements Disposable {
	private readonly _controller = new AbortController();
	private _registry: Disposable | undefined;

	get signal(): AbortSignal {
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

	dispose(): void {
		this._registry?.dispose();
		this._registry = undefined;
	}
}

export class VirtualSocket {
	private _connections = 0;
	// eslint-disable-next-line unicorn/prefer-event-target
	private readonly _didConnect = new EventEmitter<void>();
	// eslint-disable-next-line unicorn/prefer-event-target
	private readonly _didDisconnect = new EventEmitter<void>();

	get connected(): boolean {
		return this._connections > 0;
	}

	get onDidConnect(): Event<void> {
		return this._didConnect.event;
	}

	get onDidDisconnect(): Event<void> {
		return this._didDisconnect.event;
	}

	connect(): Disposable {
		let connected = true;
		this._connections++;
		this._didConnect.fire();

		return new Disposable(() => {
			if (!connected) return;
			connected = false;
			this._connections--;
			this._didDisconnect.fire();
		});
	}
}

export function convertUriToUrl(uri: Uri): URL {
	return new URL(uri.toString(true));
}

export function convertUrlToUri(url: URL): Uri {
	return Uri.parse(url.href, true);
}
