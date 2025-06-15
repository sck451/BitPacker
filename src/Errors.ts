export class BitPackerError extends Error {}

export class InvalidBitError extends BitPackerError {
  value: unknown;
  constructor(value: unknown) {
    super(`Bit value must be 0 or 1 but received ${value}`);
    this.value = value;
  }
}
