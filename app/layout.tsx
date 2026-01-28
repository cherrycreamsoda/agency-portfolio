import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { getSeoConfig } from "@/lib/seo"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export async function generateMetadata(): Promise<Metadata> {
  const seoConfig = await getSeoConfig()

  // Provide defaults if database is not seeded yet
  const seo = seoConfig || {
    title: "Agency Portfolio Landing Page",
    description: "A beautiful Agency landing page with color bleeding effect",
    keywords: ["AI", "automation", "agency", "portfolio"],
    metadataBase: "https://yourdomain.com",
    ogImage: "/og-image.jpg",
    ogType: "website",
    twitterHandle: "",
    twitterCard: "summary_large_image",
    robots: {
      index: true,
      follow: true,
    },
  }

  const metadataBase = seo.metadataBase
    ? new URL(seo.metadataBase)
    : undefined

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    metadataBase,
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: seo.ogType as "website",
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
    twitter: {
      card: seo.twitterCard as "summary_large_image" | "summary",
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [seo.ogImage] : undefined,
      creator: seo.twitterHandle || undefined,
    },
    robots: seo.robots,
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
