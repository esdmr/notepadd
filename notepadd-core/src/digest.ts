/* eslint-disable no-bitwise */
/**
 * This number is randomly chosen. It is passed as a seed into the Murmur3 hash
 * function below. Generated file names may change if the seed is changed.
 */
const seed = 0x0b_b1_08_36;

/**
 * - `mem[0]`: `hash`
 * - `mem[1]`: `key` offset
 * - `mem[2]`: `k`
 */
const mem = new Uint32Array(3);

export function* getContentDigest(content: Uint8Array): Generator<string> {
	// The Crypto API is asynchronous, but this function must remain
	// synchronous. This is an implementation of Murmur3 non-cryptographic hash
	// function.
	//
	// See: https://en.wikipedia.org/wiki/MurmurHash#Algorithm

	const view = new DataView(content.buffer);

	mem[0] = seed;
	mem[1] = 0;

	for (let i = view.byteLength >>> 2; i; i--) {
		mem[2] = view.getUint32(mem[1]);
		mem[2] *= 0xcc_9e_2d_51;
		mem[2] = (mem[2] << 15) | (mem[2] >>> 17);
		mem[2] *= 0x1b_87_35_93;
		mem[1] += Uint32Array.BYTES_PER_ELEMENT;
		mem[0] ^= mem[2];
		mem[0] = (mem[0] << 13) | (mem[0] >>> 19);
		mem[0] = mem[0] * 5 + 0xe6_54_6b_64;
	}

	mem[2] = 0;

	for (let i = view.byteLength & 3; i; i--) {
		mem[2] <<= 8;
		mem[2] |= view.getUint8(mem[1] + i - 1);
	}

	mem[2] *= 0xcc_9e_2d_51;
	mem[2] = (mem[2] << 15) | (mem[2] >>> 17);
	mem[2] *= 0x1b_87_35_93;
	mem[0] ^= mem[2];

	mem[0] ^= view.byteLength;
	mem[0] ^= mem[0] >>> 16;
	mem[0] *= 0x85_eb_ca_6b;
	mem[0] ^= mem[0] >>> 13;
	mem[0] *= 0xc2_b2_ae_35;
	mem[0] ^= mem[0] >>> 16;

	let digest = '';

	for (let i = 4; i; i--) {
		digest += Math.abs(mem[0] & 15).toString(16);
		mem[0] >>>= 4;
	}

	for (let i = 0; ; i++) {
		yield digest + (i ? i.toString(16) : '');
	}
}
