// Read PayPal's current state for held orders. Never initiate or repeat a capture.
import { database } from "../lib/shop-db.mjs";
import { shopConfig } from "../lib/shop-config.mjs";
import { reconcilePayment } from "../lib/shop-service.mjs";
const db = database();
try {
  const rows = await db`select * from art_shop.orders where environment = ${shopConfig().mode}
    and status in ('CAPTURING','PENDING') and paypal_order_id is not null`;
  for (const order of rows) {
    try {
      const {payment} = await reconcilePayment(order);
      console.log(`${order.id}: ${payment.status}${payment.status === "UNPAID" ? " (stock remains held; manual review required)" : ""}`);
    } catch {console.error(`${order.id}: unable to reconcile; stock remains held`);process.exitCode=1;}
  }
} finally {await db.end();}
