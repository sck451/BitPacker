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

export default class Packer {
  private readonly bytes: number[] = [];
  private readonly bits: Bit[] = [];

  putBit(bit: Bit): void {
    this.bits.push(bit);

    if (this.bits.length === 8) {
      this.bytes.push(getUint(this.bits));
      this.bits.length = 0;
    }
  }

  putBits(bits: Bit[]): void {
    bits.forEach((bit) => this.putBit(bit));
  }

  putBytes(bytes: number[] | Uint8Array): void {
    bytes.forEach((byte) => this.putUint8(byte));
  }

  putUint8(num: number): void {
    this.putBits(parseUint8(num));
  }

  putUint16(num: number): void {
    this.putBits(parseUint16(num));
  }

  putUint32(num: number): void {
    this.putBits(parseUint32(num));
  }

  putInt8(num: number): void {
    this.putBits(parseInt8(num));
  }

  putInt16(num: number): void {
    this.putBits(parseInt16(num));
  }

  putInt32(num: number): void {
    this.putBits(parseInt32(num));
  }

  putFloat32(num: number): void {
    this.putBits(parseFloat32(num));
  }

  putFloat64(num: number): void {
    this.putBits(parseFloat64(num));
  }

  getBytes(): number[] {
    const bits: Bit[] = [...this.bits];

    if (bits.length % 8 !== 0) {
      while (bits.length !== 8) {
        bits.push(0);
      }
    }

    return [...this.bytes, getUint(bits)];
  }

  getBuffer(): Uint8Array {
    return Uint8Array.from(this.getBytes());
  }
}
