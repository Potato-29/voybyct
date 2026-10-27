import { useId, type ReactNode } from "react";
import styles from "./ContactModal.module.css";

type ControlProps = {
  id: string;
  name: string;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
};

type Props = {
  label: string;
  name: string;
  error?: string;
  children: (control: ControlProps) => ReactNode;
};

// Renders a labelled form control and ties its error message to it for assistive tech.
export default function Field({ label, name, error, children }: Props) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={styles.field} data-invalid={error ? "" : undefined}>
      <label htmlFor={id}>{label}</label>
      {children({
        id,
        name,
        ...(error && { "aria-invalid": true, "aria-describedby": errorId }),
      })}
      {error && (
        <span className={styles.fieldError} id={errorId}>
          {error}
        </span>
      )}
    </div>
  );
}
