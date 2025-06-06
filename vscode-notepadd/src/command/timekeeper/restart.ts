import {commands, type Disposable} from 'vscode';
import {onTimekeeperRestartRequested} from '../../bus.ts';

export function setupRestartTimekeeperCommand(): Disposable {
	return commands.registerCommand('notepadd.restartTimekeeper', async () => {
		return onTimekeeperRestartRequested.fire();
	});
}
