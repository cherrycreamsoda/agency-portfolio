"use client"

import { useRef, useCallback, useEffect, useState } from "react"
import styles from "./Header.module.css"
import { useScrollController } from "@/context"

export interface HeaderProps {
  buttonText: string
}

const FEEDTAPE_ANIMATION_DURATION = 300 // ms - must match CSS animation duration
const WAVE_ANIMATION_DURATION = 600 // ms for wave morph

// Easing function for smooth animation
const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// Generate path string from wave amplitude
const generateWavePath = (amplitude: number): string => {
  // 7 wave peaks across 140px width
  // Each segment is 20px wide, with control points at midpoints
  const points: string[] = ['M0,0']
  
  for (let i = 0; i < 7; i++) {
    const x1 = i * 20 + 10 // control point x
    const y1 = (i % 2 === 0 ? -1 : 1) * amplitude // alternating up/down
    const x2 = (i + 1) * 20 // end point x
    
    if (i === 0) {
      points.push(`Q${x1},${y1} ${x2},0`)
    } else {
      points.push(`T${x2},0`)
    }
  }
  
  return points.join(' ')
}

export function Header({ buttonText }: HeaderProps) {
  const { scrollToFooter } = useScrollController()
  const tapeRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const isAnimatingRef = useRef(false)
  const queueCountRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Wave animation state
  const waveAnimationRef = useRef<number | null>(null)
  const currentAmplitudeRef = useRef(0)
  const targetAmplitudeRef = useRef(0)
  const [isHovered, setIsHovered] = useState(false)

  // Animate wave morphing
  const animateWave = useCallback(() => {
    if (!pathRef.current) return
    
    const startAmplitude = currentAmplitudeRef.current
    const targetAmplitude = targetAmplitudeRef.current
    const startTime = performance.now()
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / WAVE_ANIMATION_DURATION, 1)
      const easedProgress = easeInOutCubic(progress)
      
      const currentAmplitude = startAmplitude + (targetAmplitude - startAmplitude) * easedProgress
      currentAmplitudeRef.current = currentAmplitude
      
      if (pathRef.current) {
        pathRef.current.setAttribute('d', generateWavePath(currentAmplitude))
      }
      
      if (progress < 1) {
        waveAnimationRef.current = requestAnimationFrame(animate)
      } else {
        waveAnimationRef.current = null
      }
    }
    
    // Cancel any existing animation
    if (waveAnimationRef.current) {
      cancelAnimationFrame(waveAnimationRef.current)
    }
    
    waveAnimationRef.current = requestAnimationFrame(animate)
  }, [])

  // Handle hover state changes for wave
  useEffect(() => {
    targetAmplitudeRef.current = isHovered ? 8 : 0
    animateWave()
  }, [isHovered, animateWave])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (waveAnimationRef.current) {
        cancelAnimationFrame(waveAnimationRef.current)
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
    }, FEEDTAPE_ANIMATION_DURATION + 20) // Small buffer for safety
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

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    triggerAnimation()
  }, [triggerAnimation])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    triggerAnimation()
  }, [triggerAnimation])

  const handleClick = useCallback(() => {
    scrollToFooter()
  }, [scrollToFooter])

  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerBar} />
      <div className={styles.orderButtonContainer}>
        <button 
          className={styles.orderButton}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          <div className={styles.feedtapeWrapper}>
            <div className={styles.feedtape} ref={tapeRef}>
              <span className={styles.feedtapeItem}>{buttonText}</span>
              <span className={styles.feedtapeItem}>{buttonText}</span>
              <span className={styles.feedtapeItem}>{buttonText}</span>
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
              ref={pathRef}
              className={styles.wavePath}
              d="M0,0 Q10,0 20,0 T40,0 T60,0 T80,0 T100,0 T120,0 T140,0"
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
