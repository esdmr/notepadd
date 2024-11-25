/* eslint-disable unicorn/prefer-event-target */
import type {DirectiveState} from 'notepadd-timekeeper';
import {Disposable, EventEmitter} from 'vscode';
import {AsyncEventEmitter, VirtualSocket} from './utils.ts';

export type NotepaddStatus = {
	readonly bookkeeperHealth?: 'active' | 'starting' | 'error' | 'unknown';
	readonly timekeeperHealth?:
		| 'running'
		| 'starting'
		| 'error'
		| 'stopped'
		| 'unknown';
};

export const onTimekeeperRestartRequested = new AsyncEventEmitter<void>();
export const onTimekeeperStartRequested = new EventEmitter<void>();
export const onTimekeeperStopRequested = new AsyncEventEmitter<void>();
export const onStatusUpdated = new EventEmitter<NotepaddStatus>();
export const onBookkeeperCached = new EventEmitter<
	ReadonlyMap<string, string>
>();
export const onBookkeeperUpdated = new EventEmitter<[string, string]>();
export const onTimekeeperStarted = new EventEmitter<void>();
export const onTimekeeperUpdated = new EventEmitter<DirectiveState[]>();
export const onTimekeeperTriggered = new EventEmitter<DirectiveState>();
export const onTimekeeperStalled = new EventEmitter<void>();

export const events = Disposable.from(
	onTimekeeperRestartRequested,
	onTimekeeperStartRequested,
	onTimekeeperStopRequested,
	onStatusUpdated,
	onBookkeeperCached,
	onBookkeeperUpdated,
	onTimekeeperStarted,
	onTimekeeperUpdated,
	onTimekeeperTriggered,
	onTimekeeperStalled,
);

export const bridgeSocket = new VirtualSocket();
