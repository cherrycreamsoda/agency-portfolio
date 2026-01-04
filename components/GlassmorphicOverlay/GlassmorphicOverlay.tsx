"use client"

import { useEffect, useRef } from "react"
import styles from "./GlassmorphicOverlay.module.css"

interface GlassmorphicOverlayProps {
  /** CSS selector for the cutout element (e.g., '[data-hero]') */
  cutoutSelector: string
}

export function GlassmorphicOverlay({ cutoutSelector }: GlassmorphicOverlayProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const updateMask = () => {
      const cutoutElement = document.querySelector(cutoutSelector)
      const svg = svgRef.current

      if (!cutoutElement || !svg) return

      const rect = cutoutElement.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Update SVG viewBox
      svg.setAttribute("viewBox", `0 0 ${viewportWidth} ${viewportHeight}`)

      // Get the mask path element
      const maskPath = svg.querySelector("#cutout-path") as SVGPathElement
      if (!maskPath) return

      const r = 52

      // Top-left rounded, top-right sharp, bottom-right rounded, bottom-left sharp
      const path = `
        M 0 0
        L ${viewportWidth} 0
        L ${viewportWidth} ${viewportHeight}
        L 0 ${viewportHeight}
        Z
        M ${rect.left + r} ${rect.top}
        L ${rect.right} ${rect.top}
        L ${rect.right} ${rect.bottom - r}
        Q ${rect.right} ${rect.bottom} ${rect.right - r} ${rect.bottom}
        L ${rect.left} ${rect.bottom}
        L ${rect.left} ${rect.top + r}
        Q ${rect.left} ${rect.top} ${rect.left + r} ${rect.top}
        Z
      `

      maskPath.setAttribute("d", path)
    }

    // Initial update
    updateMask()

    // Update on resize
    window.addEventListener("resize", updateMask)

    // Update on scroll (in case of scrollable content)
    window.addEventListener("scroll", updateMask)

    return () => {
      window.removeEventListener("resize", updateMask)
      window.removeEventListener("scroll", updateMask)
    }
  }, [cutoutSelector])

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
