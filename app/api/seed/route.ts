import { NextResponse } from "next/server";
import { getDatabase, COLLECTIONS } from "@/lib/mongodb";
import {
  DEFAULT_SITE_CONFIG,
  DEFAULT_SEO_CONFIG,
  DEFAULT_SERVICES,
  SiteConfig,
  SeoConfig,
  Service,
} from "@/types/database";

/**
 * POST /api/seed
 * Seeds the database with default configuration and services
 * Only seeds if collections are empty (won't overwrite existing data)
 */
export async function POST() {
  try {
    const db = await getDatabase();
    const results = {
      siteConfig: { seeded: false, existed: false },
      seoConfig: { seeded: false, existed: false },
      services: { seeded: 0, existed: 0 },
    };

    // Seed site_config if empty
    const existingSiteConfig = await db
      .collection<SiteConfig>(COLLECTIONS.SITE_CONFIG)
      .findOne({});

    if (!existingSiteConfig) {
      await db
        .collection<SiteConfig>(COLLECTIONS.SITE_CONFIG)
        .insertOne({ ...DEFAULT_SITE_CONFIG } as SiteConfig);
      results.siteConfig.seeded = true;
    } else {
      results.siteConfig.existed = true;
    }

    // Seed seo_config if empty
    const existingSeoConfig = await db
      .collection<SeoConfig>(COLLECTIONS.SEO_CONFIG)
      .findOne({});

    if (!existingSeoConfig) {
      await db
        .collection<SeoConfig>(COLLECTIONS.SEO_CONFIG)
        .insertOne({ ...DEFAULT_SEO_CONFIG } as SeoConfig);
      results.seoConfig.seeded = true;
    } else {
      results.seoConfig.existed = true;
    }

    // Seed services if empty
    const existingServicesCount = await db
      .collection<Service>(COLLECTIONS.SERVICES)
      .countDocuments();

    if (existingServicesCount === 0) {
      const servicesWithDates = DEFAULT_SERVICES.map((service) => ({
        ...service,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const insertResult = await db
        .collection<Service>(COLLECTIONS.SERVICES)
        .insertMany(servicesWithDates as Service[]);

      results.services.seeded = insertResult.insertedCount;
    } else {
      results.services.existed = existingServicesCount;
    }

    // Create indexes for services collection
    await db.collection(COLLECTIONS.SERVICES).createIndex({ slug: 1 }, { unique: true });
    await db.collection(COLLECTIONS.SERVICES).createIndex({ displayOrder: 1 });
    await db.collection(COLLECTIONS.SERVICES).createIndex({ isActive: 1 });

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      results,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/seed
 * Returns the current seed status (what's in the database)
 */
export async function GET() {
  try {
    const db = await getDatabase();

    const siteConfig = await db
      .collection<SiteConfig>(COLLECTIONS.SITE_CONFIG)
      .findOne({});
    const seoConfig = await db
      .collection<SeoConfig>(COLLECTIONS.SEO_CONFIG)
      .findOne({});
    const servicesCount = await db
      .collection<Service>(COLLECTIONS.SERVICES)
      .countDocuments();

    return NextResponse.json({
      success: true,
      status: {
        siteConfig: siteConfig ? "exists" : "empty",
        seoConfig: seoConfig ? "exists" : "empty",
        servicesCount,
      },
    });
  } catch (error) {
    console.error("Seed status error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
