export function shopConfig(env = process.env) {
  const mode = env.PAYPAL_ENV || "sandbox";
  let origin;
  try { origin = new URL(env.SITE_URL).origin; } catch { origin = null; }
  const validOrigin = origin && (origin.startsWith("https://") || (mode === "sandbox" && /^http:\/\/localhost(?::\d+)?$/.test(origin)));
  const configured = ["sandbox", "live"].includes(mode) && validOrigin &&
    !!env.PAYPAL_CLIENT_ID && !!env.PAYPAL_CLIENT_SECRET && !!env.PAYPAL_MERCHANT_ID &&
    !!env.DATABASE_URL && (mode !== "live" || !!env.PAYPAL_WEBHOOK_ID);
  return { mode, origin, enabled: env.PAYPAL_CHECKOUT_ENABLED === "true" && !!configured,
    base: mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com",
    clientId: env.PAYPAL_CLIENT_ID, secret: env.PAYPAL_CLIENT_SECRET,
    merchantId: env.PAYPAL_MERCHANT_ID, webhookId: env.PAYPAL_WEBHOOK_ID };
}

export class ShopError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

export function requireCheckout() {
  const config = shopConfig();
  if (!config.enabled) throw new ShopError("Online checkout is not available yet. Please contact Allen about this painting.", 503);
  return config;
}
