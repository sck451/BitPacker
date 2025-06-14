import { Bit } from "./Bit.ts";
import { getFloat, getInt, getUint } from "./bitMethods.ts";

export default class Unpacker {
  private readonly bits: Bit[] = [];
  private readonly bytes: number[];

  constructor(bytes: number[] | Uint8Array) {
    this.bytes = [...bytes];
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

  readBit(): Bit {
    if (this.bits.length === 0) {
      this.unpackByte();
    }

    const bit = this.bits.shift();

    if (bit === undefined) {
      throw new Error("Unexpected end of stream");
    }

    return bit;
  }

  readBits(n: number): Bit[] {
    return Array.from({ length: n }, () => this.readBit());
  }

  readUint8(): number {
    return getUint(this.readBits(8));
  }

  readUint16(): number {
    return getUint(this.readBits(16));
  }

  readUint32(): number {
    return getUint(this.readBits(32));
  }

  readInt8(): number {
    return getInt(this.readBits(8));
  }

  readInt16(): number {
    return getInt(this.readBits(16));
  }

  readInt32(): number {
    return getInt(this.readBits(32));
  }

  readFloat32(): number {
    return getFloat(this.readBits(32));
  }

  readFloat64(): number {
    return getFloat(this.readBits(64));
  }

  readBytes(n: number): number[] {
    return Array.from({ length: n }, () => this.readUint8());
  }

  peek(n: number): Bit[] {
    while (this.bits.length < n) {
      if (this.bytes.length === 0) {
        throw new Error(`Not enough bits to peek ${n}`);
      }

      this.unpackByte();
    }

    return this.bits.slice(0, n);
  }
}
