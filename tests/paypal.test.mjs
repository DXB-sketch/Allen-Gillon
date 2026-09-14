import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { artworks } from "../content/artworks.mjs";
import { shopConfig } from "../lib/shop-config.mjs";
import { orderPayload,validateOrder,paymentState,createPayPalClient } from "../lib/paypal.mjs";

const config = {mode:"sandbox",origin:"https://example.test",merchantId:"MERCHANT123",base:"https://api-m.sandbox.paypal.com",clientId:"test-client",secret:"test-secret"};
const art = artworks.find(a=>a.availability === "available");
const record = {id:"00000000-0000-4000-8000-000000000001",product_id:art.id,amount_cents:art.priceCents,paypal_order_id:"PAYPALORDER12345"};
function approved() {
  return {id:record.paypal_order_id,status:"APPROVED",purchase_units:orderPayload(art,record.id,config).purchase_units.map(unit=>({...unit,
    shipping:{name:{full_name:"Test Buyer"},address:{country_code:"AU",address_line_1:"1 Test Street",admin_area_2:"Brisbane",postal_code:"4000"}}}))};
}
test("catalogue covers distinct paintings with safe prices and local assets",()=>{
  assert.equal(artworks.length,36);assert.equal(new Set(artworks.map(a=>a.id)).size,36);
  assert.equal(artworks.reduce((n,a)=>n+a.images.length,0),44);
  for(const a of artworks){assert(Number.isInteger(a.priceCents)&&a.priceCents>=10000&&a.priceCents<=25000);assert.equal(a.currency,"AUD");
    if(/sold|commissioned|not for sale|owner/i.test(a.note)) assert.equal(a.availability,"enquiry");
    for(const image of a.images) {assert(fs.existsSync(new URL(`../public${image.src}`,import.meta.url)));assert(image.width>0&&image.height>0);}}
});
test("checkout is off by default and live mode requires complete configuration",()=>{
  assert.equal(shopConfig({}).enabled,false);
  const env={PAYPAL_CHECKOUT_ENABLED:"true",PAYPAL_ENV:"live",SITE_URL:"https://example.test",PAYPAL_CLIENT_ID:"id",PAYPAL_CLIENT_SECRET:"secret",PAYPAL_MERCHANT_ID:"merchant",DATABASE_URL:"postgres://example"};
  assert.equal(shopConfig(env).enabled,false);assert.equal(shopConfig({...env,PAYPAL_WEBHOOK_ID:"webhook"}).enabled,true);
  assert.equal(shopConfig({...env,PAYPAL_WEBHOOK_ID:"webhook",SITE_URL:"http://example.test"}).enabled,false);
  assert.equal(shopConfig({...env,PAYPAL_ENV:"bogus",PAYPAL_WEBHOOK_ID:"webhook"}).enabled,false);
});
test("orders use catalogue AUD totals, one physical original, and free shipping",()=>{
  const payload=orderPayload(art,record.id,config);
  assert.equal(payload.purchase_units[0].items[0].quantity,"1");assert.equal(payload.purchase_units[0].items[0].category,"PHYSICAL_GOODS");
  assert.equal(payload.purchase_units[0].amount.value,(art.priceCents/100).toFixed(2));assert.deepEqual(payload.purchase_units[0].amount.breakdown.shipping,{currency_code:"AUD",value:"0.00"});
  assert.equal(payload.payment_source.paypal.experience_context.user_action,"CONTINUE");
  assert.equal(payload.payment_source.paypal.experience_context.return_url,"https://example.test/checkout/return");
});
test("rejects altered amounts, currency, merchant, product, session order and quantities",()=>{
  for(const mutate of [o=>o.purchase_units[0].amount.value="1.00",o=>o.purchase_units[0].amount.currency_code="USD",o=>o.purchase_units[0].payee.merchant_id="OTHER",o=>o.purchase_units[0].custom_id="wrong",o=>o.purchase_units[0].items[0].quantity="2",o=>o.purchase_units[0].items[0].sku="other",o=>o.id="OTHERORDER123"]){const order=approved();mutate(order);assert.throws(()=>validateOrder(order,record,config.merchantId));}
});
test("rejects non-Australian and incomplete shipping before capture",()=>{
  let order=approved();order.purchase_units[0].shipping.address.country_code="US";assert.throws(()=>validateOrder(order,record,config.merchantId),/Australia/);
  order=approved();delete order.purchase_units[0].shipping.address.postal_code;assert.throws(()=>validateOrder(order,record,config.merchantId),/complete delivery/);
});
test("approval is not payment; pending captures stay pending; only matched captures complete",()=>{
  const order=approved();assert.equal(paymentState(order,record,config.merchantId).status,"UNPAID");
  const capture={id:"CAPTURE123456",status:"PENDING",amount:{currency_code:"AUD",value:(art.priceCents/100).toFixed(2)}};
  order.purchase_units[0].payments={captures:[capture]};assert.equal(paymentState(order,record,config.merchantId).status,"PENDING");
  capture.status="COMPLETED";assert.equal(paymentState(order,record,config.merchantId).status,"COMPLETED");
  capture.amount.value="0.01";assert.throws(()=>paymentState(order,record,config.merchantId));
});
test("PayPal server requests use secret auth and a stable idempotency key",async()=>{
  const calls=[];
  const fakeFetch=async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>url.endsWith('/token')?{access_token:"access"}:{id:"RESULT"}};};
  const client=createPayPalClient(config,fakeFetch);
  for(let i=0;i<2;i++) await client.request(`/v2/checkout/orders/${record.paypal_order_id}/capture`,{method:"POST",body:{},requestId:record.id});
  assert.equal(calls[0].options.headers.Authorization,`Basic ${Buffer.from('test-client:test-secret').toString('base64')}`);
  assert.equal(calls[1].options.headers["PayPal-Request-Id"],calls[3].options.headers["PayPal-Request-Id"]);
});
test("PayPal errors never expose provider responses or credentials",async()=>{
  const client=createPayPalClient(config,async()=>({ok:false,json:async()=>({secret:"do-not-expose"})}));
  await assert.rejects(client.request('/v2/checkout/orders'),error=>!error.message.includes('do-not-expose')&&error.status===502);
});
