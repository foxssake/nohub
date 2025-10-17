import { describe, expect, mock, test } from "bun:test";
import { EventBus } from "@src/events";

describe("EventBus", () => {
  test("should call handlers on emit", () => {
    // Given
    const eventbus = new EventBus();
    const firstHandler = mock((_a, _b) => {});
    const secondHandler = mock((_a, _b) => {});

    eventbus.on("event", firstHandler);
    eventbus.on("event", secondHandler);

    // When
    eventbus.emit("event", 2, 5);

    // Then
    expect(firstHandler.mock.calls).toEqual([[2, 5]]);
    expect(secondHandler.mock.calls).toEqual([[2, 5]]);
  });

  test("should not call other handlers", () => {
    // Given
    const eventbus = new EventBus();
    const firstHandler = mock((_a, _b) => {});
    const secondHandler = mock((_a, _b) => {});

    eventbus.on("event", firstHandler);
    eventbus.on("else", secondHandler);

    // When
    eventbus.emit("event", 2, 5);

    // Then
    expect(firstHandler.mock.calls).toEqual([[2, 5]]);
    expect(secondHandler.mock.calls).toBeEmpty();
  });

  test("should not call handler after off()", () => {
    // Given
    const eventbus = new EventBus();
    const firstHandler = mock((_a, _b) => {});
    const secondHandler = mock((_a, _b) => {});

    eventbus.on("event", firstHandler);
    eventbus.on("event", secondHandler);
    eventbus.off("event", secondHandler);

    // When
    eventbus.emit("event", 2, 5);

    // Then
    expect(firstHandler.mock.calls).toEqual([[2, 5]]);
    expect(secondHandler.mock.calls).toBeEmpty();
  });
});
