---
title: "Bitwise Operators and Expressions"
date: "2026-04-27"
tags: ["bitwise", "operators", "xor", "bit-manipulation", "computer-science", "fundamentals"]
description: "A guide to bitwise operators (AND, OR, NOT, XOR, shifts) and how to combine them into practical expressions for bit manipulation."
---

## Introduction

At the lowest level, a computer stores everything as bits — 0s and 1s. Bitwise operators work directly on those bits, one bit at a time, making them extremely fast and memory-efficient. Understanding them unlocks a class of techniques used in systems programming, cryptography, competitive programming, and interview problems.

If you are unfamiliar with how numbers are represented in binary, see [Binary and Decimal Number System Conversion](/post/technical/fundamentals/binary-decimal-conversion) first.

---

## The Six Bitwise Operators

### AND (`&`)

Returns 1 only when **both** bits are 1.

| A | B | A & B |
|---|---|-------|
| 0 | 0 |   0   |
| 0 | 1 |   0   |
| 1 | 0 |   0   |
| 1 | 1 |   1   |

```python
a = 0b1100  # 12
b = 0b1010  # 10
print(bin(a & b))  # 0b1000 → 8
```

**Use AND to** clear bits or test whether a specific bit is set.

---

### OR (`|`)

Returns 1 when **at least one** bit is 1.

| A | B | A \| B |
|---|---|--------|
| 0 | 0 |   0    |
| 0 | 1 |   1    |
| 1 | 0 |   1    |
| 1 | 1 |   1    |

```python
a = 0b1100  # 12
b = 0b1010  # 10
print(bin(a | b))  # 0b1110 → 14
```

**Use OR to** set bits.

---

### NOT (`~`)

Flips every bit. For a signed integer, `~n = -(n + 1)`.

| A | ~A |
|---|----|
| 0 |  1 |
| 1 |  0 |

```python
n = 5         # binary: ...0000 0101
print(~n)     # -6  (two's complement: ...1111 1010)
```

**Use NOT to** invert a bitmask.

---

### XOR (`^`)

Returns 1 when the bits are **different**.

| A | B | A ^ B |
|---|---|-------|
| 0 | 0 |   0   |
| 0 | 1 |   1   |
| 1 | 0 |   1   |
| 1 | 1 |   0   |

```python
a = 0b1100  # 12
b = 0b1010  # 10
print(bin(a ^ b))  # 0b0110 → 6
```

XOR is the most versatile bitwise operator — it gets its own deep-dive section below.

---

### Left Shift (`<<`)

Shifts all bits to the left by $n$ positions, filling the right with 0s. Equivalent to multiplying by $2^n$.

$$x \ll n = x \times 2^n$$

```python
print(1 << 3)   # 8   (1 * 2³)
print(5 << 2)   # 20  (5 * 2²)
```

---

### Right Shift (`>>`)

Shifts all bits to the right by $n$ positions. Equivalent to integer division by $2^n$.

$$x \gg n = \lfloor x / 2^n \rfloor$$

```python
print(16 >> 2)  # 4   (16 / 2²)
print(7  >> 1)  # 3   (7 // 2)
```

---

## XOR Deep Dive

XOR has two properties that make it uniquely powerful:

| Property | Expression | Meaning |
|----------|-----------|---------|
| Self-inverse | `a ^ a = 0` | A value XORed with itself cancels out |
| Identity | `a ^ 0 = a` | XOR with 0 leaves the value unchanged |
| Commutative | `a ^ b = b ^ a` | Order doesn't matter |
| Associative | `(a ^ b) ^ c = a ^ (b ^ c)` | Grouping doesn't matter |

These properties mean that if you XOR the same value an even number of times, it disappears. XOR an odd number of times, it survives. This is the basis for most XOR tricks.

---

## Practical Expressions & Tricks

### Check if a number is odd

```python
def is_odd(n: int) -> bool:
    return bool(n & 1)
```

The lowest bit is 1 for odd numbers and 0 for even numbers. `n & 1` isolates it.

---

### Check if a number is a power of 2

A power of 2 has exactly one bit set: `0001`, `0010`, `0100`, `1000`, …  
Subtracting 1 flips all bits up to and including that bit: `0001 → 0000`, `0100 → 0011`.  
AND-ing them together gives 0 if and only if $n$ is a power of 2.

```python
def is_power_of_two(n: int) -> bool:
    return n > 0 and (n & (n - 1)) == 0
```

---

### Set, clear, and toggle a bit

```python
# Set bit at position i (force it to 1)
n = n | (1 << i)

# Clear bit at position i (force it to 0)
n = n & ~(1 << i)

# Toggle bit at position i (flip it)
n = n ^ (1 << i)

# Read bit at position i
bit = (n >> i) & 1
```

---

### Swap two numbers without a temporary variable

Using XOR's self-inverse property:

```python
a, b = 9, 5

a = a ^ b   # a holds a⊕b
b = a ^ b   # b = (a⊕b)⊕b = a
a = a ^ b   # a = (a⊕b)⊕a = b

print(a, b)  # 5, 9
```

> This works, but in practice a `a, b = b, a` swap is clearer. Know the XOR version for interviews.

---

### Find the single non-duplicate in an array

Given an array where every element appears **twice** except one, find the odd one out.

XOR all elements together. Pairs cancel out (`x ^ x = 0`), leaving only the unique value.

```python
def find_unique(nums: list[int]) -> int:
    result = 0
    for n in nums:
        result ^= n
    return result

print(find_unique([4, 1, 2, 1, 2]))  # 4
```

Time: $O(n)$, Space: $O(1)$.

---

### Count set bits (Brian Kernighan's algorithm)

`n & (n - 1)` clears the lowest set bit. Repeat until $n = 0$; the number of iterations equals the number of set bits.

```python
def count_set_bits(n: int) -> int:
    count = 0
    while n:
        n &= n - 1
        count += 1
    return count

print(count_set_bits(0b10110))  # 3
```

---

## Summary

| Operator | Symbol | Core use |
|----------|--------|----------|
| AND | `&` | Mask / test bits |
| OR | `\|` | Set bits |
| NOT | `~` | Invert mask |
| XOR | `^` | Toggle / cancel pairs |
| Left shift | `<<` | Multiply by power of 2 |
| Right shift | `>>` | Divide by power of 2 |

| Trick | Expression |
|-------|-----------|
| Is odd? | `n & 1` |
| Is power of 2? | `n > 0 and (n & (n-1)) == 0` |
| Set bit $i$ | `n \| (1 << i)` |
| Clear bit $i$ | `n & ~(1 << i)` |
| Toggle bit $i$ | `n ^ (1 << i)` |
| Swap without temp | `a^=b; b^=a; a^=b` |
| Find unique element | XOR all values |
| Count set bits | `n &= n-1` loop |
