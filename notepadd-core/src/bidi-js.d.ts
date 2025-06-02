/* eslint-disable @typescript-eslint/no-restricted-types */

declare module 'bidi-js' {
	function bidiFactory(): {
		readonly __esModule: true;

		openingToClosingBracket(char: string): string | null;
		closingToOpeningBracket(char: string): string | null;
		getCanonicalBracket(char: string): string | null;

		getBidiCharType(char: string): number;
		getBidiCharTypeName(char: string): string;

		getEmbeddingLevels(
			string: string,
			baseDirection?: 'ltr' | 'rtl' | 'auto',
		): {
			paragraphs: Array<{start: number; end: number; level: number}>;
			levels: Uint8Array;
		};
		getMirroredCharacter(char: string): string | null;
		getMirroredCharactersMap(
			string: string,
			embeddingLevels: Uint8Array,
			start?: number,
			end?: number,
		): Map<number, string>;

		getReorderSegments(
			string: string,
			embeddingLevels: Uint8Array,
			start?: number,
			end?: number,
		): number[][];
		getReorderedIndices(
			string: string,
			embeddingLevels: Uint8Array,
			start?: number,
			end?: number,
		): number[];
		getReorderedString(
			string: string,
			embeddingLevels: Uint8Array,
			start?: number,
			end?: number,
		): string;
	};
	export = bidiFactory;
}
