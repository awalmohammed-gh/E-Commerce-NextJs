import { NextResponse } from "next/server";
import { getStoreInfo } from "@/lib/storeInfo";

export const dynamic = "force-dynamic";

// Public store details for client components (e.g. the product page's
// delivery note). Only what the storefront already shows publicly.
export async function GET() {
  const store = await getStoreInfo();
  return NextResponse.json({ success: true, store });
}
