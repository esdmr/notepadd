import { commands } from 'vscode';
import { onTimekeeperRestartRequested } from '../bus.ts';

export function setupRestartTimekeeperCommand() {
	return commands.registerCommand('notepadd.restartTimekeeper', () => {
		onTimekeeperRestartRequested.fire();
	});
}
