import { describe, expect, it } from "vitest";
import { gmailComposeUrl } from "./email";

describe("gmailComposeUrl", () => {
  it("builds a Gmail compose link for the address", () => {
    expect(gmailComposeUrl("voybyctstudio@gmail.com")).toBe(
      "https://mail.google.com/mail/?view=cm&fs=1&to=voybyctstudio%40gmail.com",
    );
  });
});
