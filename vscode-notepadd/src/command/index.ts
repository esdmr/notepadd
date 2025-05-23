import {Disposable, type ExtensionContext} from 'vscode';
import {setupActiveEventsFindCommand} from './active-events/find.ts';
import {setupActiveEventsSortByCommands} from './active-events/sort-by.ts';
import {setupActiveEventsViewAsCommands} from './active-events/view-as.ts';
import {setupDirectivesFindCommand} from './directives/find.ts';
import {setupDirectivesSortByCommands} from './directives/sort-by.ts';
import {setupDirectivesViewAsCommands} from './directives/view-as.ts';
import {setupPastAlarmsFindCommand} from './past-alarms/find.ts';
import {setupPastAlarmsSortByCommands} from './past-alarms/sort-by.ts';
import {setupRestartTimekeeperCommand} from './timekeeper/restart.ts';
import {setupStartTimekeeperCommand} from './timekeeper/start.ts';
import {setupStopTimekeeperCommand} from './timekeeper/stop.ts';
import {setupExportToLatexCommand} from './export-to-latex.ts';
import {setupOpenNotebookCommand} from './open-notebook.ts';

export function setupCommands(context: ExtensionContext): Disposable {
	return Disposable.from(
		setupActiveEventsFindCommand(),
		setupActiveEventsSortByCommands(context),
		setupActiveEventsViewAsCommands(),
		setupDirectivesFindCommand(),
		setupDirectivesSortByCommands(context),
		setupDirectivesViewAsCommands(),
		setupPastAlarmsFindCommand(),
		setupPastAlarmsSortByCommands(),
		setupRestartTimekeeperCommand(),
		setupStartTimekeeperCommand(),
		setupStopTimekeeperCommand(),
		setupExportToLatexCommand(),
		setupOpenNotebookCommand(),
	);
}
