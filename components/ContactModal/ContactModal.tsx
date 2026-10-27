"use client";

import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { HONEYPOT_FIELD, MESSAGE_MAX, type ContactErrors } from "@/lib/contact";
import Field from "./Field";
import styles from "./ContactModal.module.css";

type Status = "idle" | "submitting" | "success" | "error";

const NOT_CONFIGURED = "The contact form isn't connected yet — please reach out on Behance for now.";
const GENERIC_ERROR = "Something went wrong sending your message. Please try again.";

type Props = { open: boolean; onClose: () => void };

export default function ContactModal({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    // Clicks on the card land on its children; only the backdrop area targets the dialog itself.
    if (event.target === event.currentTarget) onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    const form = event.currentTarget;
    setStatus("submitting");
    setErrors({});
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (res.ok) {
        form.reset();
        setStatus("success");
        return;
      }
      const body = await res.json().catch(() => ({}));
      if (res.status === 400 && body.errors) {
        setErrors(body.errors);
        // Focus the first invalid field so its linked error message is announced.
        const first = (["name", "email", "message"] as const).find((key) => body.errors[key]);
        if (first) requestAnimationFrame(() => form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus());
      } else {
        setErrorMessage(res.status === 503 ? NOT_CONFIGURED : GENERIC_ERROR);
      }
      setStatus("error");
    } catch {
      setErrorMessage(GENERIC_ERROR);
      setStatus("error");
    }
  }

  function handleClose() {
    if (status === "success") setStatus("idle");
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="contact-title"
      onClose={handleClose}
      onClick={handleBackdropClick}
    >
      <div className={styles.card}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2 id="contact-title" className={styles.title}>
          Get in touch
        </h2>

        {status === "success" ? (
          <p className={styles.success} role="status">
            Thanks — your message is on its way. We&apos;ll get back to you soon.
          </p>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Field label="Name" name="name" error={errors.name}>
              {(control) => <input {...control} type="text" autoComplete="name" required />}
            </Field>
            <Field label="Email" name="email" error={errors.email}>
              {(control) => <input {...control} type="email" autoComplete="email" required />}
            </Field>
            <Field label="Message" name="message" error={errors.message}>
              {(control) => <textarea {...control} rows={5} maxLength={MESSAGE_MAX} required />}
            </Field>

            {/* Honeypot: display:none so people and autofill skip it; naive bots fill it in. */}
            <div hidden>
              <input name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
            </div>

            {errorMessage && (
              <p className={styles.formError} role="alert">
                {errorMessage}
              </p>
            )}

            <button type="submit" className={styles.submit} disabled={status === "submitting"}>
              {status === "submitting" ? "Sending…" : "Send message"}
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
}
