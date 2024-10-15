import { commands } from 'vscode';
import { onTimekeeperStartRequested } from '../bus.ts';

export function setupStartTimekeeperCommand() {
	return commands.registerCommand('notepadd.startTimekeeper', () => {
		onTimekeeperStartRequested.fire();
	});
}
