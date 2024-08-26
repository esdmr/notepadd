import {type ExtensionContext} from 'vscode';
import {setupController} from './notebook/controller.ts';
import {setupSerializer} from './notebook/serializer.ts';

export function activate(context: ExtensionContext) {
	setupSerializer(context);
	setupController(context);
}

export function deactivate() {
	// Do nothing.
}
