---
title: "Binary and Decimal Number System Conversion"
date: "2026-04-26"
tags: ["binary", "decimal", "number-systems", "computer-science", "fundamentals"]
description: "A complete guide to converting between binary (base-2) and decimal (base-10) number systems, with step-by-step examples and algorithms."
---

## Introduction

Every piece of data inside a computer — text, images, audio, instructions — is ultimately represented as a sequence of **0s and 1s**. This is the **binary** (base-2) number system. As humans, we naturally think in **decimal** (base-10). Knowing how to move between the two systems is a foundational skill in computer science.

---

## Binary to Decimal

Binary is a **positional** number system where each digit (bit) represents a power of 2, starting from the rightmost position (position 0).

### Method: Positional Value (Powers of 2)

For a binary number $b_n b_{n-1} \ldots b_1 b_0$:

$$\text{Decimal} = b_n \times 2^n + \cdots + b_1 \times 2^1 + b_0 \times 2^0$$

### Example 1 — Convert `1011` to decimal

| Position | 3 | 2 | 1 | 0 |
|----------|---|---|---|---|
| Bit      | 1 | 0 | 1 | 1 |
| Value    | 2³=8 | 2²=4 | 2¹=2 | 2⁰=1 |

$$1 \times 8 + 0 \times 4 + 1 \times 2 + 1 \times 1 = 8 + 0 + 2 + 1 = \mathbf{11}$$

### Example 2 — Convert `11010110` to decimal

| Position | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
|----------|---|---|---|---|---|---|---|---|
| Bit      | 1 | 1 | 0 | 1 | 0 | 1 | 1 | 0 |
| Value    | 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |

$$128 + 64 + 0 + 16 + 0 + 4 + 2 + 0 = \mathbf{214}$$

---

## Decimal to Binary

### Method: Repeated Division by 2

1. Divide the decimal number by 2.
2. Record the **remainder** (0 or 1).
3. Use the **quotient** as the next number to divide.
4. Repeat until the quotient is 0.
5. Read the remainders **from bottom to top** — that is your binary result.

### Example 1 — Convert `13` to binary

| Step | Number | ÷ 2 | Quotient | Remainder |
|------|--------|-----|----------|-----------|
| 1    | 13     | ÷ 2 | 6        | **1**     |
| 2    | 6      | ÷ 2 | 3        | **0**     |
| 3    | 3      | ÷ 2 | 1        | **1**     |
| 4    | 1      | ÷ 2 | 0        | **1**     |

Read remainders bottom-to-top: **`1101`**

Verify: $8 + 4 + 0 + 1 = 13$ ✓

### Example 2 — Convert `214` to binary

| Step | Number | Quotient | Remainder |
|------|--------|----------|-----------|
| 1    | 214    | 107      | **0**     |
| 2    | 107    | 53       | **1**     |
| 3    | 53     | 26       | **1**     |
| 4    | 26     | 13       | **0**     |
| 5    | 13     | 6        | **1**     |
| 6    | 6      | 3        | **0**     |
| 7    | 3      | 1        | **1**     |
| 8    | 1      | 0        | **1**     |

Read bottom-to-top: **`11010110`**

Verify: $128 + 64 + 0 + 16 + 0 + 4 + 2 + 0 = 214$ ✓

---

## Quick Reference Table (0–15)

| Decimal | Binary | Decimal | Binary |
|---------|--------|---------|--------|
| 0       | 0000   | 8       | 1000   |
| 1       | 0001   | 9       | 1001   |
| 2       | 0010   | 10      | 1010   |
| 3       | 0011   | 11      | 1011   |
| 4       | 0100   | 12      | 1100   |
| 5       | 0101   | 13      | 1101   |
| 6       | 0110   | 14      | 1110   |
| 7       | 0111   | 15      | 1111   |

---

## Tips & Common Mistakes

**Reading direction matters.** When you collect remainders during division, always read from the **last remainder to the first** (bottom-to-top). Reversing this is the most common error.

**Leading zeros.** In practice, binary numbers are often padded to a fixed width (e.g., 8-bit: `00001101`). The leading zeros don't change the value.

**Verify your work.** After converting decimal → binary, quickly convert back using the positional method to confirm you get the original number.

**Powers of 2 cheat sheet:**

| 2⁰ | 2¹ | 2² | 2³ | 2⁴ | 2⁵ | 2⁶ | 2⁷ | 2⁸ | 2⁹ | 2¹⁰ |
|----|----|----|----|----|----|----|----|----|-----|------|
| 1  | 2  | 4  | 8  | 16 | 32 | 64 | 128| 256| 512 | 1024 |

---

## Summary

| Direction | Method | Key Step |
|-----------|--------|----------|
| Binary → Decimal | Positional value | Multiply each bit by its power of 2, then sum |
| Decimal → Binary | Repeated division by 2 | Collect remainders, read bottom-to-top |

Once you are comfortable with base-2 and base-10, expanding to **hexadecimal** (base-16) — the system used in memory addresses, color codes, and debugging — becomes straightforward.
