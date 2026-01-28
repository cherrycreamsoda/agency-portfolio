import { ObjectId } from "mongodb";

// ============================================
// Database Document Interfaces (with ObjectId)
// ============================================

export interface SiteConfig {
  _id?: ObjectId;
  siteName: string;
  heroTitle: string;
  contactEmail: string;
  footerTitle: string;
  footerSubtitle: string;
  copyrightText: string;
  headerButtonText: string;
  mainSectionTitle: string;
  updatedAt: Date;
}

export interface SeoConfig {
  _id?: ObjectId;
  title: string;
  description: string;
  keywords: string[];
  metadataBase: string;
  ogImage: string;
  ogType: string;
  twitterHandle: string;
  twitterCard: string;
  robots: {
    index: boolean;
    follow: boolean;
  };
  updatedAt: Date;
}

export interface Service {
  _id?: ObjectId;
  title: string;
  description: string;
  slug: string;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// DTO Interfaces (for API responses - serialized)
// These have string IDs instead of ObjectId
// ============================================

export interface SiteConfigDTO {
  id?: string;
  siteName: string;
  heroTitle: string;
  contactEmail: string;
  footerTitle: string;
  footerSubtitle: string;
  copyrightText: string;
  headerButtonText: string;
  mainSectionTitle: string;
  updatedAt: string; // ISO string for JSON serialization
}

export interface SeoConfigDTO {
  id?: string;
  title: string;
  description: string;
  keywords: string[];
  metadataBase: string;
  ogImage: string;
  ogType: string;
  twitterHandle: string;
  twitterCard: string;
  robots: {
    index: boolean;
    follow: boolean;
  };
  updatedAt: string;
}

export interface ServiceDTO {
  id?: string;
  title: string;
  description: string;
  slug: string;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Default Values (used for seeding & fallbacks)
// ============================================

export const DEFAULT_SITE_CONFIG: Omit<SiteConfig, "_id"> = {
  siteName: "Agency",
  heroTitle: "Welcome to Our Agency",
  contactEmail: "hello@agency.com",
  footerTitle: "Let's Work Together",
  footerSubtitle: "Have a project in mind? Let's make it happen.",
  copyrightText: "2026 Agency. All rights reserved.",
  headerButtonText: "Contact Us",
  mainSectionTitle: "Main Section",
  updatedAt: new Date(),
};

export const DEFAULT_SEO_CONFIG: Omit<SeoConfig, "_id"> = {
  title: "Agency Portfolio Landing Page",
  description: "A beautiful Agency landing page with color bleeding effect",
  keywords: ["AI", "automation", "agency", "portfolio", "services"],
  metadataBase: "https://yourdomain.com",
  ogImage: "/og-image.jpg",
  ogType: "website",
  twitterHandle: "@youragency",
  twitterCard: "summary_large_image",
  robots: {
    index: true,
    follow: true,
  },
  updatedAt: new Date(),
};

export const DEFAULT_SERVICES: Omit<Service, "_id">[] = [
  {
    title: "Order Booker AI Assistant",
    description:
      "Automate order management and customer inquiries with intelligent conversational AI.",
    slug: "order-booker-ai-assistant",
    icon: null,
    displayOrder: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "AI Lead Qualification System",
    description:
      "Qualify leads automatically and prioritize high-value prospects for your sales team.",
    slug: "ai-lead-qualification-system",
    icon: null,
    displayOrder: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Customer Support AI Agent",
    description:
      "24/7 intelligent customer support that learns from your business context.",
    slug: "customer-support-ai-agent",
    icon: null,
    displayOrder: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Invoice Processing Automation",
    description:
      "Extract, validate, and process invoices automatically with AI precision.",
    slug: "invoice-processing-automation",
    icon: null,
    displayOrder: 4,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "CRM Sync & Cleanup Automation",
    description:
      "Keep your CRM data clean and synchronized across all business systems.",
    slug: "crm-sync-cleanup-automation",
    icon: null,
    displayOrder: 5,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Data Intelligence Engine",
    description:
      "Transform raw data into actionable insights with AI-powered analytics.",
    slug: "data-intelligence-engine",
    icon: null,
    displayOrder: 6,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
