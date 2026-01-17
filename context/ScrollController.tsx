"use client"

import React, { createContext, useContext, useRef, useCallback, useState, useEffect } from "react"

// Scroll state machine states
export type ScrollState = 
  | "HERO_SCROLLING"      // User is on Hero, scrolling fills progress
  | "HERO_READY"          // Progress hit 100%, waiting for trigger scroll
  | "TRANSITIONING_TO_MAIN" // Animating Hero away, all scroll blocked
  | "MAIN_SCROLLING"      // User is on Main, free scrolling
  | "TRANSITIONING_TO_HERO" // Animating back to Hero, all scroll blocked

interface ScrollControllerContextType {
  // Current state
  state: ScrollState
  
  // Progress value (0-100)
  progress: number
  
  // Called by Hero to report progress changes
  setProgress: (progress: number) => void
  
  // Called by Hero when a scroll event occurs (for state transitions)
  handleHeroScroll: (deltaY: number) => boolean // Returns true if Hero should process the scroll
  
  // Called by Main when user tries to scroll up at the top
  handleMainScrollAtTop: (deltaY: number) => boolean // Returns true if Main should process the scroll
  
  // Section offset for CSS transform (0 = Hero visible, 100 = Main visible)
  sectionOffset: number
  
  // Reset Hero progress (called after transition to Main)
  resetHeroProgress: () => void
  
  // Ref for external reset function from Hero
  heroResetRef: React.MutableRefObject<(() => void) | null>
}

const ScrollControllerContext = createContext<ScrollControllerContextType | null>(null)

export function useScrollController() {
  const context = useContext(ScrollControllerContext)
  if (!context) {
    throw new Error("useScrollController must be used within ScrollControllerProvider")
  }
  return context
}

interface ScrollControllerProviderProps {
  children: React.ReactNode
}

export function ScrollControllerProvider({ children }: ScrollControllerProviderProps) {
  const [state, setState] = useState<ScrollState>("HERO_SCROLLING")
  const [progress, setProgressState] = useState(0)
  const [sectionOffset, setSectionOffset] = useState(0) // 0 = Hero, 100 = Main
  
  // Ref for Hero's reset function
  const heroResetRef = useRef<(() => void) | null>(null)
  
  // Ref to track Main section scroll position
  const mainScrollTopRef = useRef(0)
  
  // Transition animation duration
  const TRANSITION_DURATION = 800 // ms

  // Set progress from Hero
  const setProgress = useCallback((newProgress: number) => {
    const clampedProgress = Math.max(0, Math.min(100, newProgress))
    setProgressState(clampedProgress)
    
    // Check if we hit 100% for the first time
    if (clampedProgress >= 100 && state === "HERO_SCROLLING") {
      setState("HERO_READY")
    }
  }, [state])

  // Handle scroll events from Hero
  const handleHeroScroll = useCallback((deltaY: number): boolean => {
    // Only process scroll in certain states
    if (state === "HERO_SCROLLING") {
      // Normal Hero scrolling - let Hero process it
      return true
    }
    
    if (state === "HERO_READY") {
      // At 100%, waiting for trigger scroll
      if (deltaY > 0) {
        // Scrolling down - trigger transition to Main
        setState("TRANSITIONING_TO_MAIN")
        
        // Animate section offset to 100 (Main visible)
        setSectionOffset(100)
        
        // After transition completes, switch to Main scrolling
        setTimeout(() => {
          // Reset Hero progress
          setProgressState(0)
          if (heroResetRef.current) {
            heroResetRef.current()
          }
          setState("MAIN_SCROLLING")
        }, TRANSITION_DURATION)
        
        return false // Don't let Hero process this scroll
      } else {
        // Scrolling up - allow it to decrease progress, switch back to HERO_SCROLLING
        setState("HERO_SCROLLING")
        return true
      }
    }
    
    // Block scroll during transitions
    if (state === "TRANSITIONING_TO_MAIN" || state === "TRANSITIONING_TO_HERO") {
      return false
    }
    
    // In Main state, Hero shouldn't receive scrolls
    if (state === "MAIN_SCROLLING") {
      return false
    }
    
    return false
  }, [state])

  // Handle scroll from Main section (when at top and scrolling up)
  const handleMainScrollAtTop = useCallback((deltaY: number): boolean => {
    if (state !== "MAIN_SCROLLING") {
      return false
    }
    
    // Only trigger return to Hero when scrolling up at the top
    if (deltaY < 0) {
      // Scrolling up at top of Main - transition back to Hero
      setState("TRANSITIONING_TO_HERO")
      
      // Animate section offset back to 0 (Hero visible)
      setSectionOffset(0)
      
      // After transition completes, switch to Hero scrolling
      setTimeout(() => {
        setState("HERO_SCROLLING")
      }, TRANSITION_DURATION)
      
      return false // Block this scroll
    }
    
    return true // Normal Main scrolling
  }, [state])

  // Reset Hero progress
  const resetHeroProgress = useCallback(() => {
    setProgressState(0)
    if (heroResetRef.current) {
      heroResetRef.current()
    }
  }, [])

  const value: ScrollControllerContextType = {
    state,
    progress,
    setProgress,
    handleHeroScroll,
    handleMainScrollAtTop,
    sectionOffset,
    resetHeroProgress,
    heroResetRef,
  }

  return (
    <ScrollControllerContext.Provider value={value}>
      {children}
    </ScrollControllerContext.Provider>
  )
}
