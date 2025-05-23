import {commands, type Disposable} from 'vscode';

export function setupActiveEventsFindCommand(): Disposable {
	return commands.registerCommand('notepadd.activeEvents.find', async () => {
		await commands.executeCommand('notepadd.activeEvents.focus');
		await commands.executeCommand('list.find');
	});
}
