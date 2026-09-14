import Link from "next/link";
export const metadata = {title:"Delivery and payment · Ann Gillon"};
export default function DeliveryPage() {
  return <main className="wrap checkout-wrap"><h1 className="script">Delivery & payment</h1><div className="prose">
    <h2>Original paintings</h2><p>Each painting is a one-off original by Ann Gillon. All prices are in Australian dollars. Extra photographs show another view of the same work, not another copy.</p>
    <h2>Free delivery in Australia</h2><p>Delivery within Australia is included in the displayed price. Online checkout accepts Australian delivery addresses only. Please contact Allen before ordering if you need to discuss a delivery date, framing or the dimensions of a painting.</p>
    <h2>PayPal payments</h2><p>When online checkout is available, PayPal handles your payment details. You will return to this site to review the painting, total and Australian delivery address before confirming payment. Your purchase is confirmed only when the payment is complete.</p>
    <h2>Your details</h2><p>PayPal receives your payment and delivery details. The website uses a checkout cookie to keep your payment review private and stores the painting, amount, payment references and payment status. Allen uses the delivery details in PayPal to fulfil your order. Card details are not stored on this website.</p>
    <h2>Questions or a problem with your order</h2><p><a href="sms:+61438747882">Text Allen on 0438 747 882</a> with the painting title and payment reference. Please contact him promptly about delivery damage or any issue with the painting.</p>
    <p><Link href="/anns-art">Back to Ann's paintings</Link></p></div></main>;
}
