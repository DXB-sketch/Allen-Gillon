import { cookies } from "next/headers";
import { randomBytes, createHash } from "node:crypto";
import { ShopError, shopConfig } from "./shop-config.mjs";

export function checkOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== shopConfig().origin) throw new ShopError("Please start checkout from this website.", 403);
}
export async function sessionHash(create = false) {
  const jar = await cookies();
  let token = jar.get("ann-checkout")?.value;
  if (!/^[a-f0-9]{64}$/.test(token || "")) {
    if (!create) throw new ShopError("Please reopen checkout in the browser where you started it.", 403);
    token = randomBytes(32).toString("hex");
    jar.set("ann-checkout", token, { httpOnly:true, secure:shopConfig().origin?.startsWith("https://"), sameSite:"lax", path:"/", maxAge:86400 });
  }
  return createHash("sha256").update(token).digest("hex");
}
export function json(data, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control":"no-store" } });
}
export function failure(error) {
  if (error instanceof ShopError) return json({error:error.message},error.status);
  // Do not log credentials, buyer data, database connection strings or raw PayPal errors.
  console.error("Checkout request failed", error?.name || "Error");
  return json({error:"We could not confirm checkout right now. Please try checking the payment status again, or contact Allen."},503);
}
export async function readJson(request, maxBytes = 4096) {
  const raw = await request.text();
  if (Buffer.byteLength(raw) > maxBytes) throw new ShopError("Request is too large.",413);
  try { return JSON.parse(raw); } catch { throw new ShopError("Invalid request."); }
}
