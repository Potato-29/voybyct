import styles from "./Ticker.module.css";

const PHRASE = "the page is under design maintenance";
const REPEAT = 8;

export default function Ticker() {
  const items = Array.from({ length: REPEAT }, (_, i) => (
    <span key={i} className={styles.item}>
      {PHRASE} |
    </span>
  ));

  return (
    <header className={styles.ticker} aria-label={PHRASE}>
      <div className={styles.track} aria-hidden="true">
        <div className={styles.group}>{items}</div>
        <div className={styles.group}>{items}</div>
      </div>
    </header>
  );
}
