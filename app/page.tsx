"use client"

import styles from "./page.module.css"
import { Hero, GlassmorphicOverlay } from "@/components"

export default function Home() {
  return (
    <main className={styles.container}>
      <div className={styles.bleedingOrb} />
      <GlassmorphicOverlay cutoutSelector="[data-hero]" />
      <div className={styles.content}>
        <Hero />
      </div>
    </main>
  )
}
