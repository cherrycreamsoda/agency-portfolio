"use client"

import Link from "next/link"
import type { ServiceDTO } from "@/types/database"

interface BuyPageClientProps {
  service: ServiceDTO | null
  serviceSlug?: string
}

export function BuyPageClient({ service, serviceSlug }: BuyPageClientProps) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#31302b",
        color: "#e3e3e3",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "inherit",
        padding: "2rem",
      }}
    >
      <Link
        href="/"
        style={{
          position: "absolute",
          top: "2rem",
          left: "2rem",
          color: "#e3e3e3",
          textDecoration: "none",
          opacity: 0.7,
          transition: "opacity 0.2s",
        }}
      >
        &larr; Back to Home
      </Link>

      <h1 style={{ fontSize: 40, fontWeight: 700, marginBottom: 24 }}>
        Buy Service
      </h1>

      {service ? (
        <div
          style={{
            maxWidth: "600px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: 28,
              fontWeight: 600,
              marginBottom: 16,
              color: "#fff",
            }}
          >
            {service.title}
          </h2>
          <p
            style={{
              fontSize: 18,
              marginBottom: 32,
              opacity: 0.8,
              lineHeight: 1.6,
            }}
          >
            {service.description}
          </p>
          <button
            style={{
              background: "#e3e3e3",
              color: "#31302b",
              border: "none",
              padding: "1rem 2rem",
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 8,
              cursor: "pointer",
              transition: "transform 0.2s, opacity 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9"
              e.currentTarget.style.transform = "scale(1.02)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1"
              e.currentTarget.style.transform = "scale(1)"
            }}
          >
            Request Quote
          </button>
        </div>
      ) : (
        <p style={{ fontSize: 24, marginTop: 0, letterSpacing: 0.5 }}>
          {serviceSlug
            ? `Service "${serviceSlug}" not found.`
            : "No service selected."}
        </p>
      )}
    </main>
  )
}
