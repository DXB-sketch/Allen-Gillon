import postgres from "postgres";
import { ShopError, shopConfig } from "./shop-config.mjs";

let sql;
export function database() {
  if (!process.env.DATABASE_URL) throw new ShopError("Checkout storage is not configured.", 503);
  sql ||= postgres(process.env.DATABASE_URL, { max: 2, idle_timeout: 20, connect_timeout: 10, prepare: false,
    connection: { statement_timeout: 10000 } });
  return sql;
}
export async function stockStates() {
  if (!shopConfig().enabled) return {};
  const db = database();
  const rows = await db`select product_id, sold, claimed_order from art_shop.stock where environment = ${shopConfig().mode}`;
  return Object.fromEntries(rows.map(r=>[r.product_id,r.sold?"sold":r.claimed_order?"pending":"available"]));
}
export async function findOrder(paypalId, sessionHash) {
  const db = database();
  const [record] = sessionHash
    ? await db`select * from art_shop.orders where paypal_order_id = ${paypalId} and session_hash = ${sessionHash} and environment = ${shopConfig().mode}`
    : await db`select * from art_shop.orders where paypal_order_id = ${paypalId} and environment = ${shopConfig().mode}`;
  if (!record) throw new ShopError("This checkout could not be found. Please return to Ann's gallery.", 404);
  return record;
}

// A short atomic stock claim, committed BEFORE the external PayPal call.
// Claims do not expire automatically: an unknown capture outcome must never release an original for resale.
export async function claimStock(record, db = database()) {
  await db.begin(async tx => {
    await tx`select id from art_shop.orders where id = ${record.id} for update`;
    const [claim] = await tx`update art_shop.stock set claimed_order = ${record.id}
      where product_id = ${record.product_id} and environment = ${record.environment}
      and sold = false and (claimed_order is null or claimed_order = ${record.id}) returning product_id`;
    if (!claim) throw new ShopError("This original has sold or another payment is being confirmed. Please contact Allen.", 409);
    await tx`update art_shop.orders set status = 'CAPTURING', updated_at = now() where id = ${record.id} and status in ('CREATED','CAPTURING')`;
  });
}

export async function savePayment(record, payment, db = database()) {
  const status = payment.status;
  if (!["COMPLETED","PENDING","DECLINED","FAILED","REFUNDED","PARTIALLY_REFUNDED"].includes(status)) return;
  await db.begin(async tx => {
    // Do not downgrade a completed payment when an older pending webhook arrives.
    const [current] = await tx`select status, capture_id from art_shop.orders where id = ${record.id} for update`;
    if (current.status === status && current.capture_id === payment.captureId) return;
    if (current.status === "REFUNDED") return;
    if (current.status === "PARTIALLY_REFUNDED" && status === "COMPLETED") return;
    if (["COMPLETED","REFUNDED","PARTIALLY_REFUNDED"].includes(current.status) && ["PENDING","DECLINED","FAILED"].includes(status)) return;
    const sold = ["COMPLETED","REFUNDED","PARTIALLY_REFUNDED"].includes(status);
    const [stock] = await tx`update art_shop.stock set sold = ${sold},
      claimed_order = ${["DECLINED","FAILED"].includes(status) ? null : record.id}
      where product_id = ${record.product_id} and environment = ${record.environment}
      and claimed_order = ${record.id} returning product_id`;
    if (!stock) throw new ShopError("The payment needs stock reconciliation. Please contact Allen.", 409);
    await tx`update art_shop.orders set status = ${status}, capture_id = ${payment.captureId}, updated_at = now() where id = ${record.id}`;
  });
}
