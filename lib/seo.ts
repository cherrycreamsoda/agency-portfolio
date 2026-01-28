import { getDatabase, COLLECTIONS } from "./mongodb";
import { SeoConfig, SeoConfigDTO, DEFAULT_SEO_CONFIG } from "@/types/database";

/**
 * Convert MongoDB document to DTO (serializable)
 */
function toDTO(doc: SeoConfig): SeoConfigDTO {
  const { _id, updatedAt, ...rest } = doc;
  return {
    ...rest,
    id: _id?.toString(),
    updatedAt: updatedAt.toISOString(),
  };
}

/**
 * Get SEO configuration from database
 * Falls back to defaults if not found
 */
export async function getSeoConfig(): Promise<SeoConfigDTO> {
  try {
    const db = await getDatabase();
    const doc = await db
      .collection<SeoConfig>(COLLECTIONS.SEO_CONFIG)
      .findOne({});

    if (!doc) {
      // Return defaults if no config exists
      return {
        ...DEFAULT_SEO_CONFIG,
        updatedAt: DEFAULT_SEO_CONFIG.updatedAt.toISOString(),
      };
    }

    return toDTO(doc);
  } catch (error) {
    console.error("Error fetching SEO config:", error);
    // Return defaults on error
    return {
      ...DEFAULT_SEO_CONFIG,
      updatedAt: DEFAULT_SEO_CONFIG.updatedAt.toISOString(),
    };
  }
}

/**
 * Update SEO configuration
 * Uses upsert to create if doesn't exist
 */
export async function updateSeoConfig(
  data: Partial<Omit<SeoConfig, "_id" | "updatedAt">>
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDatabase();
    const result = await db.collection<SeoConfig>(COLLECTIONS.SEO_CONFIG).updateOne(
      {}, // Match the single document
      {
        $set: { ...data, updatedAt: new Date() },
        $setOnInsert: {
          // Set defaults ONLY for fields not in $set
          ...(data.title === undefined && { title: DEFAULT_SEO_CONFIG.title }),
          ...(data.description === undefined && { description: DEFAULT_SEO_CONFIG.description }),
          ...(data.keywords === undefined && { keywords: DEFAULT_SEO_CONFIG.keywords }),
          ...(data.metadataBase === undefined && { metadataBase: DEFAULT_SEO_CONFIG.metadataBase }),
          ...(data.ogImage === undefined && { ogImage: DEFAULT_SEO_CONFIG.ogImage }),
          ...(data.ogType === undefined && { ogType: DEFAULT_SEO_CONFIG.ogType }),
          ...(data.twitterHandle === undefined && { twitterHandle: DEFAULT_SEO_CONFIG.twitterHandle }),
          ...(data.twitterCard === undefined && { twitterCard: DEFAULT_SEO_CONFIG.twitterCard }),
          ...(data.robots === undefined && { robots: DEFAULT_SEO_CONFIG.robots }),
        },
      },
      { upsert: true }
    );

    return { success: result.acknowledged };
  } catch (error) {
    console.error("Error updating SEO config:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
