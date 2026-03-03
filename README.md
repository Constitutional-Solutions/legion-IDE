# legion-IDE
Radix & Philang coding environment

## Radix-Core (Base-144,000 FSOU)
The Radix-Core module converts semantic sums (non-negative integers) into Base-144,000 FSOU addresses and back. Each FSOU digit is expressed as four characters (F, S, O, U) using sub-radices 24, 25, 24, and 10 whose product yields the 144,000 base.

- `semanticSumToFsouAddress(sum)` produces an FSOU address string (groups separated by `:`).
- `fsouAddressToSemanticSum(address)` returns the original semantic sum as a bigint.
- `isValidFsouAddress(address)` performs lightweight validation.

### Example
```js
const {
  semanticSumToFsouAddress,
  fsouAddressToSemanticSum
} = require("./src/radix-core");

const address = semanticSumToFsouAddress(144000n + 123n); // "0001:00C3"
const roundTrip = fsouAddressToSemanticSum(address); // 144123n
```
