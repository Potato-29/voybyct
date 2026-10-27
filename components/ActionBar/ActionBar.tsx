"use client";

import Image from "next/image";
import { useState } from "react";
import arrow from "@/public/images/arrow-down-right.svg";
import ContactModal from "@/components/ContactModal/ContactModal";
import { site } from "@/lib/site";
import styles from "./ActionBar.module.css";

export default function ActionBar() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <footer className={styles.bar}>
      <button type="button" className={styles.action} onClick={() => setContactOpen(true)}>
        Get in touch
        <Image className={styles.arrow} src={arrow} alt="" />
      </button>
      <a className={styles.action} href={site.behanceUrl} target="_blank" rel="noopener noreferrer">
        check out our work
        <Image className={styles.arrow} src={arrow} alt="" />
      </a>
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </footer>
  );
}
