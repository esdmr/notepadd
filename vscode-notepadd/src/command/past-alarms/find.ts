import {commands, type Disposable} from 'vscode';

export function setupPastAlarmsFindCommand(): Disposable {
	return commands.registerCommand('notepadd.pastAlarms.find', async () => {
		await commands.executeCommand('notepadd.pastAlarms.focus');
		await commands.executeCommand('list.find');
	});
}
