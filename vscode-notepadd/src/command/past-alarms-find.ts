import {commands} from 'vscode';

export function setupPastAlarmsFindCommand() {
	return commands.registerCommand('notepadd.past-alarms.find', async () => {
		await commands.executeCommand('notepadd-past-alarms.focus');
		await commands.executeCommand('list.find');
	});
}
