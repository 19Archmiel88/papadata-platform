import assert from "node:assert/strict";
import test from "node:test";
import { calculateSha256 } from "./checksum.ts";

test("calculateSha256 returns a deterministic digest", () => {
  assert.equal(
    calculateSha256(Buffer.from("papadata")),
    "90b7f969ccdfd45c46cfdb4fbf632901a49925af74bb3092c0a7edab9024ef9f",
  );
});
