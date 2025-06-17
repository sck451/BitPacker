/**
 * A branded type representing a valid byte: an integer between 0 and 255.
 */
type Byte = number & { __brand: "byte" };

/**
 * Checks if a number is a valid byte (0–255).
 *
 * @param num - The number to check.
 * @returns `true` if the number is a valid byte.
 *
 * @example
 * ```typescript
 * isByte(128); // true
 * isByte(300); // false
 * ```
 */
function isByte(num: number): num is Byte {
  return Number.isInteger(num) && num >= 0 && num <= 255;
}

/**
 * Checks whether all numbers in an array are valid bytes.
 *
 * @param arr - The array of numbers to check.
 * @returns `true` if every number is a valid byte.
 *
 * @example
 * ```typescript
 * isArrayOfBytes([0, 128, 255]); // true
 * isArrayOfBytes([42, -1]); // false
 * ```
 */
function isArrayOfBytes(arr: number[]): arr is Byte[] {
  return arr.every(isByte);
}

/**
 * A dynamically resizable buffer for bytes, backed by a `Uint8Array`.
 *
 * Supports efficient appending, shifting, and automatic resizing.
 * Reading via `shift()` or iteration consumes the data. Use `get()` to inspect
 * data without consuming it.
 *
 * @example
 * ```typescript
 * const buf = new ResizableUint8Array([1, 2, 3]);
 * buf.push(4);
 * console.log(buf.toArray()); // [1, 2, 3, 4]
 * console.log(buf.shift());   // 1
 * console.log(buf.get());     // Uint8Array [2, 3, 4]
 * ```
 */
export default class ResizableUint8Array {
  #inner: Uint8Array;
  #readPosition = 0;
  #writePosition = 0;

  /**
   * Creates a new buffer with a given initial capacity.
   *
   * @param length - The initial capacity of the buffer.
   */
  constructor(length: number);

  /**
   * Creates a new buffer initialized with the contents of a number array.
   *
   * @param initial - An array of numbers between 0 and 255 or a `Uint8Array`
   */
  constructor(initial: number[] | Uint8Array);
  constructor(arg: number | number[] | Uint8Array) {
    if (typeof arg === "number") {
      this.#inner = new Uint8Array(Math.max(arg, 8));
    } else if (arg instanceof Uint8Array || isArrayOfBytes(arg)) {
      this.#inner = new Uint8Array(arg);
      this.#writePosition = arg.length;
    } else {
      throw new TypeError("Invalid constructor argument");
    }
  }

  /**
   * Expands the internal buffer to accommodate more data.
   * Called automatically as needed by `push` or `set`.
   */
  expand(): void {
    const newInner = new Uint8Array(
      Math.max((this.#inner.length * 1.5) >> 0, 8),
    );
    newInner.set(this.#inner);
    this.#inner = newInner;
  }

  /**
   * Appends multiple bytes to the buffer.
   *
   * @param toAdd - An array of valid bytes.
   * @throws {RangeError} If any number is not a valid byte.
   *
   * @example
   * ```typescript
   * const buf = new ResizableUint8Array(2);
   * buf.set([10, 20, 30]);
   * console.log(buf.toArray()); // [10, 20, 30]
   * ```
   */
  set(toAdd: number[]): void {
    if (!isArrayOfBytes(toAdd)) throw new RangeError("Invalid byte array");

    while (this.#inner.length < this.#writePosition + toAdd.length) {
      this.expand();
    }

    this.#inner.set(toAdd, this.#writePosition);
    this.#writePosition += toAdd.length;
  }

  /**
   * Appends a single byte to the buffer.
   *
   * @param toAdd - A valid byte.
   * @throws {RangeError} If the number is not a valid byte.
   *
   * @example
   * ```typescript
   * const buf = new ResizableUint8Array(1);
   * buf.push(42);
   * ```
   */
  push(toAdd: number): void {
    if (!isByte(toAdd)) throw new RangeError("Invalid byte");

    if (this.isFull()) this.expand();
    this.#inner[this.#writePosition++] = toAdd;
  }

  /**
   * Returns the current readable portion of the buffer.
   *
   * @returns A `Uint8Array` view of unread bytes.
   *
   * @example
   * ```typescript
   * const buf = new ResizableUint8Array([1, 2, 3]);
   * console.log(buf.get()); // Uint8Array [1, 2, 3]
   * ```
   */
  get(): Uint8Array {
    return this.#inner.slice(this.#readPosition, this.#writePosition);
  }

  /**
   * Returns the buffer contents as a number array.
   *
   * @returns An array of valid bytes.
   */
  toArray(): number[] {
    return [...this.get()];
  }

  /**
   * Removes and returns the next byte from the buffer.
   *
   * @returns The next byte or `undefined` if the buffer is empty.
   *
   * @example
   * ```typescript
   * const buf = new ResizableUint8Array([1, 2]);
   * console.log(buf.shift()); // 1
   * console.log(buf.shift()); // 2
   * console.log(buf.shift()); // undefined
   * ```
   */
  shift(): number | undefined {
    if (this.#readPosition >= this.#writePosition) return undefined;

    if (this.#readPosition > 512) this.compact();
    return this.#inner[this.#readPosition++];
  }

  /**
   * Gets the number of unread bytes in the buffer.
   */
  get length(): number {
    return this.#writePosition - this.#readPosition;
  }

  /**
   * Returns an iterator over unread bytes, consuming them as it iterates.
   *
   * @returns An iterator over valid bytes.
   *
   * @example
   * ```typescript
   * const buf = new ResizableUint8Array([10, 20]);
   * for (const b of buf) console.log(b);
   * ```
   */
  *[Symbol.iterator](): IterableIterator<number> {
    while (this.#readPosition < this.#writePosition) {
      yield this.#inner[this.#readPosition++];
    }
  }

  /**
   * Compacts the buffer by moving unread bytes to the beginning.
   */
  compact(): void {
    const newBuffer = new Uint8Array(Math.max((this.length * 1.5) >> 0, 8));
    newBuffer.set(this.get());
    this.#inner = newBuffer;
    this.#writePosition -= this.#readPosition;
    this.#readPosition = 0;
  }

  /**
   * Checks whether the buffer is empty.
   *
   * @returns `true` if no unread bytes remain.
   */
  isEmpty(): boolean {
    return this.#writePosition === this.#readPosition;
  }

  /**
   * Checks whether the buffer is full and must be resized before writing.
   *
   * @returns `true` if the internal buffer is full.
   */
  isFull(): boolean {
    return this.#writePosition === this.#inner.length;
  }

  /**
   * Clears the buffer, resetting read/write pointers and zeroing memory.
   */
  clear(): void {
    this.#inner = new Uint8Array(this.#inner.length);
    this.#readPosition = this.#writePosition = 0;
  }
}
