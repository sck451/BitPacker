import { yellow } from "@std/fmt/colors";

export function hexDump(input: Uint8Array): void {
  const lineSize = 10;
  const idxSize = Math.max(String(input.length).length, 2);

  const outputLine = (offset: number, bytes: Uint8Array) => {
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(" ");

    console.log(yellow(offset.toString().padStart(idxSize, "0")), hex);
  };

  for (let i = 0; i < input.length; i += lineSize) {
    const line = input.slice(i, i + lineSize);
    outputLine(i, line);
  }
}

export function binDump(input: Uint8Array): void {
  const idxSize = Math.max(String(input.length).length, 2);

  input.forEach((val, idx) => {
    console.log(
      yellow(idx.toString().padStart(idxSize, "0")),
      val.toString(2).padStart(8, "0"),
    );
  });
}
