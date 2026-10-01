import Link from "next/link";
import CrossSiteLink from "../../../components/CrossSiteLink";
import legal from "../../../content/legal.config.json";
import { SMS_DISPLAY, SMS_NUMBER, SUPPORT_EMAIL, isLegalPublished } from "../../../lib/legal.mjs";
import { pageMetadata } from "../../../lib/seo.mjs";
import { breadcrumbs, jsonLdProps } from "../../../lib/schema.mjs";
import "./delivery.css";

// Ann Gillon sells the paintings, so this page names her as the seller.
export const metadata = pageMetadata("other", "/delivery");

const CRUMBS = breadcrumbs([{ name: "Home", url: "/" }, { name: "Ann Gillon", url: "/anns-art" }, { name: "Delivery and payment" }], "other");

export default function DeliveryPage() {
  const termsPublished = isLegalPublished(legal);
  return (
    <div>
      <script {...jsonLdProps(CRUMBS)} />
      <header className="pagehead band">
        <h1 className="script">Delivery & payment</h1>
      </header>
      <section className="delivery-body band">
        <div className="prose measure">
          <h2>Original paintings</h2>
          <p>
            Each painting is a one-off original by Ann Gillon, and Ann is the seller. All prices are in Australian
            dollars. Extra photographs show another view of the same work, not another copy.
          </p>
          <h2>Free delivery in Australia</h2>
          <p>
            Delivery within Australia is included in the displayed price. Online checkout accepts Australian delivery
            addresses only. Please contact Allen before ordering if you need to discuss a delivery date, framing or the
            dimensions of a painting.
          </p>
          <h2>Stripe payments</h2>
          <p>
            Online purchases use Stripe&rsquo;s secure checkout. Stripe handles the payment and delivery details. Card
            details are not stored on this website.
          </p>
          <h2>Buying online</h2>
          <p>
            Available paintings can be bought from <Link prefetch={false} href="/anns-art">Ann&rsquo;s Art Room</Link>. Stripe collects
            payment and the Australian delivery address. Because every painting is an original, its checkout closes
            after the first completed purchase.
          </p>
          <h2>Questions or a problem with your order</h2>
          <p>
            Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> or{" "}
            <a href={`sms:${SMS_NUMBER}`}>text Allen on {SMS_DISPLAY}</a> with the painting title and payment
            reference. If a painting arrives damaged, please get in touch within 7 days of delivery and include photos
            of the painting and its packaging.
          </p>
          {termsPublished ? (
            <p>
              Refunds, returns and your rights under the Australian Consumer Law are set out in the{" "}
              <CrossSiteLink site="main" path="/terms">terms of sale</CrossSiteLink>.
            </p>
          ) : null}
          <p>
            <Link prefetch={false} href="/anns-art">Back to Ann&rsquo;s paintings</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
