import assert from 'node:assert';
import path from 'node:path';
import {readdir, readFile, readlink} from 'node:fs/promises';
import {exports} from 'resolve.exports';
import type {PackageJson} from 'type-fest';
import {normalizePath, type Rollup} from 'vite';
import {sendMessage} from 'execa';
import {
	isSubvite,
	subviteOutputDirectory,
	SubviteProcess,
	type SubviteIpcMessage,
} from './process.ts';

/** @see https://github.com/vitejs/vite/blob/54e0a18773be6f6c35d92db5be7f3e6159c23589/packages/vite/src/shared/utils.ts#L31-L34 */
const postfixPattern = /[?#].*$/;

function cleanUrl(url: string): string {
	return url.replace(postfixPattern, '');
}

export const dependencyPattern = /^(?!\.{0,2}\/)/;

/** @see https://github.com/vitejs/vite/blob/f6a28d5f792ba5cc4dc236e3e6edd05199cabcc8/packages/vite/src/node/constants.ts#L81-L88 */
const defaultConfigFiles = [
	'vite.config.js',
	'vite.config.mjs',
	'vite.config.ts',
	'vite.config.cjs',
	'vite.config.mts',
	'vite.config.cts',
];

export class SubviteRegistry {
	private readonly _directDependencies = new Set<string>();
	private readonly _processes = new Map<string, SubviteProcess>();

	constructor(
		readonly context: Rollup.PluginContext,
		readonly mode: string,
		private readonly _filter: (name: string) => boolean,
	) {}

	async update(json: PackageJson): Promise<void> {
		const newDirectories = await this._findDirectories(json);

		for (const [subviteName, rootDirectory] of newDirectories) {
			this._directDependencies.add(subviteName);
			await this.ref(rootDirectory, subviteName);
		}

		for (const name of this._directDependencies) {
			if (!newDirectories.has(name)) {
				await this.unref(name);
			}
		}
	}

	async resolveId(
		source: string,
		importer: string | undefined,
		alwaysExternalize = false,
	): Promise<Rollup.ResolveIdResult> {
		if (source.startsWith('\0')) return;

		const postfixMatch = postfixPattern.exec(source) ?? [''];
		source = cleanUrl(source);

		for (const name of this._directDependencies) {
			if (source !== name && !source.startsWith(name + '/')) continue;

			const subvite = this._processes.get(name);

			assert.ok(
				subvite,
				`Unreachable: We are not in a subvite, so we should have the child process for ${name}, but it seems as if we do not. If we were in a subvite, resolution would have been marked as external already, so the process and the direct dependencies collections might have diverged.`,
			);

			await subvite.waitForBuild();

			const code = await readFile(
				subvite.outputDirectory + '/package.json',
				'utf8',
			);

			const json = JSON.parse(code) as PackageJson;

			const [resolution] =
				exports(json, '.' + source.slice(name.length)) ?? [];

			if (!resolution) {
				this.context.error({message: 'Failed to resolve', id: source});
			}

			return this.context.resolve(
				subvite.outputDirectory + resolution.slice(1) + postfixMatch[0],
				importer,
				{skipSelf: true},
			);
		}
	}

	async load(
		id: string,
		context: Rollup.PluginContext = this.context,
	): Promise<Rollup.LoadResult> {
		if (id.startsWith('\0')) return;

		for (const subvite of this._processes.values()) {
			if (!id.startsWith(`${subvite.outputDirectory}/`)) continue;

			await subvite.waitForBuild();

			let content: string;
			let map: string | undefined;

			try {
				const cleanedId = cleanUrl(id);
				content = await readFile(cleanedId, 'utf8');
				id = cleanedId;
			} catch {
				content = await readFile(id, 'utf8');
			}

			context.addWatchFile(id);

			try {
				map = await readFile(id + '.map', 'utf8');
			} catch {}

			return {
				code: content,
				map,
			};
		}
	}

	async waitForAllBuilds(): Promise<void> {
		await Promise.all(
			[...this._processes.values()].map(async (i) => i.waitForBuild()),
		);
	}

	async ref(
		rootDirectory: string,
		childName: string,
		parentName = '',
	): Promise<void> {
		if (isSubvite()) {
			await sendMessage({
				_type: 'ref',
				rootDirectory,
				childName,
				parentName,
			} satisfies SubviteIpcMessage);
			return;
		}

		this.context.info({
			message: `Referenced ${childName} at ${rootDirectory}.`,
			id: parentName || undefined,
		});

		const process =
			this._processes.get(childName) ??
			new SubviteProcess(childName, rootDirectory, this);

		if (process.rootDirectory !== rootDirectory) {
			this.context.error(
				`Subvite ${childName} has different directory roots in some dependency subtrees. (${JSON.stringify(rootDirectory)} ≠ ${JSON.stringify(process.rootDirectory)})`,
			);
		}

		this._processes.set(childName, process);
		process.dependents.add(parentName);
	}

	async unref(childName: string, parentName = ''): Promise<void> {
		if (isSubvite()) {
			await sendMessage({
				_type: 'unref',
				childName,
				parentName,
			} satisfies SubviteIpcMessage);
			return;
		}

		this.context.info({
			message: `Unreferenced ${childName}.`,
			id: parentName || undefined,
		});

		const process = this._processes.get(childName);

		if (!process) {
			this.context.error(
				`Unref called on an unknown dependency, ${childName} imported by ${parentName}.`,
			);
		}

		process.dependents.delete(parentName);

		if (process.dependents.size === 0) {
			process.kill();
			this._processes.delete(childName);
		}
	}

	async _findDirectories(json: PackageJson): Promise<Map<string, string>> {
		const directories = new Map<string, string>();

		for (const [name, version] of Object.entries(json.dependencies ?? {})) {
			if (!version?.startsWith('workspace:') || !this._filter(name))
				continue;

			const target = await readlink(`node_modules/${name}`);
			const rootDirectory = path.resolve('node_modules', target);

			const files = await readdir(rootDirectory);
			const configFile = defaultConfigFiles.find((i) =>
				files.includes(i),
			);

			if (configFile) {
				directories.set(name, rootDirectory);
			}
		}

		return directories;
	}
}
