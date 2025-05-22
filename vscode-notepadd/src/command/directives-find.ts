import {commands} from 'vscode';

export function setupDirectivesFindCommand() {
	return commands.registerCommand('notepadd.directives.find', async () => {
		await commands.executeCommand('notepadd.directives.focus');
		await commands.executeCommand('list.find');
	});
}
