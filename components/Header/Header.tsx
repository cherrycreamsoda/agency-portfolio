"use client"

import { useRef, useCallback, useEffect } from "react"
import styles from "./Header.module.css"

const ANIMATION_DURATION = 300 // ms - must match CSS animation duration

export function Header() {
  const tapeRef = useRef<HTMLDivElement>(null)
  const isAnimatingRef = useRef(false)
  const queueCountRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const processAnimation = useCallback(() => {
    if (!tapeRef.current) return

    isAnimatingRef.current = true
    const tape = tapeRef.current

    // Reset any stuck state first
    tape.classList.remove(styles.animating)
    
    // Force reflow to ensure animation restarts
    void tape.offsetWidth

    // Add animating class to trigger CSS animation
    tape.classList.add(styles.animating)

    // Use timeout as the primary completion handler (more reliable than animationend)
    timeoutRef.current = setTimeout(() => {
      if (!tapeRef.current) return
      
      tape.classList.remove(styles.animating)
      
      // Move first child to the end (cycle the tape)
      const firstChild = tape.firstElementChild
      if (firstChild) {
        tape.appendChild(firstChild)
      }

      isAnimatingRef.current = false

      // Process next in queue if any
      if (queueCountRef.current > 0) {
        queueCountRef.current--
        // Use requestAnimationFrame to let DOM settle
        requestAnimationFrame(() => processAnimation())
      }
    }, ANIMATION_DURATION + 20) // Small buffer for safety
  }, [])

  const triggerAnimation = useCallback(() => {
    if (!tapeRef.current) return

    // If already animating, add to queue (max 2)
    if (isAnimatingRef.current) {
      if (queueCountRef.current < 2) {
        queueCountRef.current++
      }
      return
    }

    processAnimation()
  }, [processAnimation])

  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerBar} />
      <div className={styles.orderButtonContainer}>
        <button 
          className={styles.orderButton}
          onMouseEnter={triggerAnimation}
          onMouseLeave={triggerAnimation}
        >
          <div className={styles.feedtapeWrapper}>
            <div className={styles.feedtape} ref={tapeRef}>
              <span className={styles.feedtapeItem}>Contact Us</span>
              <span className={styles.feedtapeItem}>Contact Us</span>
              <span className={styles.feedtapeItem}>Contact Us</span>
            </div>
          </div>
        </button>
        <div className={styles.orderButtonLineWrapper}>
          <svg
            className={styles.orderButtonLine}
            viewBox="-4 -12 148 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className={styles.wavePath}
              d="M0,0 L140,0"
              fill="none"
              stroke="#c0c0c0"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
