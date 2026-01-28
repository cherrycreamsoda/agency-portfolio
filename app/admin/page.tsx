import { getSiteConfig } from "@/lib/config"
import { getSeoConfig } from "@/lib/seo"
import { getAllServices } from "@/lib/services"
import { AdminClient } from "./admin-client"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const [siteConfig, seoConfig, services] = await Promise.all([
    getSiteConfig(),
    getSeoConfig(),
    getAllServices(),
  ])

  // Provide defaults if database is not seeded yet
  const defaultSiteConfig = {
    siteName: "Agency",
    heroTitle: "Welcome to Our Agency",
    contactEmail: "hello@agency.com",
    footerTitle: "Let's Work Together",
    footerSubtitle: "Have a project in mind? Let's make it happen.",
    copyrightText: "© 2026 Agency. All rights reserved.",
    headerButtonText: "Contact Us",
    mainSectionTitle: "Main Section",
    updatedAt: new Date(),
  }

  const defaultSeoConfig = {
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
    updatedAt: new Date(),
  }

  return (
    <AdminClient
      initialSiteConfig={siteConfig || defaultSiteConfig}
      initialSeoConfig={seoConfig || defaultSeoConfig}
      initialServices={services}
    />
  )
}
