import type { Bit } from "./Bit.ts";
import { getFloat, getInt, getUint } from "./bitMethods.ts";
import { binDump, hexDump } from "./dump.ts";
import ResizableUint8Array from "./ResizableUint8Array.ts";

/**
 * Unpacks an array of u8 numbers.
 *
 * @example
 * ```ts
 * const u = new Unpacker([255, 127, 8, 1]);
 * const bits = u.readBits(8); // [1, 1, 1, 1, 1, 1, 1, 1]
 * const integer = u.readUint8(); // 127
 * const peek = u.peek(4); // [0, 0, 0, 0]
 * const bigger = u.readUint16(); // 2049
 */
export default class Unpacker {
  private readonly bits: Bit[] = [];
  private readonly bytes: ResizableUint8Array;

  /**
   * @param bytes An array of u8 numbers or a Uint8Array to unpack
   * @example
   * ```ts
   * const unpacker = new Unpacker([255, 128, 0]);
   * ```
   */
  constructor(bytes: number[] | Uint8Array) {
    this.bytes = new ResizableUint8Array(bytes);
  }

  private unpackByte(): void {
    const byte = this.bytes.shift();

    if (byte === undefined) {
      return;
    }

    for (let i = 7; i >= 0; i--) {
      this.bits.push(((byte >> i) & 1) ? 1 : 0);
    }
  }

  /**
   * Read and consume a single bit from the front of the stack
   * @returns Bit, the 1 or 0 at the top of the stack
   * @throws RangeError if called when no data remains
   * @example
   * ```ts
   * const unpacker = new Unpacker([0b10101010]);
   * const bit = unpacker.readBit(); // 1
   * ```
   */
  readBit(): Bit {
    if (this.bits.length === 0) {
      this.unpackByte();
    }

    const bit = this.bits.shift();

    if (bit === undefined) {
      throw new RangeError("Unexpected end of stream");
    }

    return bit;
  }

  /**
   * Read and consume a finite number of bits from the front of the stack
   * @param n The number of bits to read
   * @returns An array of Bits (0s and 1s)
   * @throws Error if called when `n` is greater than the bits remaining on the stack
   * @example
   * ```ts
   * const unpacker = new Unpacker([0b11001100]);
   * const bits = unpacker.readBits(4); // [1, 1, 0, 0]
   * ```
   */
  readBits(n: number): Bit[] {
    return Array.from({ length: n }, () => this.readBit());
  }

  /**
   * Read and consume 8 bits from the front of the stack and parse them as an 8-bit integer
   * @returns The first 8 bits as an integer
   * @throws Error if called with fewer than 8 bits remaining on the stack
   * @example
   * ```ts
   * const unpacker = new Unpacker([0x42]);
   * const value = unpacker.readUint8(); // 66
   * ```
   */
  readUint8(): number {
    return getUint(this.readBits(8));
  }

  /**
   * Read and consume 16 bits from the front of the stack and parse them as a 16-bit integer
   * @returns The first 16 bits as an integer
   * @throws Error if called with fewer than 16 bits remaining on the stack
   * @example
   * ```ts
   * const unpacker = new Unpacker([0x01, 0x00]);
   * const value = unpacker.readUint16(); // 256
   * ```
   */
  readUint16(): number {
    return getUint(this.readBits(16));
  }

  /**
   * Read and consume 32 bits from the front of the stack and parse them as a 32-bit integer
   * @returns The first 32 bits as an integer
   * @throws Error if called with fewer than 32 bits remaining on the stack
   * @example
   * ```ts
   * const unpacker = new Unpacker([0x00, 0x00, 0x01, 0x00]);
   * const value = unpacker.readUint32(); // 65536
   * ```
   */
  readUint32(): number {
    return getUint(this.readBits(32));
  }

  /**
   * Read and consume 8 bits from the front of the stack and parse them as an 8-bit signed integer
   * @returns The first 8 bits as a signed integer
   * @throws Error if called with fewer than 8 bits remaining on the stack
   * @example
   * ```ts
   * const unpacker = new Unpacker([0xFF]);
   * const value = unpacker.readInt8(); // -1
   * ```
   */
  readInt8(): number {
    return getInt(this.readBits(8));
  }

  /**
   * Read and consume 16 bits from the front of the stack and parse them as a 16-bit signed integer
   * @returns The first 16 bits as a signed integer
   * @throws Error if called with fewer than 16 bits remaining on the stack
   * @example
   * ```ts
   * const unpacker = new Unpacker([0xFF, 0xFE]);
   * const value = unpacker.readInt16(); // -2
   * ```
   */
  readInt16(): number {
    return getInt(this.readBits(16));
  }

  /**
   * Read and consume 32 bits from the front of the stack and parse them as a 32-bit signed integer
   * @returns The first 32 bits as a signed integer
   * @throws Error if called with fewer than 32 bits remaining on the stack
   * @example
   * ```ts
   * const unpacker = new Unpacker([0xFF, 0xFF, 0xFF, 0xFF]);
   * const value = unpacker.readInt32(); // -1
   * ```
   */
  readInt32(): number {
    return getInt(this.readBits(32));
  }

  /**
   * Read and consume 32 bits from the front of the stack and parse them as a 32-bit float. Most Javascript numbers should be interpreted as 64-bit floats instead
   * @returns The first 32 bits as a float
   * @throws Error if called with fewer than 32 bits remaining on the stack
   * @example
   * ```ts
   * const float32 = new Float32Array([3.14]);
   * const unpacker = new Unpacker(new Uint8Array(float32.buffer));
   * const value = unpacker.readFloat32(); // ~3.14
   * ```
   */
  readFloat32(): number {
    return getFloat(this.readBits(32));
  }

  /**
   * Read and consume 64 bits from the front of the stack and parse them as a 64-bit float
   * @returns The first 64 bits as a float
   * @throws Error if called with fewer than 64 bits remaining on the stack
   * @example
   * ```ts
   * const float64 = new Float64Array([Math.PI]);
   * const unpacker = new Unpacker(new Uint8Array(float64.buffer));
   * const value = unpacker.readFloat64(); // ~3.141592653589793
   * ```
   */
  readFloat64(): number {
    return getFloat(this.readBits(64));
  }

  /**
   * Read and consume a specified number of bytes from the front of the stack, returning them as an array of 8-bit integers
   * @param n The number of bytes to return
   * @returns An array of bytes
   * @throws Error if called with insufficient data remaining on the stack
   * @example
   * ```ts
   * const unpacker = new Unpacker([1, 2, 3, 4]);
   * const bytes = unpacker.readBytes(2); // [1, 2]
   * const bytes2 = unpacker.readBytes(2); // [3, 4];
   * ```
   */
  readBytes(n: number): number[] {
    return Array.from({ length: n }, () => this.readUint8());
  }

  /**
   * Get the first `n` bits from the front of the stack without consuming them
   * @param n The number of bits to retrieve
   * @returns An array of Bits (0s and 1s)
   * @throws Error if fewer than `n` bytes remain on the stack
   * @example
   * ```ts
   * const unpacker = new Unpacker([0b10100000]);
   * const bits = unpacker.peek(4); // [1, 0, 1, 0]
   * const bits2 = unpacker.readBits(4); // [1, 0, 1, 0]
   * ```
   */
  peek(n: number): Bit[] {
    while (this.bits.length < n) {
      if (this.bytes.length === 0) {
        throw new Error(`Not enough bits to peek ${n}`);
      }

      this.unpackByte();
    }

    return this.bits.slice(0, n);
  }

  /**
   * Get the number of bits remaining in the Unpacker
   * @returns The number of bits left to consume
   * @example
   * ```ts
   * const unpacker = new Unpacker([0xFF, 0xFF]);
   * const remaining = unpacker.remaining(); // 16
   * ```
   */
  remaining(): number {
    return this.bits.length + this.bytes.length * 8;
  }

  /**
   * Print a hex dump of the contents of the Unpacker to stdout
   * @example
   * ```ts
   * const unpacker = new Unpacker([255, 128]);
   * unpacker.hexDump(); // Prints hex dump
   * ```
   */
  hexDump(): void {
    hexDump(this.bytes.get());
  }

  /**
   * Print a binary dump of the contents of the Unpacker to stdout
   * @example
   * ```ts
   * const unpacker = new Unpacker([255, 128]);
   * unpacker.binDump(); // Prints binary dump
   * ```
   */
  binDump(): void {
    binDump(this.bytes.get());
  }
}
