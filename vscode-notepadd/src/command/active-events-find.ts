import {commands} from 'vscode';

export function setupActiveEventsFindCommand() {
	return commands.registerCommand('notepadd.active-events.find', async () => {
		await commands.executeCommand('notepadd-active-events.focus');
		await commands.executeCommand('list.find');
	});
}
