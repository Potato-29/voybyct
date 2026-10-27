import Image, { getImageProps } from "next/image";
import heroImage from "@/public/images/hero.webp";
import heroWideImage from "@/public/images/hero-wide.webp";
import logoStrip from "@/public/images/logo-strip.png";
import wordmark from "@/public/images/wordmark.png";
import styles from "./Hero.module.css";

// Desktop shows a wide crop sized to the band above the white strip; smaller
// screens show the full scene. Must match the 1024px breakpoint in Hero.module.css.
const DESKTOP_MEDIA = "(min-width: 1024px)";

export default function Hero() {
  const common = { alt: "", fill: true, priority: true, sizes: "100vw" };
  const {
    props: { srcSet: wideSrcSet },
  } = getImageProps({ ...common, src: heroWideImage });
  const { props: imgProps } = getImageProps({ ...common, src: heroImage });

  return (
    <div className={styles.hero}>
      <picture className={styles.media}>
        <source media={DESKTOP_MEDIA} srcSet={wideSrcSet} />
        <img {...imgProps} alt="" className={styles.background} />
      </picture>
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
