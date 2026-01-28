import { getServiceBySlug } from "@/lib/services"
import { BuyPageClient } from "./buy-client"

interface BuyPageProps {
  searchParams: Promise<{ service?: string }>
}

export default async function BuyPage({ searchParams }: BuyPageProps) {
  const params = await searchParams
  const serviceSlug = params.service

  // Fetch the service from database if slug is provided
  const service = serviceSlug ? await getServiceBySlug(serviceSlug) : null

  return <BuyPageClient service={service} serviceSlug={serviceSlug} />
}
