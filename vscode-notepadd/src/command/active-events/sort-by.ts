import orderAscendingIcon from 'icon:order-ascending';
import orderDescendingIcon from 'icon:order-descending';
import timeAscendingIcon from 'icon:time-ascending';
import timeDescendingIcon from 'icon:time-descending';
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
import type {DirectivesSortBy} from '../../view/directives.ts';

type SortByQuickPickItem = QuickPickItem & {
	value: DirectivesSortBy;
};

export function setupActiveEventsSortByCommands(
	context: ExtensionContext,
): Disposable {
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

	const handler = (previous: DirectivesSortBy) => async () => {
		const result = await window.showQuickPick(
			quickPickItems.map((i) => ({...i, picked: i.value === previous})),
			{
				placeHolder: 'Sort by…',
			},
		);

		if (!result) return;

		await workspace
			.getConfiguration('notepadd.view.activeEvents')
			.update('sortBy', result?.value, ConfigurationTarget.Global);
	};

	return Disposable.from(
		commands.registerCommand(
			'notepadd.activeEvents.sortFromTimeAscending',
			handler('timeAscending'),
		),
		commands.registerCommand(
			'notepadd.activeEvents.sortFromTimeDescending',
			handler('timeDescending'),
		),
		commands.registerCommand(
			'notepadd.activeEvents.sortFromOrderAscending',
			handler('orderAscending'),
		),
		commands.registerCommand(
			'notepadd.activeEvents.sortFromOrderDescending',
			handler('orderDescending'),
		),
	);
}
