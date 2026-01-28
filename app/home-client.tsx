"use client"

import styles from "./page.module.css"
import { Hero, Header, Main, type FooterProps } from "@/components"
import { ScrollControllerProvider, useScrollController } from "@/context"
import type { ServiceDTO } from "@/types/database"

interface HomeClientProps {
  heroTitle: string
  headerButtonText: string
  mainSectionTitle: string
  footerProps: FooterProps
  services: ServiceDTO[]
}

function PageContent({
  heroTitle,
  headerButtonText,
  mainSectionTitle,
  footerProps,
  services,
}: HomeClientProps) {
  const { sectionOffset, state } = useScrollController()

  // Calculate transform based on section offset
  // 0 = Hero visible (translateY: 0)
  // 100 = Main visible (translateY: -100vh)
  const isTransitioning =
    state === "TRANSITIONING_TO_MAIN" ||
    state === "TRANSITIONING_TO_HERO" ||
    state === "SCROLLING_TO_FOOTER"

  return (
    <main className={styles.container}>
      <Header buttonText={headerButtonText} />

      <div
        className={styles.sectionsWrapper}
        style={{
          transform: `translateY(-${sectionOffset}vh)`,
          transition: isTransitioning
            ? "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
            : "none",
        }}
      >
        <div className={styles.section}>
          <Hero heroTitle={heroTitle} services={services} />
        </div>
        <div className={styles.section}>
          <Main mainSectionTitle={mainSectionTitle} footerProps={footerProps} />
        </div>
      </div>
    </main>
  )
}

export function HomeClient(props: HomeClientProps) {
  return (
    <ScrollControllerProvider>
      <PageContent {...props} />
    </ScrollControllerProvider>
  )
}
