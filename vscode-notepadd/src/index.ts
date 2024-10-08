/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference types="vite/client" />
/// <reference types="vite-plugin-child-process/client" />
import {type ExtensionContext} from 'vscode';
import {Bookkeeper} from './bookkeeper.ts';
import {NotePaddController} from './notebook/notepadd.controller.ts';
import {NotePaddSerializer} from './notebook/notepadd.serializer.ts';
import {output} from './output.ts';

export async function activate(context: ExtensionContext) {
	const bookkeeper = new Bookkeeper();

	context.subscriptions.push(
		output,
		new NotePaddSerializer(),
		new NotePaddController(),
		bookkeeper,
	);

	await bookkeeper.initialize();
}

export function deactivate() {
	// Do nothing.
}
