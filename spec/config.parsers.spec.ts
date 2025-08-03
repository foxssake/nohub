import { describe, expect, test } from "bun:test";
import {
  byteSize,
  duration,
  enumerated,
  integer,
  number,
  ports,
} from "@src/config.parsers";

describe("integer", () => {
  const cases: Array<[string, string | undefined, number | undefined]> = [
    ["should parse valid", "42", 42],
    ["should return undefined on invalid", "asd", undefined],
    ["should return undefined on empty", "", undefined],
    ["should return undefined on undefined", undefined, undefined],
  ];

  test.each(cases)("%s", (_, input, expected) => {
    if (expected !== undefined) expect(integer(input)).toBe(expected);
    else expect(integer(input)).toBeUndefined();
  });
});

describe("number", () => {
  const cases: Array<[string, string | undefined, number | undefined]> = [
    ["should parse valid integer", "42", 42],
    ["should parse valid number", "420.69", 420.69],
    ["should return undefined on invalid", "asd", undefined],
    ["should return undefined on empty", "", undefined],
    ["should return undefined on undefined", undefined, undefined],
  ];

  test.each(cases)("%s", (_, input, expected) => {
    if (expected !== undefined) expect(number(input)).toBe(expected);
    else expect(number(input)).toBeUndefined();
  });
});

describe("enumerated", () => {
  const cases: Array<
    [string, string | undefined, string[], string | undefined]
  > = [
    ["should return known", "a", ["a", "b", "c"], "a"],
    ["should return undefined on unknown", "f", ["a", "b"], undefined],
    ["should return undefined on empty", "", ["a", "b"], undefined],
    ["should return undefined on undefined", undefined, ["a"], undefined],
  ];

  test.each(cases)("%s", (_, input, allowed, expected) => {
    if (expected !== undefined)
      expect(enumerated(input, allowed)).toBe(expected);
    else expect(enumerated(input, allowed)).toBeUndefined();
  });
});

describe("byteSize", () => {
  const validCases: Array<[string, string | undefined, number | undefined]> = [
    ["should pass through undefined", undefined, undefined],
    ["should parse without postfix", "64", 64],
    ["should parse kb", "64kb", 64 * 1024],
    ["should parse Mb", "64Mb", 64 * 1024 ** 2],
    ["should parse Gb", "64Gb", 64 * 1024 ** 3],
    ["should parse Gb", "64Tb", 64 * 1024 ** 4],
    ["should parse Pb", "6.4Pb", 6.4 * 1024 ** 5],
    ["should parse Eb", "6.4Eb", 6.4 * 1024 ** 6],
    ["should parse Zb", "64Zb", 64 * 1024 ** 7],
    ["should parse Yb", "64Yb", 64 * 1024 ** 8],
  ];

  const throwCases: Array<[string, string]> = [
    ["should throw on invalid format", "no6"],
    ["should throw on invalid postfix", "64Bb"],
  ];

  test.each(validCases)("%s", (_, input, expected) => {
    if (expected !== undefined) expect(byteSize(input)).toBe(expected);
    else expect(byteSize(input)).toBeUndefined();
  });

  test.each(throwCases)("%s", (_, input) => {
    expect(() => byteSize(input)).toThrow();
  });
});

describe("duration", () => {
  const validCases: Array<[string, string | undefined, number | undefined]> = [
    ["should pass through undefined", undefined, undefined],
    ["should parse without postfix", "64", 64],
    ["should parse usec", "64us", 0.000064],
    ["should parse msec", "64ms", 0.064],
    ["should parse sec", "64s", 64],
    ["should parse minute", "10m", 600],
    ["should parse hour", "4h", 14400],
    ["should parse hour", "4hr", 14400],
    ["should parse day", "2d", 172800],
    ["should parse week", "2w", 1209600],
    ["should parse month", "3mo", 7776000],
    ["should parse year", "4yr", 126144000],
  ];

  const throwCases: Array<[string, string]> = [
    ["should throw on invalid format", "no6"],
    ["should throw on invalid postfix", "64mh"],
  ];

  test.each(validCases)("%s", (_, input, expected) => {
    if (expected !== undefined) expect(duration(input)).toBe(expected);
    else expect(duration(input)).toBeUndefined();
  });

  test.each(throwCases)("%s", (_, input) => {
    expect(() => duration(input)).toThrow();
  });
});

describe("ports", () => {
  const cases: Array<[string, string | undefined, number[] | undefined]> = [
    ["should parse literal", "1024", [1024]],
    ["should parse absolute", "1024-1026", [1024, 1025, 1026]],
    ["should parse relative", "2048+3", [2048, 2049, 2050, 2051]],
    ["should parse single absolute", "1024-1024", [1024]],
    ["should parse single relative", "1024+0", [1024]],
    ["should return sorted", "2048+1, 1024-1025", [1024, 1025, 2048, 2049]],
    ["should return unique", "1-4, 2, 2-6", [1, 2, 3, 4, 5, 6]],
  ];

  test.each(cases)("%s", (_, input, expected) => {
    if (expected !== undefined) expect(ports(input)).toEqual(expected);
    else expect(ports(input)).toBeUndefined();
  });
});
