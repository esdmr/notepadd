import type {Jsonifiable} from 'type-fest';

export type NotePadd = {
	cells: NotePaddCell[];
	metadata?: NotePaddMetadata;
};

export type NotePaddCell = {
	type: 'code' | 'markup';
	lang: string;
	source: string;
	metadata?: NotePaddMetadata;
	outputs?: NotePaddOutput[];
	executionSummary?: NotePaddExecutionSummary;
};

export type NotePaddExecutionSummary = {
	executionOrder?: number;
	success?: boolean;
	timing?: NotePaddTiming;
};

export type NotePaddTiming = {
	startTime: number;
	endTime: number;
};

export type NotePaddOutput = {
	items: NotePaddOutputItems;
	metadata?: NotePaddMetadata;
};

export type NotePaddOutputItems = Record<string, Uint8Array>;
export type NotePaddMetadata = Record<string, Jsonifiable | undefined>;
