import {commands, ConfigurationTarget, Disposable, workspace} from 'vscode';

export function setupDirectivesViewAsCommands() {
	const handler = (value: boolean) => async () => {
		await workspace
			.getConfiguration('notepadd.view.directives')
			.update('viewAsTree', value, ConfigurationTarget.Global);
	};

	return Disposable.from(
		commands.registerCommand(
			'notepadd.directives.viewAsList',
			handler(false),
		),
		commands.registerCommand(
			'notepadd.directives.viewAsTree',
			handler(true),
		),
	);
}
