import {commands, ConfigurationTarget, Disposable, workspace} from 'vscode';

export function setupActiveEventsViewAsCommands() {
	const handler = (value: boolean) => async () => {
		await workspace
			.getConfiguration('notepadd.view.activeEvents')
			.update('viewAsTree', value, ConfigurationTarget.Global);
	};

	return Disposable.from(
		commands.registerCommand(
			'notepadd.activeEvents.viewAsList',
			handler(false),
		),
		commands.registerCommand(
			'notepadd.activeEvents.viewAsTree',
			handler(true),
		),
	);
}
