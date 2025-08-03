import { describe, expect, test } from "bun:test";
import { Repository } from "@src/repository";

interface TestItem {
  id: number;
  value: string;
}

function makeRepository(): Repository<TestItem, number> {
  return new Repository((it) => it.id);
}

describe("Repository", () => {
  describe("add", () => {
    test("should add item", () => {
      // Given
      const repository = makeRepository();
      const expected = { id: 0, value: "foo" };

      // When
      const actual = repository.add(expected);

      // Then
      expect(actual).toEqual(expected);
      expect(repository.count()).toBe(1);
    });

    test("should reject items with same id", () => {
      // Given
      const repository = makeRepository();
      const item = { id: 0, value: "foo" };
      const duplicate = { id: 0, value: "bar" };

      repository.add(item);

      // When + then
      expect(() => repository.add(duplicate)).toThrow();
    });
  });

  describe("update", () => {
    test("should update item", () => {
      // Given
      const repository = makeRepository();
      const update = { id: 0, value: "bar" };
      repository.add({ id: 0, value: "foo" });

      // When
      repository.update(update);

      // Then
      const actual = repository.find(update.id);
      expect(actual).toEqual(update);
    });

    test("should reject unknown item", () => {
      // Given
      const repository = makeRepository();
      const update = { id: 0, value: "bar" };

      // When + then
      expect(() => repository.update(update)).toThrow();
    });
  });

  describe("find", () => {
    test("should return known item", () => {
      // Given
      const repository = makeRepository();
      const expected = { id: 0, value: "foo" };
      repository.add(expected);

      // When
      const actual = repository.find(expected.id);

      // Then
      expect(actual).toEqual(expected);
    });

    test("should return undefined on unknown", () => {
      // Given
      const repository = makeRepository();

      // When
      const actual = repository.find(0);

      // Then
      expect(actual).toBeUndefined();
    });
  });

  describe("has", () => {
    test("should return true on known", () => {
      // Given
      const repository = makeRepository();
      const item = { id: 0, value: "foo" };
      repository.add(item);

      // When
      const result = repository.has(item.id);

      // Then
      expect(result).toBeTrue();
    });

    test("should return false on unknown", () => {
      // Given
      const repository = makeRepository();
      const item = { id: 0, value: "foo" };

      // When
      const result = repository.has(item.id);

      // Then
      expect(result).toBeFalse();
    });
  });

  describe("list", () => {
    test("should return empty", () => {
      // Given
      const repository = makeRepository();
      const expected: TestItem[] = [];

      // When
      const actual = [...repository.list()];

      // Then
      expect(actual).toEqual(expected);
    });

    test("should return items", () => {
      // Given
      const repository = makeRepository();
      const expected = [
        { id: 0, value: "foo" },
        { id: 1, value: "bar" },
      ];
      expected.forEach((item) => repository.add(item));

      // When
      const actual = [...repository.list()];

      // Then
      expect(actual).toEqual(expected);
    });
  });

  describe("remove", () => {
    test("should remove known", () => {
      // Given
      const repository = makeRepository();
      const item = { id: 0, value: "foo" };
      repository.add(item);

      // When
      const didRemove = repository.remove(item.id);

      // Then
      expect(didRemove).toBeTrue();
      expect(repository.count()).toBe(0);
    });

    test("should ignore unknown", () => {
      // Given
      const repository = makeRepository();
      const item = { id: 0, value: "foo" };

      // When
      const didRemove = repository.remove(item.id);

      // Then
      expect(didRemove).toBeFalse();
    });
  });

  describe("hasItem", () => {
    test("should return true on known", () => {
      // Given
      const repository = makeRepository();
      const item = { id: 0, value: "foo" };
      repository.add(item);

      // When
      const result = repository.hasItem(item);

      // Then
      expect(result).toBeTrue();
    });

    test("should return false on unknown", () => {
      // Given
      const repository = makeRepository();
      const item = { id: 0, value: "foo" };

      // When
      const result = repository.hasItem(item);

      // Then
      expect(result).toBeFalse();
    });
  });

  describe("removeItem", () => {
    test("should remove known", () => {
      // Given
      const repository = makeRepository();
      const item = { id: 0, value: "foo" };
      repository.add(item);

      // When
      const didRemove = repository.removeItem(item);

      // Then
      expect(didRemove).toBeTrue();
      expect([...repository.list()].length).toBe(0);
    });

    test("should ignore unknown", () => {
      // Given
      const repository = makeRepository();
      const item = { id: 0, value: "foo" };

      // When
      const didRemove = repository.removeItem(item);

      // Then
      expect(didRemove).toBeFalse();
    });
  });
});
