import Link from "next/link";
export const metadata = {title:"Checkout cancelled · Ann Gillon",robots:{index:false,follow:false}};
export default function CancelPage() {
  return <main className="wrap checkout-wrap"><h1 className="script">Checkout cancelled</h1>
    <p>You have returned from PayPal without confirming payment here. You can return to the gallery whenever you like.</p>
    <p>If you had already confirmed a payment, check your PayPal activity or contact Allen before purchasing again.</p>
    <p><Link className="btn b" href="/anns-art">Back to Ann's paintings</Link></p></main>;
}
