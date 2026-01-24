"use client"

import styles from "./page.module.css"
import { Hero, Header, Main } from "@/components"
import { ScrollControllerProvider, useScrollController } from "@/context"

function PageContent() {
  const { sectionOffset, state } = useScrollController()
  
  // Calculate transform based on section offset
  // 0 = Hero visible (translateY: 0)
  // 100 = Main visible (translateY: -100vh)
  const isTransitioning = state === "TRANSITIONING_TO_MAIN" || state === "TRANSITIONING_TO_HERO" || state === "SCROLLING_TO_FOOTER"
  
  return (
    <main className={styles.container}>
      <Header />
      
      <div 
        className={styles.sectionsWrapper}
        style={{
          transform: `translateY(-${sectionOffset}vh)`,
          transition: isTransitioning ? "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
        }}
      >
        <div className={styles.section}>
          <Hero />
        </div>
        <div className={styles.section}>
          <Main />
        </div>
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <ScrollControllerProvider>
      <PageContent />
    </ScrollControllerProvider>
  )
}
