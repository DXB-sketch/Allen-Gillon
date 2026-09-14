"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { formatPrice } from "../lib/art-catalog.mjs";
export default function PaymentReview({token}) {
  const [details,setDetails] = useState(null);
  const [busy,setBusy] = useState(true);
  const [error,setError] = useState("");
  async function load(capture = false) {
    setBusy(true);setError("");
    try {
      const response = await fetch(`/api/paypal/orders/${encodeURIComponent(token)}`,{method:capture?"POST":"GET",cache:"no-store"});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setDetails(result);
    } catch(e) {setError(e.message || "We could not check your payment. Please try again.");} finally {setBusy(false);}
  }
  useEffect(()=>{if(token) load();else {setError("No checkout reference was supplied. Please return to the gallery.");setBusy(false);}},[token]);
  const complete = details?.status === "COMPLETED";
  const refunded = ["REFUNDED","PARTIALLY_REFUNDED"].includes(details?.status);
  const failed = ["DECLINED","FAILED"].includes(details?.status);
  const approved = details?.status === "APPROVED";
  return <div className="payment-review" aria-busy={busy}>
    <h1 className="script">{complete ? "Thank you" : refunded ? "Payment update" : "Review your painting"}</h1>
    {busy ? <p role="status">{details ? "Checking your payment. Please keep this page open…" : "Loading checkout details…"}</p> : null}
    {error ? <p className="checkout-error" role="alert">{error}</p> : null}
    {details ? <>
      {details.sandbox ? <p className="checkout-notice">This is a sandbox test. No real money was taken.</p> : null}
      <h2>{details.title}</h2><p className="painting-price">{formatPrice(details.amountCents)}</p>
      {complete ? <p role="status">Your payment is complete and this original is now marked sold. Keep your payment reference below. Allen will arrange delivery to the address confirmed in PayPal.</p> :
        refunded ? <p>This payment has been {details.status === "REFUNDED" ? "refunded" : "partially refunded"}. Please contact Allen for details.</p> :
        failed ? <p>PayPal did not complete this payment. Please contact Allen before trying again.</p> :
        !approved ? <p>Your payment is not yet confirmed. Do not start another purchase for this painting. Check the payment status again, or contact Allen.</p> :
        <p>Review your delivery address, then confirm the payment below. Delivery within Australia is free.</p>}
      <div className="checkout-address"><h3>Delivery address</h3><address>{details.shipping.name.full_name}<br />{details.shipping.address.address_line_1}<br />
        {details.shipping.address.address_line_2 ? <>{details.shipping.address.address_line_2}<br /></> : null}
        {[details.shipping.address.admin_area_2,details.shipping.address.admin_area_1,details.shipping.address.postal_code].filter(Boolean).join(" ")}<br />Australia</address></div>
      <p>Reference: <strong>{details.reference}</strong></p>
      {approved ? <button type="button" className="btn paypal-button" disabled={busy} onClick={()=>load(true)}>Confirm and pay {formatPrice(details.amountCents)}</button> : null}
    </> : null}
    {token && !complete && !refunded ? <p><button className="checkout-refresh" type="button" disabled={busy} onClick={()=>load()}>Check payment status again</button></p> : null}
    <p><Link href={details ? `/anns-art#${details.artId}` : "/anns-art"}>Back to Ann's paintings</Link></p>
    <p className="checkout-help">Need help? <a href="sms:+61438747882">Text Allen on 0438 747 882</a> with your payment reference.</p>
  </div>;
}
