import { startCheckout } from "../../../../lib/shop-service.mjs";
import { checkOrigin,sessionHash,json,failure,readJson } from "../../../../lib/shop-http.mjs";
export const runtime = "nodejs";
export async function POST(request) {
  try {
    checkOrigin(request);
    const body = await readJson(request);
    return json(await startCheckout(body.productId,await sessionHash(true),body.requestId));
  } catch(error) { return failure(error); }
}
