import { ObjectId } from "mongodb";
import { getDatabase, COLLECTIONS } from "./mongodb";
import { Service, ServiceDTO, DEFAULT_SERVICES } from "@/types/database";

/**
 * Convert MongoDB document to DTO (serializable)
 */
function toDTO(doc: Service): ServiceDTO {
  const { _id, createdAt, updatedAt, ...rest } = doc;
  return {
    ...rest,
    id: _id?.toString(),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

/**
 * Get all services, sorted by displayOrder
 * Optionally filter by isActive status
 */
async function getServices(
  activeOnly: boolean = false
): Promise<ServiceDTO[]> {
  try {
    const db = await getDatabase();
    const query = activeOnly ? { isActive: true } : {};

    const docs = await db
      .collection<Service>(COLLECTIONS.SERVICES)
      .find(query)
      .sort({ displayOrder: 1 })
      .toArray();

    // Return only real database services (no fallback defaults in admin)
    return docs.map(toDTO);
  } catch (error) {
    console.error("Error fetching services:", error);
    // Return empty array on error instead of defaults
    return [];
  }
}

/**
 * Get all services (active and inactive)
 */
export async function getAllServices(): Promise<ServiceDTO[]> {
  return getServices(false);
}

/**
 * Get only active services
 */
export async function getActiveServices(): Promise<ServiceDTO[]> {
  return getServices(true);
}

/**
 * Get a single service by slug
 */
export async function getServiceBySlug(
  slug: string
): Promise<ServiceDTO | null> {
  try {
    const db = await getDatabase();
    const doc = await db
      .collection<Service>(COLLECTIONS.SERVICES)
      .findOne({ slug });

    if (!doc) {
      // Check defaults as fallback
      const defaultService = DEFAULT_SERVICES.find((s) => s.slug === slug);
      if (defaultService) {
        return {
          ...defaultService,
          id: `default-${defaultService.slug}`,
          createdAt: defaultService.createdAt.toISOString(),
          updatedAt: defaultService.updatedAt.toISOString(),
        };
      }
      return null;
    }

    return toDTO(doc);
  } catch (error) {
    console.error("Error fetching service by slug:", error);
    return null;
  }
}

/**
 * Get a single service by ID
 */
export async function getServiceById(id: string): Promise<ServiceDTO | null> {
  try {
    const db = await getDatabase();
    const doc = await db
      .collection<Service>(COLLECTIONS.SERVICES)
      .findOne({ _id: new ObjectId(id) });

    if (!doc) return null;

    return toDTO(doc);
  } catch (error) {
    console.error("Error fetching service by ID:", error);
    return null;
  }
}

/**
 * Create a new service
 */
export async function createService(
  data: Omit<Service, "_id" | "createdAt" | "updatedAt">
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const db = await getDatabase();

    // Check if slug already exists
    const existing = await db
      .collection<Service>(COLLECTIONS.SERVICES)
      .findOne({ slug: data.slug });

    if (existing) {
      return { success: false, error: "A service with this slug already exists" };
    }

    const now = new Date();
    const result = await db.collection<Service>(COLLECTIONS.SERVICES).insertOne({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as Service);

    return {
      success: result.acknowledged,
      id: result.insertedId.toString(),
    };
  } catch (error) {
    console.error("Error creating service:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update a service by ID
 */
export async function updateService(
  id: string,
  data: Partial<Omit<Service, "_id" | "createdAt" | "updatedAt">>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate that id is a valid MongoDB ObjectId
    if (!ObjectId.isValid(id)) {
      return {
        success: false,
        error: "Invalid service ID. Cannot update default services.",
      };
    }

    const db = await getDatabase();

    // If updating slug, check it doesn't conflict
    if (data.slug) {
      const existing = await db
        .collection<Service>(COLLECTIONS.SERVICES)
        .findOne({
          slug: data.slug,
          _id: { $ne: new ObjectId(id) },
        });

      if (existing) {
        return { success: false, error: "A service with this slug already exists" };
      }
    }

    const result = await db
      .collection<Service>(COLLECTIONS.SERVICES)
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...data, updatedAt: new Date() } }
      );

    return { success: result.matchedCount > 0 };
  } catch (error) {
    console.error("Error updating service:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a service by ID
 */
export async function deleteService(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate that id is a valid MongoDB ObjectId
    if (!ObjectId.isValid(id)) {
      return {
        success: false,
        error: "Invalid service ID. Cannot delete default services.",
      };
    }

    const db = await getDatabase();
    const result = await db
      .collection<Service>(COLLECTIONS.SERVICES)
      .deleteOne({ _id: new ObjectId(id) });

    return { success: result.deletedCount > 0 };
  } catch (error) {
    console.error("Error deleting service:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Reorder services by updating their displayOrder
 */
export async function reorderServices(
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDatabase();
    const collection = db.collection<Service>(COLLECTIONS.SERVICES);

    // Update each service's displayOrder
    const operations = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: new ObjectId(id) },
        update: { $set: { displayOrder: index + 1, updatedAt: new Date() } },
      },
    }));

    const result = await collection.bulkWrite(operations);

    return { success: result.isOk() };
  } catch (error) {
    console.error("Error reordering services:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
