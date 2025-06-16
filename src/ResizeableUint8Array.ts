export default class ResizableUint8Array {
  #inner: Uint8Array;
  #position: number = 0;
  #size: number = 0;

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
    while (this.#inner.length < this.#position + toAdd.length) {
      this.expand();
    }

    this.#inner.set(toAdd, this.#position);
    this.#position += toAdd.length;
    this.#size = Math.max(this.#size, this.#position);
  }

  push(toAdd: number): void {
    if (this.#inner.length === this.#position) {
      this.expand();
    }

    this.#inner[this.#position++] = toAdd;
    this.#size++;
  }

  get(): Uint8Array {
    return this.#inner.slice(0, this.#size);
  }

  toArray(): number[] {
    return [...this.get()];
  }

  shift(): number | undefined {
    return this.#inner[this.#position++];
  }

  get length(): number {
    return this.#size;
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.#size; i++) {
      yield this.#inner[i];
    }
  }
}
