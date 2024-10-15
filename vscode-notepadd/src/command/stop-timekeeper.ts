import {commands} from 'vscode';
import {onTimekeeperStopRequested} from '../bus.ts';

export function setupStopTimekeeperCommand() {
	return commands.registerCommand('notepadd.stopTimekeeper', async () => {
		return onTimekeeperStopRequested.fire();
	});
}
