import {commands} from 'vscode';

export function setupActiveEventsFindCommand() {
	return commands.registerCommand('notepadd.activeEvents.find', async () => {
		await commands.executeCommand('notepadd.activeEvents.focus');
		await commands.executeCommand('list.find');
	});
}
