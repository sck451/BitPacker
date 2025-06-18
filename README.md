# BitPacker

A TypeScript library for bit-level packing and unpacking of binary data.
Supports reading and writing integers (signed/unsigned), floating-point numbers,
raw bytes, and individual bits.

## Features

- Fine-grained bit-level writing and reading
- Support for:
  - Unsigned integers (`Uint8`, `Uint16`, `Uint32`)
  - Signed integers (`Int8`, `Int16`, `Int32`)
  - Floating-point numbers (`Float32`, `Float64`)
  - Arbitrary byte arrays
- Optional peek functionality (non-destructive read)

## Consuming API

Note that the API is deliberately written that the `Unpacker` code is
mutable/consuming. This is done for memory use reasons.

## Installation

```sh
deno add jsr:@sck/bitpacker
npx jsr add @sck/bitpacker
bunx jsr add @sck/bitpacker
```

```ts
import { Packer, Unpacker } from "@sck/bitpacker";
```

## Use

### Packing data

```ts
const packer = new Packer();

packer.putBit(1);
packer.putBits([0, 1, 0]);
packer.putUint8(255);
packer.putInt16(-1234);
packer.putFloat32(Math.PI);
packer.putBytes([1, 2, 3]);

const buffer = packer.getBuffer(); // Uint8Array
```

### Unpacking data

```ts
const unpacker = new Unpacker(buffer);

const bit = unpacker.readBit(); // 1
const bits = unpacker.readBits(3); // [0, 1, 0]
const u8 = unpacker.readUint8(); // 255
const i16 = unpacker.readInt16(); // -1234
const pi = unpacker.readFloat32(); // ~3.14159
const bytes = unpacker.readBytes(3); // [1, 2, 3]
```

### Peeking at future data without consuming

```ts
const bits = unpacker.peek(4); // preview next 4 bits without advancing
```

## API

### Class: `Packer`

| Method            | Description                    |
| ----------------- | ------------------------------ |
| `putBit(bit)`     | Add a single bit (0 or 1)      |
| `putBits(bits[])` | Add an array of bits           |
| `putBytes(bytes)` | Add an array of bytes          |
| `putUint8(num)`   | Add an unsigned 8-bit integer  |
| `putUint16(num)`  | Add an unsigned 16-bit integer |
| `putUint32(num)`  | Add an unsigned 32-bit integer |
| `putInt8(num)`    | Add a signed 8-bit integer     |
| `putInt16(num)`   | Add a signed 16-bit integer    |
| `putInt32(num)`   | Add a signed 32-bit integer    |
| `putFloat32(num)` | Add a 32-bit float             |
| `putFloat64(num)` | Add a 64-bit float             |
| `getBytes()`      | Get internal byte array        |
| `getBuffer()`     | Get final `Uint8Array` buffer  |

---

### Class: `Unpacker`

| Method          | Description                              |
| --------------- | ---------------------------------------- |
| `readBit()`     | Read a single bit                        |
| `readBits(n)`   | Read `n` bits                            |
| `readUint8()`   | Read an unsigned 8-bit integer           |
| `readUint16()`  | Read an unsigned 16-bit integer          |
| `readUint32()`  | Read an unsigned 32-bit integer          |
| `readInt8()`    | Read a signed 8-bit integer              |
| `readInt16()`   | Read a signed 16-bit integer             |
| `readInt32()`   | Read a signed 32-bit integer             |
| `readFloat32()` | Read a 32-bit float                      |
| `readFloat64()` | Read a 64-bit float                      |
| `readBytes(n)`  | Read `n` bytes                           |
| `peek(n)`       | Peek the next `n` bits (non-destructive) |

## Licence

This project is licensed under the MIT licence.
