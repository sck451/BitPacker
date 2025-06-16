import { Packer, Unpacker } from "../main.ts";

const generatePackedData = (): Uint8Array => {
  const packer = new Packer();
  for (let i = 0; i < 125_000; i++) {
    packer.putUint8(i % 256);
  }
  return packer.getBuffer();
};

const packedData = generatePackedData();

Deno.bench("Unpacker: read 1 million bits", () => {
  const unpacker = new Unpacker(packedData);
  for (let i = 0; i < 1_000_000; i++) {
    unpacker.readBit();
  }
});

Deno.bench("Unpacker: read 125k uint8", () => {
  const unpacker = new Unpacker(packedData);
  for (let i = 0; i < 125_000; i++) {
    unpacker.readUint8();
  }
});

Deno.bench("Unpacker: read 62.5k uint16", () => {
  const unpacker = new Unpacker(packedData);
  for (let i = 0; i < 62_500; i++) {
    unpacker.readUint16();
  }
});

Deno.bench("Unpacker: read 31.25k uint32", () => {
  const unpacker = new Unpacker(packedData);
  for (let i = 0; i < 31_250; i++) {
    unpacker.readUint32();
  }
});

Deno.bench("Unpacker: read 1k float64", () => {
  const packer = new Packer();
  for (let i = 0; i < 1_000; i++) {
    packer.putFloat64(i * Math.random());
  }
  const unpacker = new Unpacker(packer.getBuffer());
  for (let i = 0; i < 1_000; i++) {
    unpacker.readFloat64();
  }
});

Deno.bench("Unpacker: peek 100 bits", () => {
  const unpacker = new Unpacker(packedData);
  unpacker.peek(100);
});
