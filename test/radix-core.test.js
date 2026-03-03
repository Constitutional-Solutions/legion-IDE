const test = require("node:test");
const assert = require("node:assert/strict");

const {
  BASE_144K,
  encodeFsouDigit,
  decodeFsouDigit,
  semanticSumToFsouAddress,
  fsouAddressToSemanticSum,
  isValidFsouAddress
} = require("../src/radix-core");

test("encodeFsouDigit handles boundaries", () => {
  assert.equal(encodeFsouDigit(0n), "0000");
  assert.equal(encodeFsouDigit(BASE_144K - 1n), "NON9");
  assert.throws(() => encodeFsouDigit(-1n), RangeError);
  assert.throws(() => encodeFsouDigit(BASE_144K), RangeError);
});

test("encode/decode of single FSOU digit round trips", () => {
  const samples = [0n, 1n, 42n, 12345n, BASE_144K - 1n];
  for (const value of samples) {
    const encoded = encodeFsouDigit(value);
    const decoded = decodeFsouDigit(encoded);
    assert.equal(decoded, value);
  }
});

test("semantic sums convert to FSOU addresses and back", () => {
  const samples = [
    0n,
    1n,
    12345n,
    BASE_144K,
    BASE_144K + 1n,
    BASE_144K * BASE_144K + 999n
  ];
  for (const value of samples) {
    const address = semanticSumToFsouAddress(value);
    const restored = fsouAddressToSemanticSum(address);
    assert.equal(restored, value);
    assert.ok(isValidFsouAddress(address));
  }
});

test("explicit multi-group address layout", () => {
  const value = BASE_144K + 123n;
  const address = semanticSumToFsouAddress(value);
  assert.equal(address.split(":").length, 2);
  assert.equal(fsouAddressToSemanticSum(address), value);
});

test("invalid FSOU addresses are rejected", () => {
  assert.equal(isValidFsouAddress("0000"), true);
  assert.equal(isValidFsouAddress("000Z"), false);
  assert.equal(isValidFsouAddress(""), false);
  assert.throws(() => fsouAddressToSemanticSum("0"), TypeError);
  assert.throws(() => decodeFsouDigit("ZZZZ"), RangeError);
});
