import Image from "next/image";
import symbols from "@/public/images/symbols.png";
import { site } from "@/lib/site";
import styles from "./About.module.css";

export default function About() {
  return (
    <section className={styles.about} aria-label="About VOYBYCT">
      <p className={styles.description}>{site.description}</p>
      <Image className={styles.symbols} src={symbols} alt="" sizes="(min-width: 1024px) 10vw, 120px" />
    </section>
  );
}
