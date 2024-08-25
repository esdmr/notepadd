import {type ExtensionContext} from 'vscode';
import {setupSerializer} from './notebook/serializer.ts';

export function activate(context: ExtensionContext) {
	setupSerializer(context);
}

export function deactivate() {
	// Do nothing.
}
