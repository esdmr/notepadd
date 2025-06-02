import process from 'node:process';
import {createInterface} from 'node:readline';
import {execa, type Options} from 'execa';
import * as v from 'valibot';
import {type Rollup} from 'vite';
import type {SubviteRegistry} from './registry.ts';

export const subviteIpcMessage = v.variant('_type', [
	v.object({
		_type: v.literal('ref'),
		rootDirectory: v.string(),
		childName: v.string(),
		parentName: v.string(),
	}),
	v.object({
		_type: v.literal('unref'),
		childName: v.string(),
		parentName: v.string(),
	}),
	v.object({
		_type: v.literal('buildStart'),
	}),
	v.object({
		_type: v.literal('closeBundle'),
		error: v.optional(v.string()),
	}),
]);

export type SubviteIpcMessage = v.InferInput<typeof subviteIpcMessage>;

export const subviteEnvironmentVariable = 'VITE_PLUGIN_SUBVITE';
export const subviteOutputDirectory = 'node_modules/.cache/subvite';

export class SubviteProcess {
	readonly dependents = new Set();
	private readonly _process;
	private _lifecycle = new AbortController();
	private _bundle: Rollup.OutputBundle = {};

	get outputDirectory(): string {
		return `${this.rootDirectory}/${subviteOutputDirectory}`;
	}

	constructor(
		readonly name: string,
		readonly rootDirectory: string,
		private readonly _registry: SubviteRegistry,
	) {
		const process = execa(
			'vite',
			[
				'--configLoader',
				'runner',
				'build',
				_registry.context.meta.watchMode ? '-wm' : '-m',
				_registry.mode,
			],
			{
				cwd: rootDirectory,
				ipc: true,
				serialization: 'json',
				reject: false,
				preferLocal: true,
				env: {
					[subviteEnvironmentVariable]: '1',
					// eslint-disable-next-line @typescript-eslint/naming-convention
					TERM: 'dumb',
				},
			} satisfies Options,
		);

		this._process = process;

		_registry.context.info({
			message: `[${process.pid}] Started building at ${rootDirectory}.`,
			id: name,
		});

		createInterface(process.stdout).on('line', (line) => {
			_registry.context.info({message: line, id: name});
		});

		createInterface(process.stderr).on('line', (line) => {
			_registry.context.warn({message: line, id: name});
		});

		process.on('error', (error) => {
			this._lifecycle.abort(error);
		});

		process.on('exit', (code, signal) => {
			this._lifecycle.abort(
				code === 0 ? '' : `Exited with status ${signal ?? code}`,
			);
		});

		(async () => {
			for await (const message_ of process.getEachMessage()) {
				const message = v.parse(subviteIpcMessage, message_);

				switch (message._type) {
					case 'ref': {
						await this._registry.ref(
							message.rootDirectory,
							message.childName,
							message.parentName || name,
						);
						break;
					}

					case 'unref': {
						await this._registry.unref(
							message.childName,
							message.parentName || name,
						);
						break;
					}

					case 'buildStart': {
						this._bundle = {};

						if (this._lifecycle.signal.aborted) {
							this._lifecycle = new AbortController();
						}

						break;
					}

					case 'closeBundle': {
						this._lifecycle.abort(message.error ?? '');
						break;
					}
				}
			}
		})();
	}

	async waitForBuild(): Promise<Rollup.OutputBundle> {
		if (!this._lifecycle.signal.aborted) {
			await Promise.race([
				this._process,
				new Promise<void>((resolve) => {
					this._lifecycle.signal.addEventListener(
						'abort',
						() => {
							resolve();
						},
						{once: true},
					);
				}),
			]);
		}

		if (
			!this._lifecycle.signal.aborted ||
			this._lifecycle.signal.reason ||
			this._process.exitCode
		) {
			this._registry.context.error({
				message: String(
					this._lifecycle.signal.reason ||
						`Exited with status ${this._process.exitCode} (or bundle was not generated)`,
				),
				id: this.name,
			});
		}

		return this._bundle;
	}

	kill(): void {
		this._process.kill();
		this._registry.context.info({
			message: `[${process.pid}] Stopped ${this.name}.`,
		});
	}
}

export function isSubvite(): boolean {
	return process.env[subviteEnvironmentVariable] === '1';
}
