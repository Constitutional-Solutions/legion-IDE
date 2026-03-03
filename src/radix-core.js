const BASE_144K = 144000n;
const DIGIT_RADICES = [24n, 25n, 24n, 10n];
const DIGIT_ALPHABETS = [
  "0123456789ABCDEFGHIJKLMN", // length 24
  "0123456789ABCDEFGHIJKLMNO", // length 25
  "0123456789ABCDEFGHIJKLMN", // length 24
  "0123456789" // length 10
];

const charLookups = DIGIT_ALPHABETS.map((alphabet) => {
  const map = new Map();
  for (let i = 0; i < alphabet.length; i += 1) {
    map.set(alphabet[i], i);
  }
  return map;
});

function normalizeSemanticSum(value) {
  if (typeof value === "bigint") {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isInteger(value)) {
      throw new TypeError("Semantic sums must be whole numbers");
    }
    if (!Number.isSafeInteger(value)) {
      throw new TypeError("Use bigint inputs for values larger than the safe integer range");
    }
    return BigInt(value);
  }
  throw new TypeError("Semantic sums must be a number or bigint");
}

function encodeFsouDigit(digitValue) {
  if (digitValue < 0n || digitValue >= BASE_144K) {
    throw new RangeError("FSOU digit must be between 0 and 143999");
  }
  let working = digitValue;
  const u = Number(working % DIGIT_RADICES[3]);
  working /= DIGIT_RADICES[3];
  const o = Number(working % DIGIT_RADICES[2]);
  working /= DIGIT_RADICES[2];
  const s = Number(working % DIGIT_RADICES[1]);
  working /= DIGIT_RADICES[1];
  const f = Number(working % DIGIT_RADICES[0]);

  return (
    DIGIT_ALPHABETS[0][f] +
    DIGIT_ALPHABETS[1][s] +
    DIGIT_ALPHABETS[2][o] +
    DIGIT_ALPHABETS[3][u]
  );
}

function decodeFsouDigit(group) {
  if (typeof group !== "string" || group.length !== 4) {
    throw new TypeError("Each FSOU group must be a 4-character string");
  }
  const indexes = group.split("").map((char, idx) => {
    const value = charLookups[idx].get(char);
    if (value === undefined) {
      throw new RangeError(`Invalid character '${char}' in FSOU group`);
    }
    return BigInt(value);
  });

  let value = indexes[0];
  value = value * DIGIT_RADICES[1] + indexes[1];
  value = value * DIGIT_RADICES[2] + indexes[2];
  value = value * DIGIT_RADICES[3] + indexes[3];
  return value;
}

function semanticSumToFsouAddress(sum) {
  let working = normalizeSemanticSum(sum);
  if (working < 0n) {
    throw new RangeError("Semantic sums must be non-negative");
  }
  if (working === 0n) {
    return encodeFsouDigit(0n);
  }

  const groups = [];
  while (working > 0n) {
    const digit = working % BASE_144K;
    groups.push(encodeFsouDigit(digit));
    working /= BASE_144K;
  }

  return groups.reverse().join(":");
}

function fsouAddressToSemanticSum(address) {
  if (typeof address !== "string" || address.trim() === "") {
    throw new TypeError("FSOU address must be a non-empty string");
  }
  const groups = address.split(":");
  let total = 0n;
  for (const group of groups) {
    total = total * BASE_144K + decodeFsouDigit(group);
  }
  return total;
}

function isValidFsouAddress(address) {
  try {
    fsouAddressToSemanticSum(address);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  BASE_144K,
  DIGIT_ALPHABETS,
  DIGIT_RADICES,
  encodeFsouDigit,
  decodeFsouDigit,
  semanticSumToFsouAddress,
  fsouAddressToSemanticSum,
  isValidFsouAddress
};
