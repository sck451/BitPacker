import { Packer, Unpacker } from "../main.ts";
import { expect } from "@std/expect";

Deno.test("put and read bits", () => {
  const packer = new Packer();
  packer.putBit(1);
  packer.putBit(0);
  packer.putBit(1);

  const buffer = packer.getBuffer();

  const unpacker = new Unpacker(buffer);
  expect(unpacker.readBit()).toBe(1);
  expect(unpacker.readBit()).toBe(0);
  expect(unpacker.readBit()).toBe(1);
});

Deno.test("put and read uint8", () => {
  const packer = new Packer();
  packer.putUint8(255);
  const buffer = packer.getBuffer();

  const unpacker = new Unpacker(buffer);
  expect(unpacker.readUint8()).toBe(255);
});

Deno.test("put and read uint16", () => {
  const packer = new Packer();
  packer.putUint16(65535);
  const buffer = packer.getBuffer();

  const unpacker = new Unpacker(buffer);
  expect(unpacker.readUint16()).toBe(65535);
});

Deno.test("put and read uint32", () => {
  const packer = new Packer();
  packer.putUint32(4294967295);
  const buffer = packer.getBuffer();

  const unpacker = new Unpacker(buffer);
  expect(unpacker.readUint32()).toBe(4294967295);
});

Deno.test("put and read int8", () => {
  const packer = new Packer();
  packer.putInt8(-128);
  packer.putInt8(127);
  const buffer = packer.getBuffer();

  const unpacker = new Unpacker(buffer);
  expect(unpacker.readInt8()).toBe(-128);
  expect(unpacker.readInt8()).toBe(127);
});

Deno.test("put and read int16", () => {
  const packer = new Packer();
  packer.putInt16(-32768);
  packer.putInt16(32767);
  const buffer = packer.getBuffer();

  const unpacker = new Unpacker(buffer);
  expect(unpacker.readInt16()).toBe(-32768);
  expect(unpacker.readInt16()).toBe(32767);
});

Deno.test("put and read int32", () => {
  const packer = new Packer();
  packer.putInt32(-2147483648);
  packer.putInt32(2147483647);
  const buffer = packer.getBuffer();

  const unpacker = new Unpacker(buffer);
  expect(unpacker.readInt32()).toBe(-2147483648);
  expect(unpacker.readInt32()).toBe(2147483647);
});

Deno.test("put and read float32", () => {
  const packer = new Packer();
  const num = 3.1415927;
  packer.putFloat32(num);
  const buffer = packer.getBuffer();

  const unpacker = new Unpacker(buffer);
  // Floating point equality might fail, so do a range check instead
  const result = unpacker.readFloat32();
  expect(Math.abs(result - num) < 1e-6).toBe(true);
});

Deno.test("put and read float64", () => {
  const packer = new Packer();
  const num = Math.PI;
  packer.putFloat64(num);
  const buffer = packer.getBuffer();

  const unpacker = new Unpacker(buffer);
  const result = unpacker.readFloat64();
  expect(Math.abs(result - num) < 1e-12).toBe(true);
});

Deno.test("put and read bytes", () => {
  const packer = new Packer();
  const bytes = [1, 2, 3, 4, 255];
  packer.putBytes(bytes);
  const buffer = packer.getBuffer();

  const unpacker = new Unpacker(buffer);
  const result = unpacker.readBytes(bytes.length);
  expect(result).toEqual(bytes);
});

Deno.test("peek does not consume bits", () => {
  const packer = new Packer();
  packer.putUint8(0b10100000);
  const buffer = packer.getBuffer();

  const unpacker = new Unpacker(buffer);
  const peeked = unpacker.peek(4);

  expect(peeked).toEqual([1, 0, 1, 0]);
  expect(unpacker.readBits(4)).toEqual([1, 0, 1, 0]);
});
