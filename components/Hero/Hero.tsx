import Image from "next/image";
import heroImage from "@/public/images/hero.webp";
import logoStrip from "@/public/images/logo-strip.png";
import wordmark from "@/public/images/wordmark.png";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <div className={styles.hero}>
      <Image
        className={styles.background}
        src={heroImage}
        alt=""
        fill
        priority
        sizes="100vw"
        placeholder="blur"
      />
      <div className={styles.content}>
        <h1 className={styles.wordmark}>
          <Image src={wordmark} alt="VOYBYCT" priority sizes="(min-width: 1024px) 15vw, 40vw" />
        </h1>
        <p className={styles.tagline}>an antidote to bland</p>
      </div>
      {/* White strip with a V-shaped cutout that reveals the hero image. */}
      <Image className={styles.strip} src={logoStrip} alt="" sizes="100vw" />
    </div>
  );
}
