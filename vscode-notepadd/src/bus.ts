import { EventEmitter, type MarkdownString } from 'vscode';
import { AsyncEventEmitter } from './utils.ts';

export type NotepaddStatus = {
	readonly bookkeeperHealth: 'active' | 'starting' | 'error';
	readonly timekeeperHealth: 'running' | 'starting' | 'error' | 'stopped';
};

export const onTimekeeperRestartRequested = new AsyncEventEmitter<void>();
export const onTimekeeperStartRequested = new EventEmitter<void>();
export const onTimekeeperStopRequested = new AsyncEventEmitter<void>();
export const onStatusUpdated = new EventEmitter<NotepaddStatus>();
