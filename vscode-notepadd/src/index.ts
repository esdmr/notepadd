/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference types="vite/client" />
/// <reference types="vite-plugin-child-process/client" />
import {type ExtensionContext} from 'vscode';
import {Bookkeeper} from './bookkeeper.ts';
import {NotePaddController} from './notebook/notepadd.controller.ts';
import {NotePaddSerializer} from './notebook/notepadd.serializer.ts';
import {output} from './output.ts';
import {setupRestartTimekeeperCommand} from './command/restart-timekeeper.ts';
import {setupStartTimekeeperCommand} from './command/start-timekeeper.ts';
import {setupStopTimekeeperCommand} from './command/stop-timekeeper.ts';
import {type AsyncDisposable} from './utils.ts';
import {setupNotepaddStatus} from './status-bar-item/notepadd-status.ts';

const asyncSubscriptions: AsyncDisposable[] = [];

export async function activate(context: ExtensionContext) {
	context.subscriptions.push(
		output,
		setupRestartTimekeeperCommand(),
		setupStartTimekeeperCommand(),
		setupStopTimekeeperCommand(),
		setupNotepaddStatus(),
		new NotePaddSerializer(),
		new NotePaddController(),
	);

	asyncSubscriptions.push(await new Bookkeeper().initialize());
}

export async function deactivate() {
	for (const disposable of asyncSubscriptions) {
		await disposable.asyncDispose();
	}
}
