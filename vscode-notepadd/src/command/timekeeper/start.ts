import {commands, type Disposable} from 'vscode';
import {onTimekeeperStartRequested} from '../../bus.ts';

export function setupStartTimekeeperCommand(): Disposable {
	return commands.registerCommand('notepadd.startTimekeeper', () => {
		onTimekeeperStartRequested.fire();
	});
}
