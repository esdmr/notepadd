import {commands} from 'vscode';

export function setupPastAlarmsFindCommand() {
	return commands.registerCommand('notepadd.pastAlarms.find', async () => {
		await commands.executeCommand('notepadd.pastAlarms.focus');
		await commands.executeCommand('list.find');
	});
}
