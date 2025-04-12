#!/usr/bin/env node
import process from 'node:process';
import {v} from 'notepadd-core';
import {
	BookkeeperMessage,
	DiscoveryMessage,
	TimekeeperMessage,
	UpdateMessage,
} from './messages/index.ts';
import {ListMessage} from './messages/list.ts';
import {TerminateMessage} from './messages/terminate.ts';
import {output} from './output.ts';
import {getDirectiveStates, processUpdate, resetTimeouts} from './update.ts';

if (!process.send) {
	// Do not use `output` here. It requires an IPC channel to pass messages,
	// but none exist in this branch.
	console.error('Timekeeper may not be run on its own.');
	process.exit(1);
}

process.on('uncaughtExceptionMonitor', (error, origin) => {
	output.error(
		origin === 'unhandledRejection'
			? 'Unhandled Promise Rejection:'
			: 'Uncaught Exception:',
		error,
	);
});

process.on('message', async (value) => {
	const {message} = v.parse(BookkeeperMessage.schema, value);

	if (message instanceof UpdateMessage) {
		processUpdate(message);

		if (message.fetchRequested) {
			process.send!(
				new TimekeeperMessage(new ListMessage(getDirectiveStates())),
			);
		}
	} else if (message instanceof TerminateMessage) {
		process.exit(0);
	} else {
		throw new TypeError(
			`Bug: Unknown bookkeeper message: ${JSON.stringify(message, undefined, 2)}`,
		);
	}
});

// When the computer goes to sleep, Node.js might stop tracking timeouts
// accurately and may even forget to call some of them.
//
// - If the sleep duration is ignored, the timeouts would get triggered later
//   than they should. This makes any alarm or event unreliable.
// - More importantly, if the timeout is entirely skipped, the directive would
//   entirely stop functioning, since its update relies on nested `setTimeout`
//   calls.
//
// To fix this, we would immediately trigger the timeout at wake-up. This will
// recalculate the timeout delay until the next instance. Unfortunately, the
// only reliable, cross-platform way to do this would be a `setInterval` with a
// short delay. If the delay between two callback calls surpass a threshold
// (twice the delay here), we will reset the timeouts.
const wakeUpDetectionInterval = 30_000;
let lastTime = Date.now();

setInterval(() => {
	const time = Date.now();
	const delta = time - lastTime;

	if (
		delta >= 2 * wakeUpDetectionInterval ||
		delta <= wakeUpDetectionInterval / 2
	) {
		output.warn(
			`System suspense detected (${delta} ms). Resetting all timeouts.`,
		);

		resetTimeouts();
	}

	lastTime = time;
}, wakeUpDetectionInterval);

process.send(new TimekeeperMessage(new DiscoveryMessage()));
