"use client";
import { useRef,useState } from "react";
export default function PayPalCheckout({productId,enabled}) {
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const requestId = useRef(null);
  async function start() {
    if (busy) return;
    setBusy(true);setError("");requestId.current ||= crypto.randomUUID();
    try {
      const response = await fetch("/api/paypal/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({productId,requestId:requestId.current})});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      window.location.assign(result.approvalUrl);
    } catch(e) {setError(e.message || "Could not open PayPal. Please try again.");setBusy(false);}
  }
  if (!enabled) return <p>Online checkout is not available for this painting right now. <a href="sms:+61438747882">Text Allen</a> to enquire.</p>;
  return <div><button className="btn paypal-button" type="button" disabled={busy} onClick={start}>{busy ? "Opening PayPal…" : "Continue to PayPal"}</button>
    <p className="checkout-help">Choose an Australian delivery address in PayPal. You will return here to review the details and confirm payment.</p>
    {error ? <p role="alert" className="checkout-error">{error}</p> : null}</div>;
}
