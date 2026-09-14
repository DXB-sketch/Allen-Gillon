import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { claimStock,savePayment } from "../lib/shop-db.mjs";

// Exercise the production SQL against actual Postgres (WASM), not a stock mock.
function adapter(pg) {
  const sql = async (parts,...values) => (await pg.query(parts.reduce((text,part,i)=>text+(i?`$${i}`:"")+part,""),values)).rows;
  sql.begin = fn => pg.transaction(tx=>fn(adapter(tx)));
  return sql;
}
test("one-off stock claims, retries, failures and environment isolation",async t=>{
  const pg = new PGlite();
  const sql = adapter(pg);
  await pg.exec(await fs.readFile(new URL("../db/shop.sql",import.meta.url),"utf8"));
  const one={id:"00000000-0000-4000-8000-000000000001",product_id:"painting",environment:"sandbox"};
  const two={...one,id:"00000000-0000-4000-8000-000000000002"};
  for(const order of [one,two]) await sql`insert into art_shop.orders(id,product_id,environment,session_hash,amount_cents) values(${order.id},${order.product_id},${order.environment},'test',20000)`;
  for(const mode of ["sandbox","live"]) await sql`insert into art_shop.stock(product_id,environment) values('painting',${mode})`;
  try {
    await t.test("only one competing buyer can claim the original",async()=>{
      const results=await Promise.allSettled([claimStock(one,sql),claimStock(two,sql)]);
      assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
      assert.equal(results.filter(r=>r.status==='rejected').length,1);
      const [stock]=await sql`select * from art_shop.stock where environment='sandbox'`;
      assert.equal(stock.claimed_order,one.id);
    });
    await t.test("retry preserves claim and sandbox never changes live stock",async()=>{
      await claimStock(one,sql);
      const [live]=await sql`select * from art_shop.stock where environment='live'`;
      assert.equal(live.claimed_order,null);assert.equal(live.sold,false);
    });
    await t.test("a pending payment holds the original and blocks a second buyer",async()=>{
      await savePayment(one,{status:'PENDING',captureId:'CAPTURE1'},sql);
      await assert.rejects(claimStock(two,sql));
    });
    await t.test("confirmed failure releases stock, and a different buyer can claim",async()=>{
      await savePayment(one,{status:'DECLINED',captureId:'CAPTURE1'},sql);
      await claimStock(two,sql);
      await savePayment(one,{status:'DECLINED',captureId:'CAPTURE1'},sql);
      const [stock]=await sql`select * from art_shop.stock where environment='sandbox'`;
      assert.equal(stock.claimed_order,two.id);
    });
    await t.test("payment belonging to another stock owner cannot mark this work sold",async()=>{
      await assert.rejects(savePayment(one,{status:'COMPLETED',captureId:'CAPTURE1'},sql));
      const [stock]=await sql`select * from art_shop.stock where environment='sandbox'`;
      assert.equal(stock.sold,false);assert.equal(stock.claimed_order,two.id);
    });
    await t.test("completed capture is idempotent and stale pending events cannot undo it",async()=>{
      await savePayment(two,{status:'COMPLETED',captureId:'CAPTURE2'},sql);
      await savePayment(two,{status:'COMPLETED',captureId:'CAPTURE2'},sql);
      await savePayment(two,{status:'PENDING',captureId:'CAPTURE2'},sql);
      const [stock]=await sql`select * from art_shop.stock where environment='sandbox'`;
      assert.equal(stock.sold,true);
      const [order]=await sql`select status from art_shop.orders where id=${two.id}`;
      assert.equal(order.status,'COMPLETED');
    });
    await t.test("refund does not automatically put a physical original back on sale",async()=>{
      await savePayment(two,{status:'REFUNDED',captureId:'CAPTURE2'},sql);
      await savePayment(two,{status:'COMPLETED',captureId:'CAPTURE2'},sql);
      const [order]=await sql`select status from art_shop.orders where id=${two.id}`;
      assert.equal(order.status,'REFUNDED');
      await assert.rejects(claimStock(one,sql));
      const [stock]=await sql`select * from art_shop.stock where environment='sandbox'`;
      assert.equal(stock.sold,true);
    });
  } finally {await pg.close();}
});
