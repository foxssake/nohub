import { beforeAll, describe, expect, test } from "bun:test";
import { ApiTest } from "@spec/apitest";

let api: ApiTest;

describe("Sessions API", () => {
  beforeAll(async () => {
    api = await ApiTest.create();
  });

  describe("whereami", () => {
    test("should respond", async () => {
      const reply = await api
        .client()
        .send({
          name: "whereami",
          isRequest: true,
          requestId: "",
        })
        .onReply();

      expect(reply.isSuccessResponse).toBeTrue();
      expect(reply.text).not.toBeEmpty();
    });
  });
});
