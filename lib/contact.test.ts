import { describe, expect, it } from "vitest";
import {
  ContactNotConfiguredError,
  MESSAGE_MAX,
  isContactConfigured,
  sendContactMessage,
  validateContact,
} from "./contact";

const valid = { name: "Ada", email: "ada@x.co", message: "Hi" };
const configured = { CONTACT_TO_EMAIL: "hello@voybyct.com", RESEND_API_KEY: "re_test" };

describe("validateContact", () => {
  it("accepts a valid submission", () => {
    expect(validateContact(valid)).toEqual({ ok: true, data: valid, isSpam: false });
  });

  it("returns trimmed values", () => {
    const result = validateContact({ name: "  Ada ", email: " ada@x.co ", message: " Hi " });
    expect(result).toEqual({ ok: true, data: valid, isSpam: false });
  });

  it("rejects a whitespace-only name", () => {
    const result = validateContact({ ...valid, name: "   " });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.name).toBeDefined();
  });

  it("rejects an invalid email", () => {
    const result = validateContact({ ...valid, email: "not-an-email" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.email).toBeDefined();
  });

  it("accepts a message of exactly MESSAGE_MAX characters", () => {
    expect(MESSAGE_MAX).toBe(5000);
    expect(validateContact({ ...valid, message: "a".repeat(5000) }).ok).toBe(true);
  });

  it("rejects a message longer than MESSAGE_MAX", () => {
    const result = validateContact({ ...valid, message: "a".repeat(5001) });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.message).toBeDefined();
  });

  it.each([null, "str", 42, undefined])("rejects non-object input %s with all errors", (input) => {
    const result = validateContact(input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(["email", "message", "name"]);
  });

  it("rejects non-string field values", () => {
    const result = validateContact({ name: 123, email: ["a@b.co"], message: {} });
    expect(result.ok).toBe(false);
  });

  it("flags a filled honeypot as spam", () => {
    expect(validateContact({ ...valid, company: "bot" })).toEqual({ ok: true, data: valid, isSpam: true });
  });
});

describe("isContactConfigured", () => {
  it("is false with no env", () => {
    expect(isContactConfigured({})).toBe(false);
  });

  it("is false with only one variable set", () => {
    expect(isContactConfigured({ CONTACT_TO_EMAIL: "hello@voybyct.com" })).toBe(false);
  });

  it("is true with both variables set", () => {
    expect(isContactConfigured(configured)).toBe(true);
  });
});

describe("sendContactMessage", () => {
  it("rejects with ContactNotConfiguredError when unconfigured", async () => {
    await expect(sendContactMessage(valid, {})).rejects.toBeInstanceOf(ContactNotConfiguredError);
  });
});
