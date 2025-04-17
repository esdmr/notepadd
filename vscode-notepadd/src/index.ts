/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference types="vite/client" />
/// <reference types="vite-plugin-child-process/client" />
import {type ExtensionContext} from 'vscode';
import {Bookkeeper} from './bookkeeper.ts';
import {Timekeeper} from './timekeeper.ts';
import {NotePaddController} from './notebook/notepadd.controller.ts';
import {NotePaddSerializer} from './notebook/notepadd.serializer.ts';
import {output} from './output.ts';
import {setupRestartTimekeeperCommand} from './command/restart-timekeeper.ts';
import {setupStartTimekeeperCommand} from './command/start-timekeeper.ts';
import {setupStopTimekeeperCommand} from './command/stop-timekeeper.ts';
import {type AsyncDisposable} from './utils.ts';
import {setupNotepaddStatus} from './status-bar-item/notepadd-status.ts';
import {events} from './bus.ts';
import {DirectivesView} from './view/directives.ts';
import {setupOpenNotebookCommand} from './command/open-notebook.ts';
import {setupExportToLatexCommand} from './command/export-to-latex.ts';
import {PastAlarmsView} from './view/past-alarms.ts';
import {ActiveEventsView} from './view/active-events.ts';

const asyncSubscriptions: AsyncDisposable[] = [];

export async function activate(context: ExtensionContext) {
	try {
		context.subscriptions.push(
			output,
			events,
			setupExportToLatexCommand(),
			setupOpenNotebookCommand(),
			setupRestartTimekeeperCommand(),
			setupStartTimekeeperCommand(),
			setupStopTimekeeperCommand(),
			setupNotepaddStatus(),
			new NotePaddSerializer(),
			new NotePaddController(),
			new ActiveEventsView(),
			new PastAlarmsView(),
			new DirectivesView(),
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
