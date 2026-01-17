"use client"

import { useRef, useEffect } from "react"
import styles from "./Main.module.css"
import { useScrollController } from "@/context"

// Generate 50 lines of sample text
const sampleLines = Array.from({ length: 50 }, (_, i) => 
  `Line ${i + 1}: This is sample content for the Main section. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`
)

export function Main() {
  const { state, handleMainScrollAtTop } = useScrollController()
  const mainRef = useRef<HTMLElement>(null)
  const isAtTopRef = useRef(true)

  useEffect(() => {
    const mainElement = mainRef.current
    if (!mainElement) return

    const handleScroll = () => {
      // Track if we're at the top of the Main section
      isAtTopRef.current = mainElement.scrollTop <= 0
    }

    const handleWheel = (e: WheelEvent) => {
      // Only handle wheel events when in MAIN_SCROLLING state
      if (state !== "MAIN_SCROLLING") {
        e.preventDefault()
        return
      }

      // If at top and scrolling up, try to transition back to Hero
      if (isAtTopRef.current && e.deltaY < 0) {
        const shouldProcess = handleMainScrollAtTop(e.deltaY)
        if (!shouldProcess) {
          e.preventDefault()
        }
      }
      // Otherwise, let natural scrolling happen
    }

    mainElement.addEventListener("scroll", handleScroll, { passive: true })
    mainElement.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      mainElement.removeEventListener("scroll", handleScroll)
      mainElement.removeEventListener("wheel", handleWheel)
    }
  }, [state, handleMainScrollAtTop])

  return (
    <section className={styles.main} ref={mainRef}>
      <div className={styles.content}>
        <h2 className={styles.title}>Main Section</h2>
        {sampleLines.map((line, index) => (
          <p key={index} className={styles.paragraph}>
            {line}
          </p>
        ))}
      </div>
    </section>
  )
}
