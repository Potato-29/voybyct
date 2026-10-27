export type ContactData = { name: string; email: string; message: string };
export type ContactErrors = Partial<Record<keyof ContactData, string>>;
export type ValidationResult =
  | { ok: true; data: ContactData; isSpam: boolean }
  | { ok: false; errors: ContactErrors };

type Env = Record<string, string | undefined>;

export const MESSAGE_MAX = 5000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  return typeof value === "string" ? value.trim() : "";
}

export function validateContact(input: unknown): ValidationResult {
  const source = typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};
  const data: ContactData = {
    name: field(source, "name"),
    email: field(source, "email"),
    message: field(source, "message"),
  };

  const errors: ContactErrors = {};
  if (!data.name) errors.name = "Please enter your name.";
  if (!data.email) errors.email = "Please enter your email.";
  else if (!EMAIL_PATTERN.test(data.email)) errors.email = "Please enter a valid email.";
  if (!data.message) errors.message = "Please enter a message.";
  else if (data.message.length > MESSAGE_MAX)
    errors.message = `Please keep your message under ${MESSAGE_MAX} characters.`;

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  // "company" is a honeypot: hidden from people, filled in by naive bots.
  return { ok: true, data, isSpam: field(source, "company") !== "" };
}

export class ContactNotConfiguredError extends Error {
  constructor() {
    super("Contact delivery is not configured");
    this.name = "ContactNotConfiguredError";
  }
}

export function isContactConfigured(env: Env = process.env): boolean {
  return Boolean(env.CONTACT_TO_EMAIL && env.RESEND_API_KEY);
}

// The single place where messages are delivered. Wire up the email provider here.
export async function sendContactMessage(data: ContactData, env: Env = process.env): Promise<void> {
  if (!isContactConfigured(env)) throw new ContactNotConfiguredError();
  throw new Error("Email delivery not implemented");
}
