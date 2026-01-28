"use server"

import { revalidatePath } from "next/cache"
import { updateSiteConfig } from "@/lib/config"
import { updateSeoConfig } from "@/lib/seo"
import {
  createService,
  updateService,
  deleteService,
} from "@/lib/services"
import type { SiteConfigDTO, SeoConfigDTO, ServiceDTO } from "@/types/database"

export async function updateSiteConfigAction(
  data: Partial<Omit<SiteConfigDTO, "id" | "updatedAt">>
) {
  try {
    const result = await updateSiteConfig(data)
    if (result.success) {
      revalidatePath("/", "layout")
      revalidatePath("/admin")
    }
    return { success: result.success, error: result.error || null }
  } catch (error) {
    console.error("Failed to update site config:", error)
    return { success: false, error: "Failed to update site configuration" }
  }
}

export async function updateSeoConfigAction(
  data: Partial<Omit<SeoConfigDTO, "id" | "updatedAt">>
) {
  try {
    const result = await updateSeoConfig(data)
    if (result.success) {
      revalidatePath("/", "layout")
      revalidatePath("/admin")
    }
    return { success: result.success, error: result.error || null }
  } catch (error) {
    console.error("Failed to update SEO config:", error)
    return { success: false, error: "Failed to update SEO configuration" }
  }
}

export async function createServiceAction(
  data: Omit<ServiceDTO, "id" | "createdAt" | "updatedAt">
) {
  try {
    const result = await createService({
      title: data.title,
      description: data.description,
      slug: data.slug,
      icon: data.icon,
      displayOrder: data.displayOrder,
      isActive: data.isActive,
    })
    
    if (result.success && result.id) {
      revalidatePath("/", "layout")
      revalidatePath("/admin")
      
      // Fetch the created service to return
      const { getServiceById } = await import("@/lib/services")
      const service = await getServiceById(result.id)
      
      return { success: true, service, error: null }
    }
    
    return { success: false, service: null, error: result.error || "Failed to create service" }
  } catch (error) {
    console.error("Failed to create service:", error)
    return { success: false, service: null, error: "Failed to create service" }
  }
}

export async function updateServiceAction(
  id: string,
  data: Partial<Omit<ServiceDTO, "id" | "createdAt" | "updatedAt">>
) {
  try {
    const result = await updateService(id, {
      title: data.title,
      description: data.description,
      slug: data.slug,
      icon: data.icon,
      displayOrder: data.displayOrder,
      isActive: data.isActive,
    })
    
    if (result.success) {
      revalidatePath("/", "layout")
      revalidatePath("/admin")
    }
    
    return { success: result.success, error: result.error || null }
  } catch (error) {
    console.error("Failed to update service:", error)
    return { success: false, error: "Failed to update service" }
  }
}

export async function deleteServiceAction(id: string) {
  try {
    const result = await deleteService(id)
    if (result.success) {
      revalidatePath("/", "layout")
      revalidatePath("/admin")
    }
    return { success: result.success, error: result.error || null }
  } catch (error) {
    console.error("Failed to delete service:", error)
    return { success: false, error: "Failed to delete service" }
  }
}
