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
export type NotePaddMetadata = Record<string, unknown>;

export function getLastCell(context: NotePadd) {
	const lastCell = context.cells.at(-1);
	if (lastCell) return lastCell;

	const dummyCell: NotePaddCell = {
		type: 'markup',
		lang: 'markdown',
		source: '',
	};

	context.cells.push(dummyCell);
	return dummyCell;
}

export function getLastOutput(context: NotePadd) {
	const lastCell = getLastCell(context);
	lastCell.outputs ??= [];

	const lastOutput = lastCell.outputs.at(-1);
	if (lastOutput) return lastOutput;

	const dummyOutput: NotePaddOutput = {
		items: {},
	};

	lastCell.outputs.push(dummyOutput);
	return dummyOutput;
}
