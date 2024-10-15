/* eslint-disable unicorn/prefer-event-target */
import {EventEmitter} from 'vscode';
import {AsyncEventEmitter} from './utils.ts';

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
