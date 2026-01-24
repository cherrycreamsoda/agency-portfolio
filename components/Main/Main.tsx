"use client"

import { useRef, useEffect } from "react"
import styles from "./Main.module.css"
import { useScrollController } from "@/context"
import { Footer } from "@/components"

// Generate 50 lines of sample text
const sampleLines = Array.from({ length: 50 }, (_, i) => 
  `Line ${i + 1}: This is sample content for the Main section. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`
)

export function Main() {
  const { state, handleMainScrollAtTop, mainRef } = useScrollController()
  const localMainRef = useRef<HTMLElement>(null)
  const isAtTopRef = useRef(true)
  
  // Sync the local ref with context mainRef
  useEffect(() => {
    mainRef.current = localMainRef.current
    return () => {
      mainRef.current = null
    }
  }, [mainRef])
  
  // Momentum for TRANSITIONING_TO_MAIN only
  const scrollVelocityRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  // Ref to track state without effect re-running
  const stateRef = useRef(state)
  const prevStateRef = useRef(state)
  
  useEffect(() => {
    const prevState = prevStateRef.current
    stateRef.current = state
    prevStateRef.current = state
    
    // Reset Main scroll position when transitioning from Hero
    if (prevState !== "TRANSITIONING_TO_MAIN" && state === "TRANSITIONING_TO_MAIN") {
      const mainElement = localMainRef.current
      if (mainElement) {
        mainElement.scrollTop = 0
        isAtTopRef.current = true
        scrollVelocityRef.current = 0
      }
    }
    
    // When entering MAIN_SCROLLING, clear momentum (native scroll takes over)
    if (prevState === "TRANSITIONING_TO_MAIN" && state === "MAIN_SCROLLING") {
      scrollVelocityRef.current = 0
    }
  }, [state])

  // Momentum animation - ONLY during transition
  useEffect(() => {
    const mainElement = localMainRef.current
    if (!mainElement) return

    const animate = () => {
      const currentState = stateRef.current
      
      // Only apply custom momentum during transition (not MAIN_SCROLLING)
      if (currentState === "TRANSITIONING_TO_MAIN") {
        if (Math.abs(scrollVelocityRef.current) > 0.1) {
          mainElement.scrollTop += scrollVelocityRef.current
          isAtTopRef.current = mainElement.scrollTop <= 0
          scrollVelocityRef.current *= 0.92
        } else {
          scrollVelocityRef.current = 0
        }
      }
      
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    // Window-level wheel handler for transition momentum
    const handleWindowWheel = (e: WheelEvent) => {
      const currentState = stateRef.current
      
      // During transition, accumulate momentum (native scroll is blocked)
      if (currentState === "TRANSITIONING_TO_MAIN") {
        scrollVelocityRef.current += e.deltaY * 0.15
      }
    }

    window.addEventListener("wheel", handleWindowWheel, { passive: true })

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      window.removeEventListener("wheel", handleWindowWheel)
    }
  }, [])

  // Element-level handler for MAIN_SCROLLING state (native scroll)
  useEffect(() => {
    const mainElement = localMainRef.current
    if (!mainElement) return

    const handleScroll = () => {
      isAtTopRef.current = mainElement.scrollTop <= 0
    }

    const handleWheel = (e: WheelEvent) => {
      const currentState = stateRef.current
      
      // Block during transitions
      if (currentState === "TRANSITIONING_TO_MAIN" || currentState === "TRANSITIONING_TO_HERO") {
        e.preventDefault()
        return
      }
      
      // During MAIN_SCROLLING - let native scroll happen, but check for Hero transition
      if (currentState === "MAIN_SCROLLING") {
        if (isAtTopRef.current && e.deltaY < 0) {
          handleMainScrollAtTop(e.deltaY)
          e.preventDefault()
        }
        // Otherwise, native scroll handles it
      }
    }

    mainElement.addEventListener("scroll", handleScroll, { passive: true })
    mainElement.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      mainElement.removeEventListener("scroll", handleScroll)
      mainElement.removeEventListener("wheel", handleWheel)
    }
  }, [handleMainScrollAtTop])

  return (
    <section className={styles.main} ref={localMainRef}>
      <div className={styles.content}>
        <h2 className={styles.title}>Main Section</h2>
        {sampleLines.map((line, index) => (
          <p key={index} className={styles.paragraph}>
            {line}
          </p>
        ))}
      </div>
        <Footer />
    </section>
  )
}
