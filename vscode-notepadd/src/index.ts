/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference types="vite/client" />
/// <reference types="vite-plugin-child-process/client" />
/// <reference types="vite-plugin-vscode/client" />
import {type ExtensionContext} from 'vscode';
import {Bookkeeper} from './bookkeeper.ts';
import {setupBridgeNotification} from './bridge-notification.ts';
import {events} from './bus.ts';
import {setupDirectivesSortByCommands} from './command/directives-sort-by.ts';
import {setupDirectivesViewAsCommands} from './command/directives-view-as.ts';
import {setupExportToLatexCommand} from './command/export-to-latex.ts';
import {setupOpenNotebookCommand} from './command/open-notebook.ts';
import {setupRestartTimekeeperCommand} from './command/restart-timekeeper.ts';
import {setupStartTimekeeperCommand} from './command/start-timekeeper.ts';
import {setupStopTimekeeperCommand} from './command/stop-timekeeper.ts';
import {NotePaddController} from './notebook/notepadd.controller.ts';
import {NotePaddSerializer} from './notebook/notepadd.serializer.ts';
import {output} from './output.ts';
import {setupNotepaddStatus} from './status-bar-item/notepadd-status.ts';
import {Timekeeper} from './timekeeper.ts';
import {type AsyncDisposable} from './utils.ts';
import {ActiveEventsView} from './view/active-events.ts';
import {DirectivesView} from './view/directives.ts';
import {PastAlarmsView} from './view/past-alarms.ts';
import {setupDirectivesFindCommand} from './command/directives-find.ts';
import {setupPastAlarmsFindCommand} from './command/past-alarms-find.ts';
import {setupActiveEventsFindCommand} from './command/active-events-find.ts';

const asyncSubscriptions: AsyncDisposable[] = [];

export async function activate(context: ExtensionContext) {
	try {
		context.subscriptions.push(
			output,
			events,
			setupActiveEventsFindCommand(),
			setupPastAlarmsFindCommand(),
			setupDirectivesFindCommand(),
			setupDirectivesSortByCommands(context),
			setupDirectivesViewAsCommands(),
			setupExportToLatexCommand(),
			setupOpenNotebookCommand(),
			setupRestartTimekeeperCommand(),
			setupStartTimekeeperCommand(),
			setupStopTimekeeperCommand(),
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
