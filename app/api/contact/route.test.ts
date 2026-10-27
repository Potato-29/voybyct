import { beforeEach, describe, expect, it, vi } from "vitest";
import { ContactNotConfiguredError, HONEYPOT_FIELD, sendContactMessage } from "@/lib/contact";
import { POST } from "./route";

vi.mock("@/lib/contact", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/contact")>()),
  sendContactMessage: vi.fn(),
}));

const send = vi.mocked(sendContactMessage);
const valid = { name: "Ada", email: "ada@x.co", message: "Hi" };

function post(body: string) {
  return POST(new Request("http://x/api/contact", { method: "POST", body }));
}

async function expectResponse(res: Response, status: number, body: unknown) {
  expect(res.status).toBe(status);
  expect(await res.json()).toEqual(body);
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    send.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns 400 invalid_json for a non-JSON body", async () => {
    await expectResponse(await post("not json{"), 400, { error: "invalid_json" });
    expect(send).not.toHaveBeenCalled();
  });

  it("returns 400 with field errors for invalid input", async () => {
    const res = await post(JSON.stringify({ ...valid, email: "nope" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("invalid");
    expect(body.errors.email).toBeDefined();
    expect(send).not.toHaveBeenCalled();
  });

  it("returns 200 without sending when the honeypot is filled", async () => {
    await expectResponse(await post(JSON.stringify({ ...valid, [HONEYPOT_FIELD]: "bot" })), 200, { ok: true });
    expect(send).not.toHaveBeenCalled();
  });

  it("returns 503 not_configured when delivery is not configured", async () => {
    send.mockRejectedValue(new ContactNotConfiguredError());
    await expectResponse(await post(JSON.stringify(valid)), 503, { error: "not_configured" });
  });

  it("returns 500 send_failed when the sender throws", async () => {
    send.mockRejectedValue(new Error("provider down"));
    await expectResponse(await post(JSON.stringify(valid)), 500, { error: "send_failed" });
  });

  it("returns 200 and passes trimmed data to the sender on success", async () => {
    send.mockResolvedValue(undefined);
    await expectResponse(await post(JSON.stringify({ ...valid, name: " Ada " })), 200, { ok: true });
    expect(send).toHaveBeenCalledWith(valid);
  });
});
