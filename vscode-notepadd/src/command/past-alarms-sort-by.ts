import {commands, ConfigurationTarget, Disposable, workspace} from 'vscode';
import type {InstancesSortBy} from '../view/past-alarms.ts';

export function setupPastAlarmsSortByCommands() {
	const handler = (value: InstancesSortBy) => async () => {
		await workspace
			.getConfiguration('notepadd.view.pastAlarms')
			.update('sortBy', value, ConfigurationTarget.Global);
	};

	return Disposable.from(
		commands.registerCommand(
			'notepadd.pastAlarms.sortFromTimeAscending',
			handler('timeDescending'),
		),
		commands.registerCommand(
			'notepadd.pastAlarms.sortFromTimeDescending',
			handler('timeAscending'),
		),
	);
}
