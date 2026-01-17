"use client"

import { useEffect, useRef, useCallback } from "react"
import styles from "./Hero.module.css"
import { Card } from "./Cards"
import { GlassmorphicOverlay } from "../GlassmorphicOverlay"
import { useScrollController } from "@/context"

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

// AI Automation cards data
const cardsData = [
  {
    title: "Order Booker AI Assistant",
    description: "Automate order management and customer inquiries with intelligent conversational AI"
  },
  {
    title: "AI Lead Qualification System",
    description: "Qualify leads automatically and prioritize high-value prospects for your sales team"
  },
  {
    title: "Customer Support AI Agent",
    description: "24/7 intelligent customer support that learns from your business context"
  },
  {
    title: "Invoice Processing Automation",
    description: "Extract, validate, and process invoices automatically with AI precision"
  },
  {
    title: "CRM Sync & Cleanup Automation",
    description: "Keep your CRM data clean and synchronized across all business systems"
  },
  {
    title: "Data Intelligence Engine",
    description: "Transform raw data into actionable insights with AI-powered analytics"
  }
]

const columnConfig = [
  { direction: -1 }, // Column 1: moves up
  { direction: 1 }, // Column 2: moves down
]

export function Hero() {
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

  // Reset function - resets orb position and progress visuals
  const resetHeroState = useCallback(() => {
    progressRef.current = 0
    if (orbRef.current) {
      orbRef.current.style.transform = calculateOrbPosition(0)
    }
    if (fillRef.current) {
      fillRef.current.style.height = "0%"
    }
    scrollVelocityRef.current = 0
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
    const newProgress = progressRef.current + velocity * 0.2
    const clampedProgress = Math.max(0, Math.min(100, newProgress))
    
    // Update local ref
    progressRef.current = clampedProgress
    
    // Update controller
    setProgress(clampedProgress)

    const now = performance.now()
    if (now - lastUpdateRef.current < 16.67) return
    lastUpdateRef.current = now

    orbRef.current.style.transform = calculateOrbPosition(clampedProgress)

    if (fillRef.current) {
      fillRef.current.style.height = `${clampedProgress}%`
    }
  }, [setProgress])

  useEffect(() => {
    if (!heroRef.current) return

    const columnHeights: number[] = []

    columnRefs.current.forEach((columnInner, index) => {
      if (!columnInner) return
      const halfHeight = columnInner.scrollHeight / 2
      columnHeights[index] = halfHeight

      // Set initial position - columns going up start at 0, columns going down start at -halfHeight
      const config = columnConfig[index]
      if (config.direction === -1) {
        positionsRef.current[index] = 0
      } else {
        positionsRef.current[index] = -halfHeight
      }
    })

    const baseSpeed = 0.5

    const animate = () => {
      columnRefs.current.forEach((columnInner, index) => {
        if (!columnInner || pausedRef.current[index]) return

        const config = columnConfig[index]
        const halfHeight = columnHeights[index]
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
      // Ask controller if Hero should process this scroll
      const shouldProcess = handleHeroScroll(e.deltaY)
      
      if (!shouldProcess) {
        // Don't process scroll - we're transitioning or blocked
        return
      }
      
      // Only affect card columns in HERO_SCROLLING state
      if (state === "HERO_SCROLLING") {
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
  }, [handleScrollVelocity, handleHeroScroll, state])

  const handleColumnMouseEnter = (index: number) => {
    pausedRef.current[index] = true
  }

  const handleColumnMouseLeave = (index: number) => {
    pausedRef.current[index] = false
  }

  return (
    <div className={styles.heroWrapper}>
      {/* Bleeding orb - contained within hero wrapper */}
      <div className={styles.bleedingOrb} ref={orbRef} />
      
      {/* Glassmorphic overlay - covers full viewport but contained in wrapper */}
      <GlassmorphicOverlay heroRef={heroRef} />
      
      {/* Progress capsule - contained within hero wrapper */}
      <div className={styles.progressCapsule}>
        <div className={styles.progressFill} ref={fillRef} />
      </div>
      
      <section className={styles.hero} data-hero ref={heroRef}>
        <div className={styles.heroLeft}>
          <h1 className={styles.heroTitle}>Welcome to Our Agency</h1>
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
                  const card = cardsData[cardIndex]
                  return (
                    <Card
                      key={`orig-${rowIndex}`}
                      title={card.title}
                      description={card.description}
                    />
                  )
                })}
                {/* Duplicated cards for seamless loop */}
                {[0, 1, 2].map((rowIndex) => {
                  const cardIndex = colIndex * 3 + rowIndex
                  const card = cardsData[cardIndex]
                  return (
                    <Card
                      key={`dup-${rowIndex}`}
                      title={card.title}
                      description={card.description}
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
