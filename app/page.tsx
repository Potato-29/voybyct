import About from "@/components/About/About";
import ActionBar from "@/components/ActionBar/ActionBar";
import Hero from "@/components/Hero/Hero";
import Ticker from "@/components/Ticker/Ticker";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <Ticker />
      <main className={styles.stage}>
        <Hero />
        <About />
      </main>
      <ActionBar />
    </>
  );
}
