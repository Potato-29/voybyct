import { ContactNotConfiguredError, sendContactMessage, validateContact } from "@/lib/contact";

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const result = validateContact(body);
  if (!result.ok) return Response.json({ error: "invalid", errors: result.errors }, { status: 400 });
  // Pretend success so bots get no signal.
  if (result.isSpam) return Response.json({ ok: true });

  try {
    await sendContactMessage(result.data);
  } catch (error) {
    if (error instanceof ContactNotConfiguredError) {
      return Response.json({ error: "not_configured" }, { status: 503 });
    }
    console.error("Failed to send contact message", error);
    return Response.json({ error: "send_failed" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
