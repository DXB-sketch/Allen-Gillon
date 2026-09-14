import { checkoutStatus,captureCheckout } from "../../../../../lib/shop-service.mjs";
import { checkOrigin,sessionHash,json,failure } from "../../../../../lib/shop-http.mjs";
export const runtime = "nodejs";
export async function GET(request,{params}) {
  try { return json(await checkoutStatus((await params).id,await sessionHash())); }
  catch(error) { return failure(error); }
}
export async function POST(request,{params}) {
  try { checkOrigin(request); return json(await captureCheckout((await params).id,await sessionHash())); }
  catch(error) { return failure(error); }
}
