"use client"

import { useEffect, useRef, useCallback } from "react"
import styles from "./Hero.module.css"
import { Card } from "./Cards"
import { GlassmorphicOverlay } from "../GlassmorphicOverlay"
import { useScrollController } from "@/context"
import type { ServiceDTO } from "@/types/database"

// Optimized position calculation for orb
const calculateOrbPosition = (progress: number): string => {
  const p = progress < 0 ? 0 : progress > 100 ? 100 : progress

  let y: number, x: number

  if (p <= 50) {
    const t = p * 0.02
    y = t * 50
    x = 0
  } else {
    const t = (p - 50) * 0.02
    y = 50 + t * 5
    x = -t * 35
  }

  const ry = Math.round(y * 10) * 0.1
  const rx = Math.round(x * 10) * 0.1

  return `translate(${rx}%, ${ry}%)`
}

const columnConfig = [
  { direction: -1 }, // Column 1: moves up
  { direction: 1 }, // Column 2: moves down
]

export interface HeroProps {
  heroTitle: string
  services: ServiceDTO[]
}

export function Hero({ heroTitle, services }: HeroProps) {
  const { state, setProgress, handleHeroScroll, heroResetRef, progress } = useScrollController()
  
  const heroRef = useRef<HTMLElement>(null)
  const columnRefs = useRef<(HTMLDivElement | null)[]>([])
  const positionsRef = useRef<number[]>([0, 0])
  const pausedRef = useRef<boolean[]>([false, false])
  const scrollVelocityRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)
  const lastScrollCallTimeRef = useRef<number>(0)
  
  // Orb and progress refs
  const orbRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<number>(0)
  const lastUpdateRef = useRef<number>(0)
  
  // State ref to avoid effect re-runs when state changes
  const stateRef = useRef<typeof state>(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Reset function - resets orb position and progress visuals
  // Note: We don't reset scrollVelocity here to preserve momentum during transitions
  const resetHeroState = useCallback(() => {
    progressRef.current = 0
    if (orbRef.current) {
      orbRef.current.style.transform = calculateOrbPosition(0)
    }
    if (fillRef.current) {
      fillRef.current.style.height = "0%"
    }
    // Don't reset scrollVelocityRef here - preserve momentum
  }, [])

  // Register reset function with controller
  useEffect(() => {
    heroResetRef.current = resetHeroState
    return () => {
      heroResetRef.current = null
    }
  }, [heroResetRef, resetHeroState])

  // Sync visual state with controller progress
  useEffect(() => {
    if (orbRef.current) {
      orbRef.current.style.transform = calculateOrbPosition(progress)
    }
    if (fillRef.current) {
      fillRef.current.style.height = `${progress}%`
    }
    progressRef.current = progress
  }, [progress])

  const handleScrollVelocity = useCallback((velocity: number) => {
    if (!orbRef.current) return
    
    // Calculate new progress
    const newProgress = progressRef.current + velocity * 0.5
    const clampedProgress = Math.max(0, Math.min(100, newProgress))
    
    // Update local ref
    progressRef.current = clampedProgress

    const now = performance.now()
    if (now - lastUpdateRef.current < 16.67) return
    lastUpdateRef.current = now

    // Update visuals directly (no React state update here)
    orbRef.current.style.transform = calculateOrbPosition(clampedProgress)

    if (fillRef.current) {
      fillRef.current.style.height = `${clampedProgress}%`
    }

    // Sync context state less frequently (every 100ms instead of every frame)
    if (now - lastUpdateRef.current >= 100 || clampedProgress === 0 || clampedProgress === 100) {
      setProgress(clampedProgress)
    }
  }, [setProgress])

  // Track if columns have been initialized (prevents reset on re-render)
  const columnsInitializedRef = useRef(false)
  const columnHeightsRef = useRef<number[]>([])

  useEffect(() => {
    if (!heroRef.current) return

    // Only initialize column positions once
    if (!columnsInitializedRef.current) {
      columnRefs.current.forEach((columnInner, index) => {
        if (!columnInner) return
        const halfHeight = columnInner.scrollHeight / 2
        columnHeightsRef.current[index] = halfHeight

        // Set initial position - columns going up start at 0, columns going down start at -halfHeight
        const config = columnConfig[index]
        if (config.direction === -1) {
          positionsRef.current[index] = 0
        } else {
          positionsRef.current[index] = -halfHeight
        }
      })
      columnsInitializedRef.current = true
    }

    const baseSpeed = 0.5

    const animate = () => {
      columnRefs.current.forEach((columnInner, index) => {
        if (!columnInner || pausedRef.current[index]) return

        const config = columnConfig[index]
        const halfHeight = columnHeightsRef.current[index]
        if (!halfHeight) return

        // Base movement + scroll influence (opposite direction)
        const scrollInfluence = scrollVelocityRef.current * config.direction * -1 * 2.5
        const movement = config.direction * baseSpeed + scrollInfluence

        positionsRef.current[index] += movement

        if (config.direction === -1) {
          // Moving up: when position goes below -halfHeight, wrap to 0
          if (positionsRef.current[index] <= -halfHeight) {
            positionsRef.current[index] += halfHeight
          }
          // If scroll pushes it positive, wrap to negative
          if (positionsRef.current[index] > 0) {
            positionsRef.current[index] -= halfHeight
          }
        } else {
          // Moving down: when position goes above 0, wrap to -halfHeight
          if (positionsRef.current[index] >= 0) {
            positionsRef.current[index] -= halfHeight
          }
          // If scroll pushes it too negative, wrap up
          if (positionsRef.current[index] < -halfHeight) {
            positionsRef.current[index] += halfHeight
          }
        }

        columnInner.style.transform = `translateY(${positionsRef.current[index]}px)`
      })

      scrollVelocityRef.current *= 0.92

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    const handleWheel = (e: WheelEvent) => {
      const currentState = stateRef.current
      
      // During TRANSITIONING_TO_HERO, accumulate scroll velocity but don't process
      // This preserves momentum so when Hero becomes active, it continues smoothly
      if (currentState === "TRANSITIONING_TO_HERO") {
        scrollVelocityRef.current += e.deltaY * 0.015
        return
      }
      
      // During TRANSITIONING_TO_MAIN, reset velocity and block
      // Main will handle accumulating scroll for its native scrolling
      if (currentState === "TRANSITIONING_TO_MAIN") {
        scrollVelocityRef.current = 0
        return
      }
      
      // Ask controller if Hero should process this scroll
      const shouldProcess = handleHeroScroll(e.deltaY)
      
      if (!shouldProcess) {
        // Don't process scroll - blocked for other reasons
        return
      }
      
      // Affect card columns in HERO_SCROLLING or HERO_READY state
      if (currentState === "HERO_SCROLLING" || currentState === "HERO_READY") {
        scrollVelocityRef.current += e.deltaY * 0.015
      }
      
      // Throttle scroll callback to 16.67ms (60fps) for optimal performance
      const now = performance.now()
      if (now - lastScrollCallTimeRef.current >= 16.67) {
        lastScrollCallTimeRef.current = now
        handleScrollVelocity(scrollVelocityRef.current)
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: true })

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      window.removeEventListener("wheel", handleWheel)
    }
  }, [handleScrollVelocity, handleHeroScroll])

  const handleColumnMouseEnter = (index: number) => {
    pausedRef.current[index] = true
  }

  const handleColumnMouseLeave = (index: number) => {
    pausedRef.current[index] = false
  }

  // Ensure we have at least 6 services for the two columns
  const displayServices = services.length >= 6 ? services : [...services, ...services].slice(0, 6)

  return (
    <div className={styles.heroWrapper}>
      {/* Bleeding orb - contained within hero wrapper */}
      <div className={styles.bleedingOrb} ref={orbRef} />
      
      {/* Glassmorphic overlay - covers full viewport but contained in wrapper */}
      <GlassmorphicOverlay heroRef={heroRef} />
      
      {/* Progress capsule - contained within hero wrapper */}
      <section className={styles.hero} data-hero ref={heroRef}>
        <div className={styles.heroLeft}>
          <h1 className={styles.heroTitle}>{heroTitle}</h1>
          
          {/* Scroll label - positioned to the left of progress capsule */}
          <div className={styles.scrollLabel}>Scroll</div>
          
          {/* Progress capsule - positioned at bottom-right of heroLeft */}
          <div className={styles.progressCapsule}>
            <div className={styles.progressFill} ref={fillRef} />
          </div>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.columnsWrapper}>
            {[0, 1].map((colIndex) => (
              <div
                key={colIndex}
                className={styles.column}
                onMouseEnter={() => handleColumnMouseEnter(colIndex)}
                onMouseLeave={() => handleColumnMouseLeave(colIndex)}
              >
                <div
                  className={styles.columnInner}
                  ref={(el) => {
                    columnRefs.current[colIndex] = el
                  }}
                >
                  {/* Original cards - 3 cards per column */}
                  {[0, 1, 2].map((rowIndex) => {
                    const cardIndex = colIndex * 3 + rowIndex
                    const service = displayServices[cardIndex]
                    if (!service) return null
                    return (
                      <Card
                        key={`orig-${rowIndex}`}
                        title={service.title}
                        description={service.description}
                        href={`/buy?service=${encodeURIComponent(service.slug)}`}
                        icon={null}
                      />
                    )
                  })}
                  {/* Duplicated cards for seamless loop */}
                  {[0, 1, 2].map((rowIndex) => {
                    const cardIndex = colIndex * 3 + rowIndex
                    const service = displayServices[cardIndex]
                    if (!service) return null
                    return (
                      <Card
                        key={`dup-${rowIndex}`}
                        title={service.title}
                        description={service.description}
                        href={`/buy?service=${encodeURIComponent(service.slug)}`}
                        icon={null}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
