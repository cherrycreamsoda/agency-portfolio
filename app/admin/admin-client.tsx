"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import type { SiteConfigDTO, SeoConfigDTO, ServiceDTO } from "@/types/database"
import {
  updateSiteConfigAction,
  updateSeoConfigAction,
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
} from "./actions"
import styles from "./admin.module.css"

type TabType = "general" | "contact" | "seo" | "services"

interface AdminClientProps {
  initialSiteConfig: SiteConfigDTO
  initialSeoConfig: SeoConfigDTO
  initialServices: ServiceDTO[]
}

export function AdminClient({
  initialSiteConfig,
  initialSeoConfig,
  initialServices,
}: AdminClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("general")
  const [siteConfig, setSiteConfig] = useState(initialSiteConfig)
  const [seoConfig, setSeoConfig] = useState(initialSeoConfig)
  const [services, setServices] = useState(initialServices)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSiteConfigUpdate = (field: keyof SiteConfigDTO, value: string) => {
    setSiteConfig((prev) => ({ ...prev, [field]: value }))
  }

  const handleSeoConfigUpdate = (field: keyof SeoConfigDTO, value: string | string[] | { index: boolean; follow: boolean }) => {
    setSeoConfig((prev) => ({ ...prev, [field]: value }))
  }

  const saveSiteConfig = () => {
    startTransition(async () => {
      const result = await updateSiteConfigAction(siteConfig)
      if (result.success) {
        showMessage("success", "Site configuration saved successfully!")
      } else {
        showMessage("error", result.error || "Failed to save")
      }
    })
  }

  const saveSeoConfig = () => {
    startTransition(async () => {
      const result = await updateSeoConfigAction(seoConfig)
      if (result.success) {
        showMessage("success", "SEO configuration saved successfully!")
      } else {
        showMessage("error", result.error || "Failed to save")
      }
    })
  }

  const handleServiceUpdate = (id: string, field: keyof ServiceDTO, value: string | number | boolean) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    )
  }

  const saveService = (service: ServiceDTO) => {
    if (!service.id) return
    startTransition(async () => {
      const result = await updateServiceAction(service.id!, {
        title: service.title,
        description: service.description,
        slug: service.slug,
        icon: service.icon,
        displayOrder: service.displayOrder,
        isActive: service.isActive,
      })
      if (result.success) {
        showMessage("success", "Service saved successfully!")
      } else {
        showMessage("error", result.error || "Failed to save")
      }
    })
  }

  const handleDeleteService = (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return
    startTransition(async () => {
      const result = await deleteServiceAction(id)
      if (result.success) {
        setServices((prev) => prev.filter((s) => s.id !== id))
        showMessage("success", "Service deleted successfully!")
      } else {
        showMessage("error", result.error || "Failed to delete")
      }
    })
  }

  const handleCreateService = () => {
    const newService = {
      title: "New Service",
      description: "Service description",
      slug: `new-service-${Date.now()}`,
      icon: null,
      displayOrder: services.length + 1,
      isActive: true,
    }
    startTransition(async () => {
      const result = await createServiceAction(newService)
      if (result.success && result.service) {
        setServices((prev) => [...prev, result.service!])
        showMessage("success", "Service created successfully!")
      } else {
        showMessage("error", result.error || "Failed to create")
      }
    })
  }

  const handleSeedDatabase = () => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/seed", { method: "POST" })
        const data = await response.json()
        
        if (data.success) {
          showMessage("success", `Database seeded! ${data.results.services.seeded} services added.`)
          // Reload services from the database
          const servicesResponse = await fetch("/api/services")
          const servicesData = await servicesResponse.json()
          if (servicesData.success) {
            setServices(servicesData.services)
          }
        } else {
          showMessage("error", data.error || "Failed to seed database")
        }
      } catch (error) {
        console.error("Seed error:", error)
        showMessage("error", "Failed to seed database")
      }
    })
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: "general", label: "General" },
    { id: "contact", label: "Contact" },
    { id: "seo", label: "SEO" },
    { id: "services", label: "Services" },
  ]

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <Link href="/" className={styles.backLink}>
            View Site
          </Link>
        </div>
        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}
      </header>

      <nav className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className={styles.main}>
        {activeTab === "general" && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>General Settings</h2>
            <div className={styles.formGroup}>
              <label className={styles.label}>Site Name</label>
              <input
                type="text"
                className={styles.input}
                value={siteConfig.siteName}
                onChange={(e) => handleSiteConfigUpdate("siteName", e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Hero Title</label>
              <input
                type="text"
                className={styles.input}
                value={siteConfig.heroTitle}
                onChange={(e) => handleSiteConfigUpdate("heroTitle", e.target.value)}
              />
              <p className={styles.hint}>The main heading displayed on the homepage hero section</p>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Main Section Title</label>
              <input
                type="text"
                className={styles.input}
                value={siteConfig.mainSectionTitle}
                onChange={(e) => handleSiteConfigUpdate("mainSectionTitle", e.target.value)}
              />
            </div>
            <button
              className={styles.saveButton}
              onClick={saveSiteConfig}
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save General Settings"}
            </button>
          </section>
        )}

        {activeTab === "contact" && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Contact Information</h2>
            <div className={styles.formGroup}>
              <label className={styles.label}>Contact Email</label>
              <input
                type="email"
                className={styles.input}
                value={siteConfig.contactEmail}
                onChange={(e) => handleSiteConfigUpdate("contactEmail", e.target.value)}
              />
              <p className={styles.hint}>Displayed in the footer and used for contact forms</p>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Footer Title</label>
              <input
                type="text"
                className={styles.input}
                value={siteConfig.footerTitle}
                onChange={(e) => handleSiteConfigUpdate("footerTitle", e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Footer Subtitle</label>
              <input
                type="text"
                className={styles.input}
                value={siteConfig.footerSubtitle}
                onChange={(e) => handleSiteConfigUpdate("footerSubtitle", e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Header Button Text</label>
              <input
                type="text"
                className={styles.input}
                value={siteConfig.headerButtonText}
                onChange={(e) => handleSiteConfigUpdate("headerButtonText", e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Copyright Text</label>
              <input
                type="text"
                className={styles.input}
                value={siteConfig.copyrightText}
                onChange={(e) => handleSiteConfigUpdate("copyrightText", e.target.value)}
              />
            </div>
            <button
              className={styles.saveButton}
              onClick={saveSiteConfig}
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save Contact Information"}
            </button>
          </section>
        )}

        {activeTab === "seo" && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>SEO Settings</h2>
            <p className={styles.sectionDescription}>
              These settings control how your site appears in search engines and when shared on social media.
            </p>
            <div className={styles.formGroup}>
              <label className={styles.label}>Page Title</label>
              <input
                type="text"
                className={styles.input}
                value={seoConfig.title}
                onChange={(e) => handleSeoConfigUpdate("title", e.target.value)}
              />
              <p className={styles.hint}>Appears in browser tabs and search results (recommended: 50-60 characters)</p>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Meta Description</label>
              <textarea
                className={styles.textarea}
                value={seoConfig.description}
                onChange={(e) => handleSeoConfigUpdate("description", e.target.value)}
                rows={3}
              />
              <p className={styles.hint}>Shown in search result snippets (recommended: 150-160 characters)</p>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Keywords</label>
              <input
                type="text"
                className={styles.input}
                value={seoConfig.keywords.join(", ")}
                onChange={(e) => handleSeoConfigUpdate("keywords", e.target.value.split(",").map((k) => k.trim()))}
              />
              <p className={styles.hint}>Comma-separated list of keywords (e.g., AI, automation, agency)</p>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Metadata Base URL</label>
              <input
                type="url"
                className={styles.input}
                value={seoConfig.metadataBase}
                onChange={(e) => handleSeoConfigUpdate("metadataBase", e.target.value)}
              />
              <p className={styles.hint}>Your website's base URL (e.g., https://yourdomain.com)</p>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>OG Image URL</label>
              <input
                type="text"
                className={styles.input}
                value={seoConfig.ogImage}
                onChange={(e) => handleSeoConfigUpdate("ogImage", e.target.value)}
              />
              <p className={styles.hint}>Image shown when shared on social media (recommended: 1200x630px)</p>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Twitter Handle</label>
              <input
                type="text"
                className={styles.input}
                value={seoConfig.twitterHandle}
                onChange={(e) => handleSeoConfigUpdate("twitterHandle", e.target.value)}
                placeholder="@yourusername"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Search Engine Indexing</label>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={seoConfig.robots.index}
                    onChange={(e) =>
                      handleSeoConfigUpdate("robots", {
                        ...seoConfig.robots,
                        index: e.target.checked,
                      })
                    }
                  />
                  Allow indexing
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={seoConfig.robots.follow}
                    onChange={(e) =>
                      handleSeoConfigUpdate("robots", {
                        ...seoConfig.robots,
                        follow: e.target.checked,
                      })
                    }
                  />
                  Allow following links
                </label>
              </div>
            </div>
            <button
              className={styles.saveButton}
              onClick={saveSeoConfig}
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save SEO Settings"}
            </button>
          </section>
        )}

        {activeTab === "services" && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Services / Cards</h2>
              {services.length > 0 && (
                <button
                  className={styles.addButton}
                  onClick={handleCreateService}
                  disabled={isPending}
                >
                  + Add Service
                </button>
              )}
            </div>
            <p className={styles.sectionDescription}>
              Manage the service cards displayed on the homepage. Each card links to the /buy page.
            </p>
            {services.length === 0 && (
              <div className={styles.emptyState}>
                <p>No services found in the database. Get started by seeding default services or creating a new one.</p>
                <div className={styles.emptyStateActions}>
                  <button
                    className={styles.seedButton}
                    onClick={handleSeedDatabase}
                    disabled={isPending}
                  >
                    {isPending ? "Seeding..." : "Seed Default Services"}
                  </button>
                  <button
                    className={styles.addButton}
                    onClick={handleCreateService}
                    disabled={isPending}
                  >
                    + Create New Service
                  </button>
                </div>
              </div>
            )}
            <div className={styles.servicesList}>
              {services.map((service) => (
                <div key={service.id} className={styles.serviceCard}>
                  <div className={styles.serviceHeader}>
                    <span className={`${styles.statusBadge} ${service.isActive ? styles.active : styles.inactive}`}>
                      {service.isActive ? "Active" : "Inactive"}
                    </span>
                    <button
                      className={styles.deleteButton}
                      onClick={() => service.id && handleDeleteService(service.id)}
                      disabled={isPending}
                    >
                      Delete
                    </button>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Title</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={service.title}
                      onChange={(e) =>
                        service.id && handleServiceUpdate(service.id, "title", e.target.value)
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Description</label>
                    <textarea
                      className={styles.textarea}
                      value={service.description}
                      onChange={(e) =>
                        service.id && handleServiceUpdate(service.id, "description", e.target.value)
                      }
                      rows={2}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Slug (URL)</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={service.slug}
                        onChange={(e) =>
                          service.id && handleServiceUpdate(service.id, "slug", e.target.value)
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Display Order</label>
                      <input
                        type="number"
                        className={styles.input}
                        value={service.displayOrder}
                        onChange={(e) =>
                          service.id && handleServiceUpdate(service.id, "displayOrder", parseInt(e.target.value) || 0)
                        }
                      />
                    </div>
                  </div>
                  <div className={styles.serviceFooter}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={service.isActive}
                        onChange={(e) =>
                          service.id && handleServiceUpdate(service.id, "isActive", e.target.checked)
                        }
                      />
                      Active (visible on homepage)
                    </label>
                    <button
                      className={styles.saveButton}
                      onClick={() => saveService(service)}
                      disabled={isPending}
                    >
                      {isPending ? "Saving..." : "Save Service"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
