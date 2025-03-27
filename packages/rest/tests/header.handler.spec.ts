import { describe, expect, it } from "vitest";
import { HeaderHandler } from "../src/index.js";

describe("HeaderHandler", () => {
  describe("parse", () => {
    it("should parse standard object format headers", () => {
      const headers = {
        "Content-Type": "application/json",
        "X-Custom": ["value1", "value2"],
      };

      const result = HeaderHandler.parse(headers);

      expect(result.headers).toEqual({
        "content-type": "application/json",
        "x-custom": "value1, value2",
      });

      expect(result.rawHeaders).toEqual({
        "content-type": "application/json",
        "x-custom": ["value1", "value2"],
      });
    });

    it("should parse string array format headers", () => {
      const headers = [
        "Content-Type",
        "application/json",
        "X-Custom",
        "value1",
        "X-Custom",
        "value2",
      ];

      const result = HeaderHandler.parse(headers);

      expect(result.headers).toEqual({
        "content-type": "application/json",
        "x-custom": "value1, value2",
      });

      expect(result.rawHeaders).toEqual({
        "content-type": "application/json",
        "x-custom": ["value1", "value2"],
      });
    });

    it("should parse iterable headers", () => {
      // @ts-expect-error
      const headers = new Map([
        ["Content-Type", "application/json"],
        ["X-Custom", ["value1", "value2"]],
      ]);

      const result = HeaderHandler.parse(headers);

      expect(result.headers).toEqual({
        "content-type": "application/json",
        "x-custom": "value1, value2",
      });

      expect(result.rawHeaders).toEqual({
        "content-type": "application/json",
        "x-custom": ["value1", "value2"],
      });
    });

    it("should handle null or undefined headers", () => {
      expect(HeaderHandler.parse(null)).toEqual({
        headers: {},
        rawHeaders: {},
      });

      expect(HeaderHandler.parse(undefined)).toEqual({
        headers: {},
        rawHeaders: {},
      });
    });

    it("should skip undefined values in arrays", () => {
      const headers = ["Valid-Key", "valid-value", "Invalid-Key", undefined];

      // @ts-expect-error
      const result = HeaderHandler.parse(headers);

      expect(result.headers).toEqual({
        "valid-key": "valid-value",
      });
    });
  });

  describe("getValue", () => {
    it("should get a value by key (case-insensitive)", () => {
      const headers = {
        "Content-Type": "application/json",
        "x-custom": ["value1", "value2"],
      };

      expect(HeaderHandler.getValue(headers, "content-type")).toBe(
        "application/json",
      );
      expect(HeaderHandler.getValue(headers, "Content-Type")).toBe(
        "application/json",
      );
      expect(HeaderHandler.getValue(headers, "X-Custom")).toBe(
        "value1, value2",
      );
      expect(HeaderHandler.getValue(headers, "x-custom")).toBe(
        "value1, value2",
      );
    });

    it("should return undefined for non-existent keys", () => {
      const headers = { "Content-Type": "application/json" };
      expect(HeaderHandler.getValue(headers, "X-Not-Present")).toBeUndefined();
    });

    it("should handle array format headers", () => {
      const headers = ["Content-Type", "application/json", "X-Custom", "value"];

      expect(HeaderHandler.getValue(headers, "content-type")).toBe(
        "application/json",
      );
      expect(HeaderHandler.getValue(headers, "x-custom")).toBe("value");
    });

    it("should handle iterable headers", () => {
      const headers = new Map([
        ["Content-Type", "application/json"],
        ["X-Custom", "value"],
      ]);

      expect(HeaderHandler.getValue(headers, "content-type")).toBe(
        "application/json",
      );
      expect(HeaderHandler.getValue(headers, "x-custom")).toBe("value");
    });

    it("should handle null or undefined headers", () => {
      expect(HeaderHandler.getValue(null, "any-key")).toBeUndefined();
      expect(HeaderHandler.getValue(undefined, "any-key")).toBeUndefined();
    });
  });

  describe("getNumber", () => {
    it("should parse numeric header values", () => {
      const headers = {
        "Content-Length": "1024",
        "X-Count": "42",
        "X-Invalid": "not-a-number",
      };

      expect(HeaderHandler.getNumber(headers, "content-length")).toBe(1024);
      expect(HeaderHandler.getNumber(headers, "x-count")).toBe(42);
      expect(HeaderHandler.getNumber(headers, "x-invalid")).toBeUndefined();
      expect(HeaderHandler.getNumber(headers, "x-not-present")).toBeUndefined();
    });
  });

  describe("has", () => {
    it("should check if a header exists (case-insensitive)", () => {
      const headers = {
        "Content-Type": "application/json",
        "X-Custom": "value",
      };

      expect(HeaderHandler.has(headers, "content-type")).toBe(true);
      expect(HeaderHandler.has(headers, "Content-Type")).toBe(true);
      expect(HeaderHandler.has(headers, "x-custom")).toBe(true);
      expect(HeaderHandler.has(headers, "X-CUSTOM")).toBe(true);
      expect(HeaderHandler.has(headers, "not-present")).toBe(false);
    });

    it("should work with array format headers", () => {
      const headers = ["Content-Type", "application/json", "X-Custom", "value"];

      expect(HeaderHandler.has(headers, "content-type")).toBe(true);
      expect(HeaderHandler.has(headers, "x-custom")).toBe(true);
      expect(HeaderHandler.has(headers, "not-present")).toBe(false);
    });

    it("should work with iterable headers", () => {
      const headers = new Map([
        ["Content-Type", "application/json"],
        ["X-Custom", "value"],
      ]);

      expect(HeaderHandler.has(headers, "content-type")).toBe(true);
      expect(HeaderHandler.has(headers, "x-custom")).toBe(true);
      expect(HeaderHandler.has(headers, "not-present")).toBe(false);
    });

    it("should handle null or undefined headers", () => {
      expect(HeaderHandler.has(null, "any-key")).toBe(false);
      expect(HeaderHandler.has(undefined, "any-key")).toBe(false);
    });
  });

  describe("normalizeKey", () => {
    it("should convert keys to lowercase and trim", () => {
      expect(HeaderHandler.normalizeKey("Content-Type")).toBe("content-type");
      expect(HeaderHandler.normalizeKey(" X-CUSTOM ")).toBe("x-custom");
      expect(HeaderHandler.normalizeKey("authorization")).toBe("authorization");
    });
  });

  describe("normalizeValue", () => {
    it("should join arrays with comma and trim strings", () => {
      expect(HeaderHandler.normalizeValue(["a", "b", "c"])).toBe("a, b, c");
      expect(HeaderHandler.normalizeValue(" value ")).toBe("value");
      expect(HeaderHandler.normalizeValue(undefined)).toBeUndefined();
    });
  });
});
