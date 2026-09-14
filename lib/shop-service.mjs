import { findArt } from "./art-catalog.mjs";
import { requireCheckout, ShopError, shopConfig } from "./shop-config.mjs";
import { database, findOrder, claimStock, savePayment } from "./shop-db.mjs";
import { createPayPalClient, orderPayload, validateOrder, paymentState } from "./paypal.mjs";

export const validPayPalId = (id) => typeof id === "string" && /^[A-Z0-9]{10,32}$/.test(id);

export async function startCheckout(productId, hash, requestId) {
  const config = requireCheckout();
  const art = findArt(productId);
  if (!art || art.availability !== "available") throw new ShopError("This painting is available by enquiry only.",409);
  if (typeof requestId !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(requestId)) throw new ShopError("Invalid checkout request.");
  const db = database();
  const [stock] = await db`select sold, claimed_order from art_shop.stock where product_id = ${art.id} and environment = ${config.mode}`;
  if (!stock || stock.sold || stock.claimed_order) throw new ShopError("This original is no longer available for online checkout. Please contact Allen.",409);
  let [existing] = await db`select * from art_shop.orders where id = ${requestId}`;
  if (existing && (existing.session_hash !== hash || existing.product_id !== art.id || existing.environment !== config.mode)) throw new ShopError("Please restart checkout.",409);
  if (existing && Date.now() - new Date(existing.created_at).getTime() > 2 * 3600000) throw new ShopError("This checkout has expired. Please return to the gallery and start again.",409);
  if (!existing) {
    const [{count}] = await db`select count(*)::int as count from art_shop.orders where session_hash = ${hash} and created_at > now() - interval '1 hour'`;
    if (count >= 10) throw new ShopError("Too many checkout attempts. Please try again later or contact Allen.",429);
    await db`insert into art_shop.orders (id,environment,product_id,session_hash,amount_cents)
      values (${requestId},${config.mode},${art.id},${hash},${art.priceCents}) on conflict do nothing`;
    [existing] = await db`select * from art_shop.orders where id = ${requestId}`;
    if (existing.session_hash !== hash || existing.product_id !== art.id || existing.environment !== config.mode) throw new ShopError("Please restart checkout.",409);
  }
  // Freeze the original amount for idempotent retries if the catalogue is edited mid-checkout.
  const pricedArt = {...art,priceCents:existing?.amount_cents || art.priceCents};
  const paypal = createPayPalClient(config);
  const order = existing?.paypal_order_id
    ? await paypal.request(`/v2/checkout/orders/${existing.paypal_order_id}`)
    : await paypal.request("/v2/checkout/orders", { method:"POST",body:orderPayload(pricedArt,requestId,config),requestId });
  const approval = order.links?.find(l=>l.rel === "payer-action" || l.rel === "approve")?.href;
  const expectedHost = config.mode === "live" ? "www.paypal.com" : "www.sandbox.paypal.com";
  if (!validPayPalId(order.id) || !approval || new URL(approval).hostname !== expectedHost || new URL(approval).protocol !== "https:") throw new ShopError("PayPal did not provide a checkout link. Please try again.",502);
  await db`update art_shop.orders set paypal_order_id = ${order.id}, updated_at = now() where id = ${requestId} and session_hash = ${hash}`;
  return {approvalUrl:approval};
}

export async function reconcilePayment(record, suppliedOrder) {
  const config = shopConfig();
  const paypal = createPayPalClient(config);
  const order = suppliedOrder || await paypal.request(`/v2/checkout/orders/${record.paypal_order_id}`);
  let payment = paymentState(order,record,config.merchantId);
  if (payment.captureId) {
    const capture = await paypal.request(`/v2/payments/captures/${payment.captureId}`);
    payment = paymentState({...order,purchase_units:[{...order.purchase_units[0],payments:{captures:[capture]}}]},record,config.merchantId);
  }
  if (payment.status !== "UNPAID") await savePayment(record,payment);
  return {order,payment};
}

export async function checkoutStatus(paypalId, hash) {
  requireCheckout();
  if (!validPayPalId(paypalId)) throw new ShopError("Invalid checkout reference.");
  const record = await findOrder(paypalId,hash);
  const config = shopConfig();
  const paypal = createPayPalClient(config);
  const order = await paypal.request(`/v2/checkout/orders/${paypalId}`);
  const unit = validateOrder(order,record,config.merchantId);
  let payment = paymentState(order,record,config.merchantId);
  if (payment.status !== "UNPAID") ({payment} = await reconcilePayment(record,order));
  const art = findArt(record.product_id);
  return {title:art?.title || "Ann's painting",artId:record.product_id,amountCents:record.amount_cents,
    status:payment.status === "UNPAID" ? (record.status === "CAPTURING" ? "CHECKING" : order.status) : payment.status,
    reference:payment.captureId || paypalId,shipping:unit.shipping, sandbox:config.mode === "sandbox"};
}

export async function captureCheckout(paypalId, hash) {
  const config = requireCheckout();
  if (!validPayPalId(paypalId)) throw new ShopError("Invalid checkout reference.");
  const record = await findOrder(paypalId,hash);
  const paypal = createPayPalClient(config);
  const order = await paypal.request(`/v2/checkout/orders/${paypalId}`);
  validateOrder(order,record,config.merchantId);
  const payment = paymentState(order,record,config.merchantId);
  if (payment.status !== "UNPAID") {
    await reconcilePayment(record,order);
    return checkoutStatus(paypalId,hash);
  }
  if (order.status !== "APPROVED") throw new ShopError("Please approve the order in PayPal first.",409);
  if (findArt(record.product_id)?.availability !== "available") throw new ShopError("This original now requires an enquiry. No payment has been taken by this request.",409);
  await claimStock(record);
  // Deterministic request ID prevents retries from charging the buyer twice.
  // Any timeout leaves the original held until PayPal confirms the outcome.
  await paypal.request(`/v2/checkout/orders/${paypalId}/capture`,{method:"POST",body:{},requestId:record.id});
  await reconcilePayment(record);
  return checkoutStatus(paypalId,hash);
}
