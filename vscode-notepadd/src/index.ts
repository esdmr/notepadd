/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference types="vite/client" />
/// <reference types="vite-plugin-child-process/client" />
import {type ExtensionContext} from 'vscode';
import {setupController} from './notebook/notepadd.controller.ts';
import {setupSerializer} from './notebook/notepadd.serializer.ts';
import {setupBookkeeper} from './bookkeeper.ts';
import {output} from './output.ts';

export async function activate(context: ExtensionContext) {
	context.subscriptions.push(output);
	setupSerializer(context);
	await setupController(context);
	await setupBookkeeper(context);
}

export function deactivate() {
	// Do nothing.
}
