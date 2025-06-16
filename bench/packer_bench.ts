import { Packer } from "../main.ts";

Deno.bench("Packer: put 1 million bits", () => {
  const packer = new Packer();
  for (let i = 0; i < 1_000_000; i++) {
    packer.putBit(i % 2 as 0 | 1);
  }
});

Deno.bench("Packer: put 125k bytes using putUint8", () => {
  const packer = new Packer();
  for (let i = 0; i < 125_000; i++) {
    packer.putUint8(i % 256);
  }
});

Deno.bench("Packer: put 62.5k Uint16", () => {
  const packer = new Packer();
  for (let i = 0; i < 62_500; i++) {
    packer.putUint16(i % 65536);
  }
});

Deno.bench("Packer: put 31.25k Uint32", () => {
  const packer = new Packer();
  for (let i = 0; i < 31_250; i++) {
    packer.putUint32(i);
  }
});

Deno.bench("Packer: put 1000 Float64", () => {
  const packer = new Packer();
  for (let i = 0; i < 1_000; i++) {
    packer.putFloat64(Math.PI * i);
  }
});

Deno.bench("Packer: bulk putBytes (Uint8Array)", () => {
  const packer = new Packer();
  const arr = new Uint8Array(100_000).map((_, i) => i % 256);
  packer.putBytes(arr);
});

Deno.bench("Packer: getBytes after 1M bits", () => {
  const packer = new Packer();
  for (let i = 0; i < 1_000_000; i++) packer.putBit(1);
  packer.getBytes();
});

Deno.bench("Packer: getBuffer after 125k bytes", () => {
  const packer = new Packer();
  for (let i = 0; i < 125_000; i++) packer.putUint8(i % 256);
  packer.getBuffer();
});
