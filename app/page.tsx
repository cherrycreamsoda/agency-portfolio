import { getSiteConfig } from "@/lib/config"
import { getActiveServices } from "@/lib/services"
import { HomeClient } from "./home-client"

export default async function Home() {
  // Fetch data from MongoDB
  const [siteConfig, services] = await Promise.all([
    getSiteConfig(),
    getActiveServices(),
  ])

  // Provide defaults if database is not seeded yet
  const config = siteConfig || {
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

  const defaultServices = [
    {
      title: "Order Booker AI Assistant",
      description: "Automate order management and customer inquiries with intelligent conversational AI.",
      slug: "order-booker-ai-assistant",
      icon: null,
      displayOrder: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "AI Lead Qualification System",
      description: "Qualify leads automatically and prioritize high-value prospects for your sales team.",
      slug: "ai-lead-qualification-system",
      icon: null,
      displayOrder: 2,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "Customer Support AI Agent",
      description: "24/7 intelligent customer support that learns from your business context.",
      slug: "customer-support-ai-agent",
      icon: null,
      displayOrder: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "Invoice Processing Automation",
      description: "Extract, validate, and process invoices automatically with AI precision.",
      slug: "invoice-processing-automation",
      icon: null,
      displayOrder: 4,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "CRM Sync & Cleanup Automation",
      description: "Keep your CRM data clean and synchronized across all business systems.",
      slug: "crm-sync-cleanup-automation",
      icon: null,
      displayOrder: 5,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "Data Intelligence Engine",
      description: "Transform raw data into actionable insights with AI-powered analytics.",
      slug: "data-intelligence-engine",
      icon: null,
      displayOrder: 6,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const activeServices = services.length > 0 ? services : defaultServices

  return (
    <HomeClient
      heroTitle={config.heroTitle}
      headerButtonText={config.headerButtonText}
      mainSectionTitle={config.mainSectionTitle}
      footerProps={{
        contactEmail: config.contactEmail,
        footerTitle: config.footerTitle,
        footerSubtitle: config.footerSubtitle,
        copyrightText: config.copyrightText,
      }}
      services={activeServices}
    />
  )
}
