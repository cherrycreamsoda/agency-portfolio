import { getDatabase, COLLECTIONS } from "./mongodb";
import {
  SiteConfig,
  SiteConfigDTO,
  DEFAULT_SITE_CONFIG,
} from "@/types/database";

/**
 * Convert MongoDB document to DTO (serializable)
 */
function toDTO(doc: SiteConfig): SiteConfigDTO {
  const { _id, updatedAt, ...rest } = doc;
  return {
    ...rest,
    id: _id?.toString(),
    updatedAt: updatedAt.toISOString(),
  };
}

/**
 * Get site configuration from database
 * Falls back to defaults if not found
 */
export async function getSiteConfig(): Promise<SiteConfigDTO> {
  try {
    const db = await getDatabase();
    const doc = await db
      .collection<SiteConfig>(COLLECTIONS.SITE_CONFIG)
      .findOne({});

    if (!doc) {
      // Return defaults if no config exists
      return {
        ...DEFAULT_SITE_CONFIG,
        updatedAt: DEFAULT_SITE_CONFIG.updatedAt.toISOString(),
      };
    }

    return toDTO(doc);
  } catch (error) {
    console.error("Error fetching site config:", error);
    // Return defaults on error
    return {
      ...DEFAULT_SITE_CONFIG,
      updatedAt: DEFAULT_SITE_CONFIG.updatedAt.toISOString(),
    };
  }
}

/**
 * Update site configuration
 * Uses upsert to create if doesn't exist
 */
export async function updateSiteConfig(
  data: Partial<Omit<SiteConfig, "_id" | "updatedAt">>
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDatabase();
    const result = await db.collection<SiteConfig>(COLLECTIONS.SITE_CONFIG).updateOne(
      {}, // Match the single document
      {
        $set: { ...data, updatedAt: new Date() },
        $setOnInsert: {
          // Set defaults ONLY for fields not in $set
          ...(data.siteName === undefined && { siteName: DEFAULT_SITE_CONFIG.siteName }),
          ...(data.heroTitle === undefined && { heroTitle: DEFAULT_SITE_CONFIG.heroTitle }),
          ...(data.contactEmail === undefined && { contactEmail: DEFAULT_SITE_CONFIG.contactEmail }),
          ...(data.footerTitle === undefined && { footerTitle: DEFAULT_SITE_CONFIG.footerTitle }),
          ...(data.footerSubtitle === undefined && { footerSubtitle: DEFAULT_SITE_CONFIG.footerSubtitle }),
          ...(data.copyrightText === undefined && { copyrightText: DEFAULT_SITE_CONFIG.copyrightText }),
          ...(data.headerButtonText === undefined && { headerButtonText: DEFAULT_SITE_CONFIG.headerButtonText }),
          ...(data.mainSectionTitle === undefined && { mainSectionTitle: DEFAULT_SITE_CONFIG.mainSectionTitle }),
        },
      },
      { upsert: true }
    );

    return { success: result.acknowledged };
  } catch (error) {
    console.error("Error updating site config:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
