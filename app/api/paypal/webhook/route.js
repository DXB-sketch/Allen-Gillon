import { shopConfig,ShopError } from "../../../../lib/shop-config.mjs";
import { createPayPalClient } from "../../../../lib/paypal.mjs";
import { database,findOrder } from "../../../../lib/shop-db.mjs";
import { reconcilePayment,validPayPalId } from "../../../../lib/shop-service.mjs";
import { json,failure } from "../../../../lib/shop-http.mjs";
export const runtime = "nodejs";
export async function POST(request) {
  try {
    const config = shopConfig();
    if (!config.webhookId || !config.clientId || !config.secret || !process.env.DATABASE_URL) return json({error:"Webhook not configured."},503);
    const raw = await request.text();
    if (Buffer.byteLength(raw) > 262144) return json({error:"Request too large."},413);
    let event;
    try { event = JSON.parse(raw); } catch { return json({error:"Invalid event."},400); }
    const fields = {auth_algo:request.headers.get("paypal-auth-algo"),cert_url:request.headers.get("paypal-cert-url"),
      transmission_id:request.headers.get("paypal-transmission-id"),transmission_sig:request.headers.get("paypal-transmission-sig"),
      transmission_time:request.headers.get("paypal-transmission-time"),webhook_id:config.webhookId};
    if (Object.values(fields).some(v=>!v)) return json({error:"Missing signature."},400);
    // Preserve the event's original JSON representation for PayPal's postback verification.
    const rawBody = `${JSON.stringify(fields).slice(0,-1)},"webhook_event":${raw}}`;
    const verification = await createPayPalClient(config).request("/v1/notifications/verify-webhook-signature",{method:"POST",rawBody});
    if (verification.verification_status !== "SUCCESS") return json({error:"Invalid signature."},400);
    if (!event.event_type?.startsWith("PAYMENT.CAPTURE.")) return json({received:true});
    let paypalId = event.resource?.supplementary_data?.related_ids?.order_id;
    if (!validPayPalId(paypalId)) {
      const captureId = event.resource?.supplementary_data?.related_ids?.capture_id || event.resource?.id;
      if (!validPayPalId(captureId)) return json({received:true});
      const db = database();
      const [record] = await db`select paypal_order_id from art_shop.orders where capture_id = ${captureId} and environment = ${config.mode}`;
      paypalId = record?.paypal_order_id;
    }
    if (!paypalId) return json({received:true});
    let record;
    try { record = await findOrder(paypalId); }
    catch(error) { if(error instanceof ShopError && error.status === 404) return json({received:true}); throw error; }
    // Read the current PayPal state, so duplicate/out-of-order events cannot undo a sale.
    await reconcilePayment(record);
    return json({received:true});
  } catch(error) { return failure(error); }
}
