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

/**
 * Packs data into an array of numbers
 */
export default class Packer {
  private readonly bytes: number[] = [];
  private readonly bits: Bit[] = [];

  /**
   * Add a single bit to the packer
   * @param bit A Bit (0 or 1) to pack
   */
  putBit(bit: Bit): void {
    this.bits.push(bit);

    if (this.bits.length === 8) {
      this.bytes.push(getUint(this.bits));
      this.bits.length = 0;
    }
  }

  /**
   * Add multiple bits to the packer
   * @param bits The Bits (0s and 1s) to pack
   */
  putBits(bits: Bit[]): void {
    bits.forEach((bit) => this.putBit(bit));
  }

  /**
   * Add multiple bytes (8-bit unsigned integers) to the packer
   * @param bytes Array of 8-bit numbers or a Uint8Array to add to the packer
   */
  putBytes(bytes: number[] | Uint8Array): void {
    bytes.forEach((byte) => this.putUint8(byte));
  }

  /**
   * Add an 8-bit unsigned integer to the packer
   * @param num 8-bit unsigned interger to add to the packer
   * @throws Error if `num` is out of bounds for `uint8`
   */
  putUint8(num: number): void {
    this.putBits(parseUint8(num));
  }

  /**
   * Add a 16-bit unsigned integer to the packer
   * @param num 16-bit unsigned integer to add to the packer
   * @throws Error if `num` is out of bounds for `uint16`
   */
  putUint16(num: number): void {
    this.putBits(parseUint16(num));
  }

  /**
   * Add a 32-bit unsigned integer to the packer
   * @param num 32-bit unsigned integer to add to the packer
   * @throws Error if `num` is out of bounds for `uint32`
   */
  putUint32(num: number): void {
    this.putBits(parseUint32(num));
  }

  /**
   * Add an 8-bit signed integer to the packer
   * @param num 8-bit signed integer to add to the packer
   * @throws Error if `num` is out of bounds for `int8`
   */
  putInt8(num: number): void {
    this.putBits(parseInt8(num));
  }

  /**
   * Add a 16-bit signed integer to the packer
   * @param num 16-bit signed integer to add to the packer
   * @throws Error if `num` is out of bounds for `int16`
   */
  putInt16(num: number): void {
    this.putBits(parseInt16(num));
  }

  /**
   * Add a 32-bit signed integer to the packer
   * @param num 32-bit signed integer to add to the packer
   * @throws Error if `num` is out of bounds for `int32`
   */
  putInt32(num: number): void {
    this.putBits(parseInt32(num));
  }

  /**
   * Add a 32-bit float to the packer. Note that most Javascript number should be encoded as 64-bit floats.
   * @param num 32-bit float to add to the packer
   * @throws Error if `num` is out of bounds for `float32`
   */
  putFloat32(num: number): void {
    this.putBits(parseFloat32(num));
  }

  /**
   * Add a 64-bit float to the packer.
   * @param num 64-bit float to add to the packer
   */
  putFloat64(num: number): void {
    this.putBits(parseFloat64(num));
  }

  /**
   * Get the data out of the packer. If the final byte is incomplete it is padded with 0s.
   * @returns The data from the packer encoded as an array of 8-bit unsigned integers
   */
  getBytes(): number[] {
    const bits: Bit[] = [...this.bits];

    if (bits.length % 8 !== 0) {
      while (bits.length !== 8) {
        bits.push(0);
      }
    }

    return [...this.bytes, getUint(bits)];
  }

  /**
   * Get the data out of the packer as a Uint8Array. If the final byte is incomplete it is padded with 0s.
   * @returns The data from the packer encoded as a Uint8Array
   */
  getBuffer(): Uint8Array {
    return Uint8Array.from(this.getBytes());
  }
}
