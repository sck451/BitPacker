export default class ResizableUint8Array {
  #inner: Uint8Array;
  #readPosition = 0;
  #writePosition = 0;
  #size = 0;

  constructor(length: number);
  constructor(initial: number[] | Uint8Array);
  constructor(
    ...args: [number] | [number[] | Uint8Array]
  ) {
    const arg = args[0];

    if (arg instanceof Uint8Array) {
      this.#inner = new Uint8Array(arg);
      this.#size = arg.length;
    } else if (Array.isArray(arg)) {
      this.#inner = new Uint8Array(arg);
      this.#size = arg.length;
    } else {
      this.#inner = new Uint8Array(arg);
    }
  }

  expand(): void {
    const newInner = new Uint8Array(this.#inner.length * 2);
    newInner.set(this.#inner);
    this.#inner = newInner;
  }

  set(toAdd: number[]): void {
    while (this.#inner.length < this.#writePosition + toAdd.length) {
      this.expand();
    }

    this.#inner.set(toAdd, this.#writePosition);
    this.#writePosition += toAdd.length;
    this.#size = this.#writePosition;
  }

  push(toAdd: number): void {
    if (this.#inner.length === this.#writePosition) {
      this.expand();
    }

    this.#inner[this.#writePosition++] = toAdd;
    this.#size++;
  }

  get(): Uint8Array {
    return this.#inner.slice(0, this.#size);
  }

  toArray(): number[] {
    return [...this.get()];
  }

  shift(): number | undefined {
    return this.#inner[this.#readPosition++];
  }

  get length(): number {
    return this.#size;
  }

  *[Symbol.iterator](): IterableIterator<number, void, unknown> {
    yield* this.#inner.slice(0, this.#size);
  }
}
