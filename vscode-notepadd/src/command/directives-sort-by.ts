import orderAscendingIcon from 'command-icon:notepadd.directives.sortFromOrderAscending';
import orderDescendingIcon from 'command-icon:notepadd.directives.sortFromOrderDescending';
import timeAscendingIcon from 'command-icon:notepadd.directives.sortFromTimeAscending';
import timeDescendingIcon from 'command-icon:notepadd.directives.sortFromTimeDescending';
import {
	commands,
	ConfigurationTarget,
	Disposable,
	ThemeIcon,
	Uri,
	window,
	workspace,
	type ExtensionContext,
	type QuickPickItem,
} from 'vscode';
import type {SortBy} from '../view/directives.ts';

type SortByQuickPickItem = QuickPickItem & {
	value: SortBy;
};

export function setupDirectivesSortByCommands(context: ExtensionContext) {
	const generateIcon = (
		icon: typeof timeAscendingIcon,
	): QuickPickItem['iconPath'] => {
		if (icon instanceof ThemeIcon) {
			return icon;
		}

		if (typeof icon === 'string') {
			return Uri.joinPath(context.extensionUri, icon);
		}

		return icon.light && icon.dark
			? {
					light: Uri.joinPath(context.extensionUri, icon.light),
					dark: Uri.joinPath(context.extensionUri, icon.dark),
				}
			: undefined;
	};

	const quickPickItems: readonly SortByQuickPickItem[] = [
		{
			value: 'timeAscending',
			label: 'Time, Ascending',
			iconPath: generateIcon(timeAscendingIcon),
		},
		{
			value: 'timeDescending',
			label: 'Time, Descending',
			iconPath: generateIcon(timeDescendingIcon),
		},
		{
			value: 'orderAscending',
			label: 'Order, Ascending',
			iconPath: generateIcon(orderAscendingIcon),
		},
		{
			value: 'orderDescending',
			label: 'Order, Descending',
			iconPath: generateIcon(orderDescendingIcon),
		},
	];

	const handler = (previous: SortBy) => async () => {
		const result = await window.showQuickPick(
			quickPickItems.map((i) => ({...i, picked: i.value === previous})),
			{
				placeHolder: 'Sort by…',
			},
		);

		if (!result) return;

		await workspace
			.getConfiguration('notepadd.view.directives')
			.update('sortBy', result?.value, ConfigurationTarget.Global);
	};

	return Disposable.from(
		commands.registerCommand(
			'notepadd.directives.sortFromTimeAscending',
			handler('timeAscending'),
		),
		commands.registerCommand(
			'notepadd.directives.sortFromTimeDescending',
			handler('timeDescending'),
		),
		commands.registerCommand(
			'notepadd.directives.sortFromOrderAscending',
			handler('orderAscending'),
		),
		commands.registerCommand(
			'notepadd.directives.sortFromOrderDescending',
			handler('orderDescending'),
		),
	);
}
