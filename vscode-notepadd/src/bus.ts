import { EventEmitter } from 'vscode';
import { AsyncEventEmitter } from './utils.ts';

export const onTimekeeperRestartRequested = new AsyncEventEmitter<void>();
export const onTimekeeperStartRequested = new EventEmitter<void>();
export const onTimekeeperStopRequested = new AsyncEventEmitter<void>();
