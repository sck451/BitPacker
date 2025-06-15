import type { Bit } from "./Bit.ts";

export function getUint(bits: Bit[]): number {
  return bits.reduce<number>((acc, curr) => (acc << 1) | curr, 0) >>> 0;
}

export function parseUint8(num: number): Bit[] {
  return parseUint(num, 8);
}

export function parseUint16(num: number): Bit[] {
  return parseUint(num, 16);
}

export function parseUint32(num: number): Bit[] {
  return parseUint(num, 32);
}

export function getInt(bits: Bit[]): number {
  const length = bits.length;
  if (length === 0) {
    throw new RangeError("Empty bits array");
  }

  const signBit = bits[0];
  const unsignedValue = getUint(bits);

  if (signBit === 0) {
    return unsignedValue;
  } else {
    return unsignedValue - (2 ** length);
  }
}

export function parseInt8(num: number): Bit[] {
  return parseSignedInt(num, 8);
}

export function parseInt16(num: number): Bit[] {
  return parseSignedInt(num, 16);
}

export function parseInt32(num: number): Bit[] {
  return parseSignedInt(num, 32);
}

function chunkArray<T>(arr: T[]): T[][] {
  return arr.reduce<T[][]>((output, el, index) => {
    const chunkIdx = Math.floor(index / 8);
    if (!output[chunkIdx]) {
      output[chunkIdx] = [];
    }
    output[chunkIdx].push(el);

    return output;
  }, []);
}

export function getFloat(bits: Bit[]): number {
  const length = bits.length > 32 ? 64 : 32;
  const bytes = chunkArray(bits).map(getUint);
  return new DataView(new Uint8Array(bytes).buffer)[`getFloat${length}`](
    0,
    false,
  );
}

function parseFloatNumber(num: number, length: 32 | 64 = 64): Bit[] {
  const buffer = new ArrayBuffer(length / 8);
  new DataView(buffer)[`setFloat${length}`](0, num, false);
  return [...new Uint8Array(buffer)].flatMap((val) => parseUint8(val));
}

export function parseFloat32(num: number): Bit[] {
  return parseFloatNumber(num, 32);
}

export function parseFloat64(num: number): Bit[] {
  return parseFloatNumber(num, 64);
}

function parseUint(num: number, length: 8 | 16 | 32): Bit[] {
  if (num >= 2 ** length) {
    throw new RangeError(`Input ${num} out of range (2^${length})`);
  }
  if (num < 0) {
    throw new RangeError(`Negative input`);
  }

  num &= 2 ** length - 1;

  return Array.from({ length }, (_, i) => toBit((num >> (length - 1 - i)) & 1));
}

function toBit(num: number): Bit {
  return num === 0 ? 0 : 1;
}

function parseSignedInt(num: number, length: 8 | 16 | 32): Bit[] {
  const maxSize = 2 ** (length - 1);
  if (num < -maxSize || num > maxSize - 1) {
    throw new RangeError("Value out of range");
  }

  return parseUint(num < 0 ? 2 ** length + num : num, length);
}
