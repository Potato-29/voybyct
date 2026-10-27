"use client";

import Image from "next/image";
import { useState } from "react";
import arrow from "@/public/images/arrow-down-right.svg";
import ContactModal from "@/components/ContactModal/ContactModal";
import { site } from "@/lib/site";
import EmailLink from "./EmailLink";
import styles from "./ActionBar.module.css";

export default function ActionBar() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <footer className={styles.bar}>
      {site.contactFormEnabled ? (
        <button type="button" className={styles.action} onClick={() => setContactOpen(true)}>
          Get in touch
          <Image className={styles.arrow} src={arrow} alt="" />
        </button>
      ) : (
        <EmailLink className={styles.action}>
          Get in touch
          <Image className={styles.arrow} src={arrow} alt="" />
        </EmailLink>
      )}
      <EmailLink className={styles.action}>
        check out our work
        <Image className={styles.arrow} src={arrow} alt="" />
      </EmailLink>
      {site.contactFormEnabled && (
        <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
      )}
    </footer>
  );
}
