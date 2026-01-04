import type React from "react"
/* ===========================================
   Global TypeScript Types
   =========================================== */

// Component base props
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

// Common UI element props
export interface BoxProps extends BaseComponentProps {
  as?: React.ElementType
}
