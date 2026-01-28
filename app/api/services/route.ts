import { NextResponse } from "next/server";
import { getAllServices } from "@/lib/services";

/**
 * GET /api/services
 * Fetches all services from the database
 */
export async function GET() {
  try {
    const services = await getAllServices();
    
    return NextResponse.json({
      success: true,
      services,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
