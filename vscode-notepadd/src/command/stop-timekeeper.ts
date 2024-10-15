import { commands } from 'vscode';
import { onTimekeeperStopRequested } from '../bus.ts';

export function setupStopTimekeeperCommand() {
	return commands.registerCommand('notepadd.stopTimekeeper', () => {
		onTimekeeperStopRequested.fire();
	});
}
