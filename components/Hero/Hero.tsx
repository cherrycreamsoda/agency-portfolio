"use client"

import { useEffect, useRef } from "react"
import styles from "./Hero.module.css"
import { Card } from "./Cards"

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
  const heroRef = useRef<HTMLElement>(null)
  const columnRefs = useRef<(HTMLDivElement | null)[]>([])
  const positionsRef = useRef<number[]>([0, 0])
  const pausedRef = useRef<boolean[]>([false, false])
  const scrollVelocityRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)

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
      scrollVelocityRef.current += e.deltaY * 0.015
    }

    window.addEventListener("wheel", handleWheel, { passive: true })

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      window.removeEventListener("wheel", handleWheel)
    }
  }, [])

  const handleColumnMouseEnter = (index: number) => {
    pausedRef.current[index] = true
  }

  const handleColumnMouseLeave = (index: number) => {
    pausedRef.current[index] = false
  }

  return (
    <section className={styles.hero} data-hero ref={heroRef}>
      <div className={styles.headerBar} />
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
  )
}
