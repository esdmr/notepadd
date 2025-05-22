/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference types="vite/client" />
/// <reference types="vite-plugin-child-process/client" />
/// <reference types="vite-plugin-vscode/client" />
import {type ExtensionContext} from 'vscode';
import {Bookkeeper} from './bookkeeper.ts';
import {setupBridgeNotification} from './bridge-notification.ts';
import {events} from './bus.ts';
import {setupCommands} from './command/index.ts';
import {NotePaddController} from './notebook/notepadd.controller.ts';
import {NotePaddSerializer} from './notebook/notepadd.serializer.ts';
import {output} from './output.ts';
import {setupNotepaddStatus} from './status-bar-item/notepadd-status.ts';
import {Timekeeper} from './timekeeper.ts';
import {type AsyncDisposable} from './utils.ts';
import {ActiveEventsView} from './view/active-events.ts';
import {DirectivesView} from './view/directives.ts';
import {PastAlarmsView} from './view/past-alarms.ts';

const asyncSubscriptions: AsyncDisposable[] = [];

export async function activate(context: ExtensionContext) {
	try {
		context.subscriptions.push(
			output,
			events,
			setupCommands(context),
			setupNotepaddStatus(),
			setupBridgeNotification(),
			new NotePaddSerializer(),
			new NotePaddController(),
			new ActiveEventsView(),
			new PastAlarmsView(),
			await new DirectivesView().initialize(),
			await new Bookkeeper().initialize(),
		);

		asyncSubscriptions.push(new Timekeeper().initialize());
	} catch (error) {
		output.error(
			'[NotePADD]',
			error instanceof Error ? error.stack : error,
		);
		throw error;
	}
}

export async function deactivate() {
	for (const disposable of asyncSubscriptions) {
		await disposable.asyncDispose();
	}
}
