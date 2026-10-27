"use client";

import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { MESSAGE_MAX, type ContactErrors } from "@/lib/contact";
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
      if (res.status === 400 && body.errors) setErrors(body.errors);
      else setErrorMessage(res.status === 503 ? NOT_CONFIGURED : GENERIC_ERROR);
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
              <input id="name" name="name" type="text" autoComplete="name" required />
            </Field>
            <Field label="Email" name="email" error={errors.email}>
              <input id="email" name="email" type="email" autoComplete="email" required />
            </Field>
            <Field label="Message" name="message" error={errors.message}>
              <textarea id="message" name="message" rows={5} maxLength={MESSAGE_MAX} required />
            </Field>

            {/* Honeypot: hidden from people, filled in by naive bots. */}
            <div className="visually-hidden" aria-hidden="true">
              <label htmlFor="company">Company</label>
              <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
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

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field} data-invalid={error ? "" : undefined}>
      <label htmlFor={name}>{label}</label>
      {children}
      {error && (
        <span className={styles.fieldError} id={`${name}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
