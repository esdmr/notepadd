import {commands, type Disposable} from 'vscode';
import {onTimekeeperStopRequested} from '../../bus.ts';

export function setupStopTimekeeperCommand(): Disposable {
	return commands.registerCommand('notepadd.stopTimekeeper', async () => {
		return onTimekeeperStopRequested.fire();
	});
}
