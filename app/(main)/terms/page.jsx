import Link from "next/link";
import { notFound } from "next/navigation";
import CrossSiteLink from "../../../components/CrossSiteLink";
import legal from "../../../content/legal.config.json";
import { LEGAL_UPDATED, SMS_DISPLAY, SMS_NUMBER, SUPPORT_EMAIL, legalRouteVisible } from "../../../lib/legal.mjs";
import { pageMetadata } from "../../../lib/seo.mjs";
import { breadcrumbs, jsonLdProps } from "../../../lib/schema.mjs";
import "../legal.css";

export const metadata = pageMetadata("main", "/terms");

/* Terms of sale (/terms), W7. The refund wording follows the DECISIONS in
   the redesign plan exactly: no change-of-mind refunds, and repair,
   replacement or refund wherever the Australian Consumer Law requires it.
   It must never refuse refunds outright (tests/legal.test.mjs checks).
   Unpublished until the human signs off; see LEGAL-TODO.md. */

const mail = <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>;

const CRUMBS = breadcrumbs([{ name: "Home", url: "/" }, { name: "Terms of sale" }], "main");

export default function TermsPage() {
  if (!legalRouteVisible("/terms", legal)) notFound();
  return (
    <div>
      <script {...jsonLdProps(CRUMBS)} />
      <header className="pagehead band">
        <h1 className="script">Terms of sale</h1>
        <p className="plain">
          What to expect when you buy one of Ann&rsquo;s paintings or one of Allen&rsquo;s play scripts.
        </p>
      </header>
      <section className="legal-body band">
        <div className="prose measure">
          <h2>Who sells what</h2>
          <ul>
            <li>
              <strong>Ann Gillon</strong> sells her original paintings, shown on{" "}
              <CrossSiteLink site="other" path="/anns-art">Ann&rsquo;s Art Room</CrossSiteLink>.
            </li>
            <li>
              <strong>Allen Gillon</strong> sells the school play scripts (PDF files) and everything else sold on
              allengillon.com and other.allengillon.com.
            </li>
          </ul>
          <p>
            Allen and Ann live on Bribie Island, Queensland. You can reach either of them at {mail}.
          </p>

          <h2>Prices and payment</h2>
          <p>
            All prices are in Australian dollars. Payment is made through Stripe&rsquo;s secure checkout, which accepts
            the usual cards. Stripe handles your card details; we never see or store them. Your order is accepted when
            the checkout is complete and Stripe confirms payment.
          </p>

          <h2>Your rights under the Australian Consumer Law</h2>
          <div className="legal-acl">
            <p>
              Our goods come with guarantees that cannot be excluded under the Australian Consumer Law. You are
              entitled to a replacement or refund for a major failure and compensation for any other reasonably
              foreseeable loss or damage. You are also entitled to have the goods repaired or replaced if the goods
              fail to be of acceptable quality and the failure does not amount to a major failure.
            </p>
          </div>
          <p>Nothing in these terms takes away those rights.</p>

          <h2>Refunds and returns</h2>
          <p>
            We do not give refunds for a change of mind, for example if you decide you no longer want a painting or
            you chose the wrong play.
          </p>
          <p>
            Where the Australian Consumer Law requires it, we will repair, replace or refund. For example, when:
          </p>
          <ul>
            <li>a painting is damaged or destroyed in transit</li>
            <li>a painting is faulty or not as described</li>
            <li>a play script file is corrupt, incomplete or never arrives</li>
          </ul>
          <p>
            If a painting arrives damaged, please email {mail} within 7 days of delivery, with photos of the painting
            and its packaging. The photos help us put things right quickly and claim from the carrier. Telling us
            later does not take away your rights under the Australian Consumer Law.
          </p>

          <h2>Play scripts (PDF)</h2>
          <p>
            After you pay, Allen emails the PDF to the email address you used at checkout. If it has not arrived
            within two days (check your junk mail folder too), or the file will not open or is incomplete, email{" "}
            {mail} with your payment reference. Allen will send a working copy, or refund you if he cannot.
          </p>
          <p>
            You can read the first pages of every play online before you buy it, on the{" "}
            <CrossSiteLink site="other" path="/books#school-plays">school plays shelf</CrossSiteLink>.
          </p>

          <h2>Performing a play</h2>
          <p>
            Buying a script lets you read and print it for your own school, class or group. The terms for performing
            a play in front of an audience, including school productions, are still being settled. Until they are
            published here, please email {mail} before you stage a performance, and Allen will tell you what applies.
          </p>

          <h2>Original paintings</h2>
          <p>
            Each painting is a one-off original by Ann Gillon. The photos show the painting as closely as we can, but
            colours can look a little different on different screens. Ask us for more photos or the size before you
            buy if it matters to you.
          </p>
          <p>
            Delivery within Australia is included in the price. The checkout accepts Australian delivery addresses
            only. The painting is your responsibility once it has been delivered. If a painting sells to someone else
            at the same moment you pay, we will refund you in full. More detail is on the{" "}
            <CrossSiteLink site="other" path="/delivery">delivery and payment page</CrossSiteLink>.
          </p>

          <h2>Copyright</h2>
          <p>
            Allen&rsquo;s words, music, recordings, stories and plays are &copy; Allen Gillon. Ann&rsquo;s paintings,
            and the photos of them, are &copy; Ann Gillon. Buying a painting gives you the painting, not the right to
            reproduce it. The albums and original songs are for your own listening. Please ask before copying, sharing, selling or
            broadcasting anything from these websites.
          </p>

          <h2>Your privacy</h2>
          <p>
            How we handle your details is explained in the <Link prefetch={false} href="/privacy">privacy policy</Link>.
          </p>

          <h2>Contact</h2>
          <p>
            Email {mail}, or <a href={`sms:${SMS_NUMBER}`}>text Allen on {SMS_DISPLAY}</a>. These terms are governed by
            the law of Queensland, Australia.
          </p>

          <p className="legal-updated">Last updated {LEGAL_UPDATED}.</p>
        </div>
      </section>
    </div>
  );
}
