import {window} from 'vscode';
import {onTimekeeperTriggered} from './bus.ts';

export function setupBridgeNotification() {
	return onTimekeeperTriggered.event((state) => {
		void window.showInformationMessage(
			`Beep! ${state.instance.currentState === 'low' ? 'Event ended: ' : ''}${state.directive.getLabel() ?? state.directive.directive.toString()}`,
		);
	});
}
