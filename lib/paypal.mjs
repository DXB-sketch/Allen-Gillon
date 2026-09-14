import { ShopError, shopConfig } from "./shop-config.mjs";

export function createPayPalClient(config = shopConfig(), fetcher = fetch) {
  async function request(path, { method = "GET", body, requestId, rawBody } = {}) {
    const auth = Buffer.from(`${config.clientId}:${config.secret}`).toString("base64");
    const tokenResponse = await fetcher(`${config.base}/v1/oauth2/token`, {
      method: "POST", headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=client_credentials", signal: AbortSignal.timeout(15000), cache: "no-store",
    });
    if (!tokenResponse.ok) throw new ShopError("PayPal is temporarily unavailable. Please try again later.", 502);
    const token = await tokenResponse.json();
    if (!token.access_token) throw new ShopError("PayPal is temporarily unavailable.", 502);
    const response = await fetcher(`${config.base}${path}`, {
      method, headers: { Authorization: `Bearer ${token.access_token}`, "Content-Type": "application/json",
        Prefer: "return=representation", ...(requestId ? { "PayPal-Request-Id": requestId } : {}) },
      ...(rawBody !== undefined ? {body:rawBody} : body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(20000), cache: "no-store",
    });
    if (!response.ok) throw new ShopError("PayPal could not confirm this payment. Check its status before trying another purchase.", 502);
    return response.json();
  }
  return { request };
}

export function orderPayload(art, localId, config) {
  const amount = { currency_code: "AUD", value: (art.priceCents / 100).toFixed(2) };
  return {
    intent: "CAPTURE",
    purchase_units: [{ reference_id: art.id, custom_id: localId, payee: { merchant_id: config.merchantId },
      description: `${art.title}, original painting by Ann Gillon`,
      items: [{ name: art.title, sku: art.id, quantity: "1", category: "PHYSICAL_GOODS", unit_amount: amount }],
      amount: { ...amount, breakdown: { item_total: amount, shipping: { currency_code: "AUD", value: "0.00" } } } }],
    payment_source: { paypal: { experience_context: { brand_name: "Art by Ann Gillon", shipping_preference: "GET_FROM_FILE",
      user_action: "CONTINUE", return_url: `${config.origin}/checkout/return`, cancel_url: `${config.origin}/checkout/cancel` } } },
  };
}

export function validateOrder(order, record, merchantId) {
  const unit = order.purchase_units?.[0];
  if (order.id !== record.paypal_order_id || order.purchase_units?.length !== 1 ||
      unit?.custom_id !== record.id || unit.reference_id !== record.product_id ||
      unit.payee?.merchant_id !== merchantId || unit.amount?.currency_code !== "AUD" ||
      unit.amount?.value !== (record.amount_cents / 100).toFixed(2) ||
      unit.items?.length !== 1 || unit.items[0].sku !== record.product_id || unit.items[0].quantity !== "1") {
    throw new ShopError("The payment details do not match this painting. Please contact Allen.", 409);
  }
  const shipping = unit.shipping;
  if (shipping?.address?.country_code !== "AU") {
    throw new ShopError("Free delivery is available within Australia only. Choose an Australian delivery address in PayPal.", 422);
  }
  if (!shipping.name?.full_name || !shipping.address.address_line_1 || !shipping.address.admin_area_2 || !shipping.address.postal_code) {
    throw new ShopError("Please provide a complete delivery address in PayPal.", 422);
  }
  return unit;
}

export function paymentState(order, record, merchantId) {
  const unit = validateOrder(order, record, merchantId);
  const captures = unit.payments?.captures || [];
  if (!captures.length) return { status: "UNPAID" };
  if (captures.length !== 1) throw new ShopError("This payment needs review. Please contact Allen.", 409);
  const capture = captures[0];
  if (!capture.id || capture.amount?.currency_code !== "AUD" || capture.amount.value !== (record.amount_cents / 100).toFixed(2)) {
    throw new ShopError("The captured payment needs review. Please contact Allen.", 409);
  }
  return { status: capture.status, captureId: capture.id };
}
