"use client"

import styles from "./page.module.css"
import { Hero, GlassmorphicOverlay, Header } from "@/components"
import { useRef, useCallback } from "react"

// Optimized position calculation - moved outside component to avoid recreation
// Uses fast math: single division, conditional branches, rounding to 1 decimal
const calculateOrbPosition = (progress: number): string => {
  // Clamp to 0-100
  const p = progress < 0 ? 0 : progress > 100 ? 100 : progress

  let y: number, x: number

  if (p <= 50) {
    // First half: move down 50vh
    const t = p * 0.02 // Faster than /50
    y = t * 50
    x = 0
  } else {
    // Second half: move left 35vw, slight additional downward
    const t = (p - 50) * 0.02 // Faster than /50
    y = 50 + t * 5
    x = -t * 35
  }

  // Round to 1 decimal place for balance between smoothness and performance
  const ry = Math.round(y * 10) * 0.1
  const rx = Math.round(x * 10) * 0.1

  return `translate(${rx}vw, ${ry}vh)`
}

export default function Home() {
  const orbRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<number>(0)
  const lastUpdateRef = useRef<number>(0)

  const handleScrollVelocity = useCallback((velocity: number) => {
    if (!orbRef.current) return

    // Accumulate progress (velocity multiplier optimized)
    progressRef.current += velocity * 0.2

    // Fast clamp without Math.max/Math.min
    if (progressRef.current < 0) progressRef.current = 0
    if (progressRef.current > 100) progressRef.current = 100

    // Throttle DOM updates to 60fps (16.67ms)
    const now = performance.now()
    if (now - lastUpdateRef.current < 16.67) return
    lastUpdateRef.current = now

    // Single DOM update with pre-calculated string
    orbRef.current.style.transform = calculateOrbPosition(progressRef.current)

    // Update progress fill height (fast integer operation)
    if (fillRef.current) {
      fillRef.current.style.height = `${progressRef.current}%`
    }
  }, [])

  return (
    <main className={styles.container}>
      <div className={styles.bleedingOrb} ref={orbRef} />
      <GlassmorphicOverlay cutoutSelector="[data-hero]" />
      <Header />
      
      {/* Progress Indicator - tied to orb progress */}
      <div className={styles.progressCapsule}>
        <div className={styles.progressFill} ref={fillRef} />
      </div>
      
      <div className={styles.content}>
        <Hero onScrollVelocity={handleScrollVelocity} />
      </div>
    </main>
  )
}
