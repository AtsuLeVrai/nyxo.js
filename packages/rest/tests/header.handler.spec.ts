import { describe, expect, it } from "vitest";
import { HeaderHandler } from "../src/index.js";

describe("HeaderHandler", () => {
  describe("parse", () => {
    it("should return empty objects when headers are null/undefined", () => {
      expect(HeaderHandler.parse(null)).toEqual({
        headers: {},
        rawHeaders: {},
      });
      expect(HeaderHandler.parse(undefined)).toEqual({
        headers: {},
        rawHeaders: {},
      });
    });

    it("should parse string array headers correctly", () => {
      const headers = [
        "Content-Type",
        "application/json",
        "Accept",
        "text/html",
      ];
      const result = HeaderHandler.parse(headers);
      expect(result.headers).toEqual({
        "content-type": "application/json",
        accept: "text/html",
      });
    });
  });

  describe("getValue", () => {
    it("should get value for existing header", () => {
      const headers = { "Content-Type": "application/json" };
      expect(HeaderHandler.getValue(headers, "content-type")).toBe(
        "application/json",
      );
      expect(HeaderHandler.getValue(headers, "Content-Type")).toBe(
        "application/json",
      );
    });

    it("should return undefined for non-existing header", () => {
      const headers = { "Content-Type": "application/json" };
      expect(HeaderHandler.getValue(headers, "accept")).toBeUndefined();
    });
  });

  describe("getNumber", () => {
    it("should parse numeric headers correctly", () => {
      const headers = { "content-length": "123" };
      expect(HeaderHandler.getNumber(headers, "content-length")).toBe(123);
    });

    it("should return undefined for non-numeric headers", () => {
      const headers = { "content-length": "abc" };
      expect(
        HeaderHandler.getNumber(headers, "content-length"),
      ).toBeUndefined();
    });
  });

  describe("normalizeHeaders", () => {
    it("should handle array headers", () => {
      const headers = ["Accept", "text/html, application/json"];
      const result = HeaderHandler.normalizeHeaders(headers);
      expect(result).toEqual({
        accept: "text/html, application/json",
      });
    });

    it("should handle iterable headers", () => {
      // @ts-expect-error
      const headers = new Map([
        ["Content-Type", "application/json"],
        ["Accept", ["text/html", "application/json"]],
      ]);
      const result = HeaderHandler.normalizeHeaders(headers);
      expect(result).toEqual({
        "content-type": "application/json",
        accept: ["text/html", "application/json"],
      });
    });
  });

  describe("convertToStringRecord", () => {
    it("should convert arrays to comma-separated strings", () => {
      const headers = {
        accept: ["text/html", "application/json"],
        "content-type": "application/json",
      };
      const result = HeaderHandler.convertToStringRecord(headers);
      expect(result).toEqual({
        accept: "text/html, application/json",
        "content-type": "application/json",
      });
    });

    it("should skip undefined values", () => {
      const headers = {
        "content-type": "application/json",
        "x-empty": undefined,
      };
      // @ts-expect-error
      const result = HeaderHandler.convertToStringRecord(headers);
      expect(result).toEqual({
        "content-type": "application/json",
      });
    });
  });
});
