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
  
  // Custom momentum scroll system (same approach as Hero)
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
      const mainElement = mainRef.current
      if (mainElement) {
        mainElement.scrollTop = 0
        isAtTopRef.current = true
      }
    }
  }, [state])

  // Momentum-based scroll animation loop
  useEffect(() => {
    const mainElement = mainRef.current
    if (!mainElement) return

    const animate = () => {
      const currentState = stateRef.current
      
      // Only apply velocity during MAIN_SCROLLING (not during transition)
      if (currentState === "MAIN_SCROLLING") {
        if (Math.abs(scrollVelocityRef.current) > 0.1) {
          mainElement.scrollTop += scrollVelocityRef.current
          
          // Update isAtTop
          isAtTopRef.current = mainElement.scrollTop <= 0
          
          // Decay velocity (same rate as Hero)
          scrollVelocityRef.current *= 0.92
        } else {
          scrollVelocityRef.current = 0
        }
      }
      
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    // Window-level wheel handler - captures all scroll events
    const handleWheel = (e: WheelEvent) => {
      const currentState = stateRef.current
      
      // During transition to Hero, reset velocity - Hero handles its own
      if (currentState === "TRANSITIONING_TO_HERO") {
        scrollVelocityRef.current = 0
        return
      }
      
      // During transition to Main, reset velocity (inertia reset from Hero)
      // Don't accumulate - scroll is paused during transition
      if (currentState === "TRANSITIONING_TO_MAIN") {
        scrollVelocityRef.current = 0
        return
      }
      
      // Only accumulate velocity during MAIN_SCROLLING
      if (currentState === "MAIN_SCROLLING") {
        scrollVelocityRef.current += e.deltaY * 0.15
        
        // Check for scroll-up at top to trigger transition back to Hero
        if (isAtTopRef.current && e.deltaY < 0) {
          handleMainScrollAtTop(e.deltaY)
        }
      }
    }

    const handleNativeScroll = () => {
      // Track if we're at the top of the Main section
      isAtTopRef.current = mainElement.scrollTop <= 0
    }

    window.addEventListener("wheel", handleWheel, { passive: true })
    mainElement.addEventListener("scroll", handleNativeScroll, { passive: true })

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      window.removeEventListener("wheel", handleWheel)
      mainElement.removeEventListener("scroll", handleNativeScroll)
    }
  }, [handleMainScrollAtTop])

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
