"use client"

import { useEffect, useRef, RefObject } from "react"
import styles from "./GlassmorphicOverlay.module.css"

interface GlassmorphicOverlayProps {
  /** Ref to the hero element for positioning */
  heroRef: RefObject<HTMLElement | null>
}

export function GlassmorphicOverlay({ heroRef }: GlassmorphicOverlayProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const updateMask = () => {
      const heroElement = heroRef.current
      const svg = svgRef.current

      if (!heroElement || !svg) return

      // Get hero's position relative to viewport
      const heroRect = heroElement.getBoundingClientRect()
      
      // Full viewport dimensions
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Update SVG viewBox to cover full viewport
      svg.setAttribute("viewBox", `0 0 ${viewportWidth} ${viewportHeight}`)

      // Get the mask path element
      const maskPath = svg.querySelector("#cutout-path") as SVGPathElement
      if (!maskPath) return

      const r = 52

      // Hero bounds in viewport coordinates
      const left = heroRect.left
      const top = heroRect.top
      const right = heroRect.right
      const bottom = heroRect.bottom

      // Create path: outer rectangle (full viewport) with inner cutout (hero)
      // Top-left rounded, top-right sharp, bottom-right rounded, bottom-left sharp
      const path = `
        M 0 0
        L ${viewportWidth} 0
        L ${viewportWidth} ${viewportHeight}
        L 0 ${viewportHeight}
        Z
        M ${left + r} ${top}
        L ${right} ${top}
        L ${right} ${bottom - r}
        Q ${right} ${bottom} ${right - r} ${bottom}
        L ${left} ${bottom}
        L ${left} ${top + r}
        Q ${left} ${top} ${left + r} ${top}
        Z
      `

      maskPath.setAttribute("d", path)
    }

    // Initial update
    updateMask()

    // Update on resize
    window.addEventListener("resize", updateMask)

    return () => {
      window.removeEventListener("resize", updateMask)
    }
  }, [heroRef])

  return (
    <div className={styles.overlay}>
      <svg ref={svgRef} className={styles.maskSvg} preserveAspectRatio="none">
        <defs>
          <mask id="glassMask">
            <path id="cutout-path" fill="white" fillRule="evenodd" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(255, 255, 255, 0.15)" mask="url(#glassMask)" />
      </svg>
      <div className={styles.blurLayer} />
    </div>
  )
}
