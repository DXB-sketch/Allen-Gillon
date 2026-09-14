import fs from "node:fs/promises";
import { database } from "../lib/shop-db.mjs";
import { artworks } from "../content/artworks.mjs";

const db = database();
try {
  await db.unsafe(await fs.readFile(new URL("../db/shop.sql",import.meta.url),"utf8"));
  for (const environment of ["sandbox","live"]) {
    for (const art of artworks.filter(a=>a.availability === "available")) {
      await db`insert into art_shop.stock (product_id, environment) values (${art.id},${environment}) on conflict do nothing`;
    }
  }
  console.log("Shop tables ready. Existing sold and held stock was preserved.");
} finally { await db.end(); }
