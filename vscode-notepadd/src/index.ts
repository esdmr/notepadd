/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference types="vite/client" />
import {type ExtensionContext} from 'vscode';
import {setupController} from './notebook/notepadd.controller.ts';
import {setupSerializer} from './notebook/notepadd.serializer.ts';

export async function activate(context: ExtensionContext) {
	setupSerializer(context);
	await setupController(context);
}

export function deactivate() {
	// Do nothing.
}
