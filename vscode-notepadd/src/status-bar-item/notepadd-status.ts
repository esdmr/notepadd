import {
	Disposable,
	MarkdownString,
	StatusBarAlignment,
	ThemeColor,
	window,
} from 'vscode';
import {onStatusUpdated, type NotepaddStatus} from '../bus.ts';

export function setupNotepaddStatus() {
	const statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);

	let lastStatus: Required<NotepaddStatus> = {
		bookkeeperHealth: 'unknown',
		timekeeperHealth: 'unknown',
	};

	const handler = onStatusUpdated.event((status) => {
		lastStatus = {...lastStatus, ...status};

		const tooltip = new MarkdownString('', true);
		tooltip.isTrusted = true;
		tooltip.appendMarkdown('# NotePADD Service Status');

		let command: string | undefined;
		let color: 'normal' | 'warning' | 'error' = 'normal';
		let icon: 'inactive' | 'busy' | 'active' = 'inactive';

		switch (lastStatus.bookkeeperHealth) {
			case 'active': {
				tooltip.appendMarkdown('\n\nBookkeeper is $(play) **active**.');
				break;
			}

			case 'starting': {
				icon = 'busy';
				tooltip.appendMarkdown(
					'\n\nBookkeeper is $(loading~spin) **starting**.',
				);
				color = 'warning';
				break;
			}

			case 'error': {
				tooltip.appendMarkdown(
					'\n\nBookkeeper is $(error) **faulty**.\n\n[Restart Extension Host](command:workbench.action.restartExtensionHost)',
				);
				color = 'error';
				break;
			}

			case 'unknown': {
				tooltip.appendMarkdown(
					'\n\n$(loading~spin) *Awaiting status from Bookkeeper.*',
				);
				color = 'warning';
				break;
			}
		}

		switch (lastStatus.timekeeperHealth) {
			case 'running': {
				icon = 'active';
				tooltip.appendMarkdown(
					'\n\nTimekeeper is $(play) **running**.\n\n[Stop Timekeeper](command:notepadd.stopTimekeeper)\n\n[Restart Timekeeper](command:notepadd.restartTimekeeper)',
				);
				break;
			}

			case 'starting': {
				icon = 'busy';
				tooltip.appendMarkdown(
					'\n\nTimekeeper is $(loading~spin) **starting**.\n\n[Stop Timekeeper](command:notepadd.stopTimekeeper)\n\n[Restart Timekeeper](command:notepadd.restartTimekeeper)',
				);
				if (color !== 'error') color = 'warning';
				break;
			}

			case 'error': {
				tooltip.appendMarkdown(
					'\n\nTimekeeper is $(error) **faulty**.\n\n[Start Timekeeper](command:notepadd.startTimekeeper)',
				);
				color = 'error';
				command = 'notepadd.startTimekeeper';
				break;
			}

			case 'stopped': {
				tooltip.appendMarkdown(
					'\n\nTimekeeper is $(circle-slash) **not running**.\n\n[Start Timekeeper](command:notepadd.startTimekeeper)',
				);
				if (color !== 'error') color = 'warning';
				command = 'notepadd.startTimekeeper';
				break;
			}

			case 'unknown': {
				tooltip.appendMarkdown(
					'\n\n$(loading~spin) *Awaiting status from Timekeeper.*',
				);
				if (color !== 'error') color = 'warning';
			}
		}

		switch (color) {
			case 'normal': {
				statusBarItem.color = undefined;
				statusBarItem.backgroundColor = undefined;
				break;
			}

			case 'warning': {
				statusBarItem.color = new ThemeColor(
					'statusBarItem.warningForeground',
				);
				statusBarItem.backgroundColor = new ThemeColor(
					'statusBarItem.warningBackground',
				);
				break;
			}

			case 'error': {
				statusBarItem.color = new ThemeColor(
					'statusBarItem.errorForeground',
				);
				statusBarItem.backgroundColor = new ThemeColor(
					'statusBarItem.errorBackground',
				);
				break;
			}
		}

		switch (icon) {
			case 'inactive': {
				statusBarItem.text = '$(compass)';
				break;
			}

			case 'busy': {
				statusBarItem.text = '$(compass-dot)';
				break;
			}

			case 'active': {
				statusBarItem.text = '$(compass-active)';
				break;
			}
		}

		statusBarItem.name = 'NotePADD Service Status';
		statusBarItem.tooltip = tooltip;
		statusBarItem.command = command;
		statusBarItem.show();
	});

	return Disposable.from(statusBarItem, handler);
}
