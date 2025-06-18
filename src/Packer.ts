import type { Bit } from "./Bit.ts";
import {
  getUint,
  parseFloat32,
  parseFloat64,
  parseInt16,
  parseInt32,
  parseInt8,
  parseUint16,
  parseUint32,
  parseUint8,
} from "./bitMethods.ts";
import { binDump, hexDump } from "./dump.ts";
import { InvalidBitError } from "./Errors.ts";
import ResizableUint8Array from "./ResizableUint8Array.ts";

const DEFAULT_PACKER_LENGTH = 512;

/**
 * Packs data into an array of numbers.
 *
 * @example
 * ```ts
 * const p = new Packer();
 * p.putBits([1, 0, 1, 1, 0, 1, 0, 0]);
 * p.putUint8(255);
 * p.putFloat32(42.952);
 * p.hexDump(); // get visualisation of the data inserted
 * const buffer = p.getBuffer(); // the contents of the Packer as a Uint8Array
 */
export default class Packer {
  private readonly bytes: ResizableUint8Array;
  private readonly bits: Bit[] = [];

  constructor(size?: number) {
    size ??= DEFAULT_PACKER_LENGTH;
    this.bytes = new ResizableUint8Array(size);
  }

  /**
   * Add a single bit to the packer
   * @param bit A Bit (0 or 1) to pack
   * @throws InvalidBitError if bit is not 0 or 1
   * @example
   * ```ts
   * const p = new Packer();
   * p.putBit(1);
   * p.putBit(0);
   * ```
   */
  putBit(bit: Bit): void {
    if (bit !== 0 && bit !== 1) {
      throw new InvalidBitError(bit);
    }

    this.bits.push(bit);

    if (this.bits.length === 8) {
      this.bytes.push(getUint(this.bits));
      this.bits.length = 0;
    }
  }

  /**
   * Add multiple bits to the packer
   * @param bits The Bits (0s and 1s) to pack
   * @throws InvalidBitError if any bit is not 0 or 1
   * @example
   * ```ts
   * const p = new Packer();
   * p.putBits([1, 0, 1, 1, 0, 0, 1, 0]);
   * ```
   */
  putBits(bits: Bit[]): void {
    bits.forEach((bit) => this.putBit(bit));
  }

  /**
   * Add multiple bytes (8-bit unsigned integers) to the packer
   * @param bytes Array of 8-bit numbers or a Uint8Array to add to the packer
   * @example
   * ```ts
   * const p = new Packer();
   * p.putBytes([255, 1, 0]);
   *
   * const arr = new Uint8Array([128, 64]);
   * p.putBytes(arr);
   * ```
   */
  putBytes(bytes: number[] | Uint8Array): void {
    bytes.forEach((byte) => this.putUint8(byte));
  }

  /**
   * Add an 8-bit unsigned integer to the packer
   * @param num 8-bit unsigned integer to add to the packer
   * @throws RangeError if `num` is out of bounds for `uint8`
   * @example
   * ```ts
   * const p = new Packer();
   * p.putUint8(42);
   * ```
   */
  putUint8(num: number): void {
    this.putBits(parseUint8(num));
  }

  /**
   * Add a 16-bit unsigned integer to the packer
   * @param num 16-bit unsigned integer to add to the packer
   * @throws RangeError if `num` is out of bounds for `uint16`
   * @example
   * ```ts
   * const p = new Packer();
   * p.putUint16(65535);
   * ```
   */
  putUint16(num: number): void {
    this.putBits(parseUint16(num));
  }

  /**
   * Add a 32-bit unsigned integer to the packer
   * @param num 32-bit unsigned integer to add to the packer
   * @throws RangeError if `num` is out of bounds for `uint32`
   * @example
   * ```ts
   * const p = new Packer();
   * p.putUint32(1234567890);
   * ```
   */
  putUint32(num: number): void {
    this.putBits(parseUint32(num));
  }

  /**
   * Add an 8-bit signed integer to the packer
   * @param num 8-bit signed integer to add to the packer
   * @throws RangeError if `num` is out of bounds for `int8`
   * @example
   * ```ts
   * const p = new Packer();
   * p.putInt8(-128);
   * p.putInt8(127);
   * ```
   */
  putInt8(num: number): void {
    this.putBits(parseInt8(num));
  }

  /**
   * Add a 16-bit signed integer to the packer
   * @param num 16-bit signed integer to add to the packer
   * @throws RangeError if `num` is out of bounds for `int16`
   * @example
   * ```ts
   * const p = new Packer();
   * p.putInt16(-32768);
   * p.putInt16(32767);
   * ```
   */
  putInt16(num: number): void {
    this.putBits(parseInt16(num));
  }

  /**
   * Add a 32-bit signed integer to the packer
   * @param num 32-bit signed integer to add to the packer
   * @throws RangeError if `num` is out of bounds for `int32`
   * @example
   * ```ts
   * const p = new Packer();
   * p.putInt32(-2147483648);
   * p.putInt32(2147483647);
   * ```
   */
  putInt32(num: number): void {
    this.putBits(parseInt32(num));
  }

  /**
   * Add a 32-bit float to the packer. Note that most Javascript number should be encoded as 64-bit floats.
   * @param num 32-bit float to add to the packer
   * @throws RangeError if `num` is out of bounds for `float32`
   * @example
   * ```ts
   * const p = new Packer();
   * p.putFloat32(3.14);
   * ```
   */
  putFloat32(num: number): void {
    this.putBits(parseFloat32(num));
  }

  /**
   * Add a 64-bit float to the packer.
   * @param num 64-bit float to add to the packer
   * @example
   * ```ts
   * const p = new Packer();
   * p.putFloat64(Math.PI);
   * ```
   */
  putFloat64(num: number): void {
    this.putBits(parseFloat64(num));
  }

  /**
   * Get the data out of the packer as an array of numbers. If the final byte is incomplete it is padded with 0s.
   * @returns The data from the packer encoded as an array of 8-bit unsigned integers
   * @example
   * ```ts
   * const p = new Packer();
   * p.putUint8(1);
   * p.putUint8(2);
   * const arr = p.getBytes(); // [1, 2]
   * ```
   */
  getBytes(): number[] {
    this.flushBits();
    return [...this.bytes];
  }

  /**
   * Get the data out of the packer as a Uint8Array. If the final byte is incomplete it is padded with 0s.
   * @returns The data from the packer encoded as a Uint8Array
   * @example
   * ```ts
   * const p = new Packer();
   * p.putInt8(-1);
   * const buf = p.getBuffer(); // Uint8Array([...])
   * ```
   */
  getBuffer(): Uint8Array {
    this.flushBits();
    return this.bytes.get();
  }

  /**
   * Get the size of the data in the Packer
   * @returns the number of bits stored in the Packer
   * @example
   * ```ts
   * const p = new Packer();
   * p.putUint8(0xff);
   * console.log(p.size()); // 8
   * ```
   */
  size(): number {
    return this.bits.length + this.bytes.length * 8;
  }

  /**
   * Print a hex dump of the contents of the Packer to stdout
   * @example
   * ```ts
   * const p = new Packer();
   * p.putUint8(255);
   * p.hexDump(); // Prints a hex dump to the console
   * ```
   */
  hexDump(): void {
    hexDump(this.bytes.get());
  }

  /**
   * Print a binary dump of the contents of the Packer to stdout
   * @example
   * ```ts
   * const p = new Packer();
   * p.putUint8(10);
   * p.binDump(); // Prints a binary dump to the console
   * ```
   */
  binDump(): void {
    binDump(this.bytes.get());
  }

  /**
   * Flush the array of bits to a byte, padding with 0s if needed.
   * @private
   */
  private flushBits(): void {
    const bits: Bit[] = [...this.bits];

    if (bits.length % 8 !== 0) {
      while (bits.length !== 8) {
        bits.push(0);
      }

      this.bytes.push(getUint(bits));
    }
  }
}
