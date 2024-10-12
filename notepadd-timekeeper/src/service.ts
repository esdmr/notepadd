#!/usr/bin/env node
import process from 'node:process';
import {Temporal} from 'temporal-polyfill';
import {
	BookkeeperMessage,
	DiscoveryMessage,
	TimekeeperMessage,
	UpdateMessage,
} from './messages/index.ts';
import {output} from './output.ts';
import {
	applyUpdateDelta,
	getInstances,
	resetTimeouts,
	updateFile,
} from './update.ts';
import {TerminateMessage} from './messages/terminate.ts';
import {FetchMessage} from './messages/fetch.ts';
import {ListMessage} from './messages/list.ts';

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
	const {message} = BookkeeperMessage.from(value);

	if (message instanceof UpdateMessage) {
		const now = Temporal.Now.zonedDateTimeISO();

		for (const [key, content] of Object.entries(message.changed)) {
			try {
				const delta = updateFile(key, content);

				// eslint-disable-next-line no-await-in-loop
				await applyUpdateDelta(delta, now);
			} catch (error) {
				output.error(error);
			}
		}

		// In case bridge was already open, we might have missed the fetch
		// message. Since bridge is not aware of these changes, we must initiate
		// the update.
		process.send!(new TimekeeperMessage(new ListMessage(getInstances())));
	} else if (message instanceof TerminateMessage) {
		process.exit(0);
	} else if (message instanceof FetchMessage) {
		process.send!(new TimekeeperMessage(new ListMessage(getInstances())));
	} else {
		throw new TypeError(
			`Unknown bookkeeper message: ${JSON.stringify(message, undefined, 2)}`,
		);
	}
});

// When the computer goes to sleep, Node.JS might stop tracking timeouts
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

setInterval(async () => {
	const time = Date.now();
	const delta = time - lastTime;

	if (
		delta >= 2 * wakeUpDetectionInterval ||
		delta <= wakeUpDetectionInterval / 2
	) {
		output.warn(
			`System suspense detected (${delta} ms). Resetting all timeouts.`,
		);

		await resetTimeouts();
	}

	lastTime = time;
}, wakeUpDetectionInterval);

process.send(new TimekeeperMessage(new DiscoveryMessage()));
