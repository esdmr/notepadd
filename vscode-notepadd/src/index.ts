import {type ExtensionContext} from 'vscode';
import {setupController} from './notebook/controller.ts';
import {setupSerializer} from './notebook/serializer.ts';

export async function activate(context: ExtensionContext) {
	setupSerializer(context);
	await setupController(context);
}

export function deactivate() {
	// Do nothing.
}
