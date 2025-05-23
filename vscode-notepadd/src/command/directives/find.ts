import {commands, type Disposable} from 'vscode';

export function setupDirectivesFindCommand(): Disposable {
	return commands.registerCommand('notepadd.directives.find', async () => {
		await commands.executeCommand('notepadd.directives.focus');
		await commands.executeCommand('list.find');
	});
}
