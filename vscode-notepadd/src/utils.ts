import type {CancellationToken, Disposable} from 'vscode';

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
