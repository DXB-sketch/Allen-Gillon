import Link from "next/link";
import { notFound } from "next/navigation";
import legal from "../../../content/legal.config.json";
import { LEGAL_UPDATED, SUPPORT_EMAIL, legalRouteVisible } from "../../../lib/legal.mjs";
import { pageMetadata } from "../../../lib/seo.mjs";
import { breadcrumbs, jsonLdProps } from "../../../lib/schema.mjs";
import "../legal.css";

export const metadata = pageMetadata("main", "/privacy");

/* Privacy (/privacy), W7. Written to follow the Australian Privacy
   Principles (APPs). Unpublished until the human signs off the wording:
   while content/legal.config.json says published: false this page 404s on
   both hosts. Every fact still to be checked is listed in LEGAL-TODO.md. */

const mail = <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>;

const CRUMBS = breadcrumbs([{ name: "Home", url: "/" }, { name: "Privacy" }], "main");

export default function PrivacyPage() {
  if (!legalRouteVisible("/privacy", legal)) notFound();
  return (
    <div>
      <script {...jsonLdProps(CRUMBS)} />
      <header className="pagehead band">
        <h1 className="script">Privacy</h1>
        <p className="plain">
          How Allen Gillon&rsquo;s websites collect, use and look after your personal information.
        </p>
      </header>
      <section className="legal-body band">
        <div className="prose measure">
          <h2>Who we are</h2>
          <p>
            This policy covers allengillon.com and More on Allen (other.allengillon.com). Allen Gillon runs both
            websites from Bribie Island, Queensland. Ann Gillon sells her paintings through More on Allen. In this
            policy &ldquo;we&rdquo; means Allen and Ann.
          </p>
          <p>
            We follow the Australian Privacy Principles in the Privacy Act 1988. We collect only what we need, and we
            never sell or rent your details.
          </p>

          <h2>What we collect and why</h2>
          <h3>Reviews</h3>
          <p>
            The review form on the reviews page asks for your name, where you heard Allen (optional) and your review.
            It is saved in a database run by Cloudflare. Nothing appears on the site until Allen approves it. An
            approved review is shown publicly with the name and place you gave. You can use a first name or a
            nickname.
          </p>
          <h3>Comments by text message</h3>
          <p>
            The comment page does not send anything to the website. It opens your phone&rsquo;s messages app with your
            comment ready to send to Allen. If you send it, Allen receives it like any other text message.
          </p>
          <h3>Email</h3>
          <p>
            Mail to {mail} is forwarded by Cloudflare Email Routing to Allen&rsquo;s personal email account, which is
            provided by Google (Gmail). Allen uses your email only to reply to you.
          </p>
          <h3>Buying a painting or a play script</h3>
          <p>
            Payments are made through Stripe&rsquo;s secure checkout. Stripe collects your name, email address and card
            details, and for paintings your delivery address. We receive your name, email address, delivery address
            and what you bought, so that Ann can deliver a painting and Allen can email a play script. We never see or
            store your full card details.
          </p>
          <h3>Visiting the websites</h3>
          <p>
            Cloudflare hosts both websites. Like any web host, it processes your IP address, browser details and the
            pages you ask for, to deliver the pages and protect the sites from attack. We keep short-lived technical
            logs so that faults can be found and fixed. We do not use analytics or advertising tools, and we do not
            build a profile of you.
          </p>
          <h3>YouTube videos</h3>
          <p>
            Some songs are YouTube videos. Nothing loads from YouTube until you press play. When you do, the video is
            loaded from YouTube&rsquo;s privacy-enhanced service (youtube-nocookie.com), and Google receives your IP
            address and device details and may store information on your device, under{" "}
            <a href="https://policies.google.com/privacy">Google&rsquo;s privacy policy</a>.
          </p>
          <h3>Facebook</h3>
          <p>
            Our Facebook links are plain links. Nothing is loaded from Facebook unless you follow one.
          </p>
          <h3>Listen to this page</h3>
          <p>
            The &ldquo;Listen&rdquo; button uses the speech voice built into your browser or device. The website does
            not send the page text anywhere, although some browsers use online voices supplied by the browser maker.
          </p>

          <h2>Cookies</h2>
          <p>
            We do not use advertising or analytics cookies, so there is no cookie banner. Cloudflare may set a strictly
            necessary security cookie to tell people from automated attacks. Your player position is remembered only
            while the page is open.
          </p>

          <h2>Who we share it with</h2>
          <p>
            We share personal information only with the services that run the websites and payments (Cloudflare,
            Stripe and Google, as described above), with a delivery company when a painting is sent, or when the law
            requires it.
          </p>

          <h2>Sending information overseas</h2>
          <p>
            Some of these services store or process information outside Australia. Under Australian Privacy Principle
            8 we tell you where:
          </p>
          <ul>
            <li>Cloudflare, Inc. (United States, with data centres worldwide): hosting, the reviews database, logs and email forwarding.</li>
            <li>Stripe (Stripe Payments Australia Pty Ltd, with processing by Stripe, Inc. in the United States and other countries): payments.</li>
            <li>Google LLC (United States and other countries): YouTube videos you choose to play, and Allen&rsquo;s email.</li>
          </ul>
          <p>
            Each of these companies has its own privacy policy and security measures. By using the review form,
            emailing us or buying something, you agree to your information being handled by them in these countries.
          </p>

          <h2>How long we keep it and how we protect it</h2>
          <p>
            We keep a review until you ask us to remove it, and order details for as long as Australian tax law
            requires. We rely on the security of Cloudflare, Stripe and Google, and only Allen can approve or remove
            reviews.
          </p>

          <h2>Children under 15</h2>
          <p>
            Our stories and plays are written for young readers, but the review form and checkout are meant for
            adults. If you are under 15, please ask a parent, guardian or teacher before sending a review or buying
            anything. If you think a child under 15 has sent us personal information, email {mail} and we will delete
            it.
          </p>

          <h2>Seeing or correcting your information</h2>
          <p>
            You can ask to see the personal information we hold about you, correct it, or have a review removed. Email{" "}
            {mail}. We will reply within 30 days.
          </p>

          <h2>Questions and complaints</h2>
          <p>
            Please email {mail} first. If you are not happy with our reply, you can complain to the Office of the
            Australian Information Commissioner at <a href="https://www.oaic.gov.au">oaic.gov.au</a>.
          </p>
          <p>
            How we sell paintings and scripts is set out in the <Link prefetch={false} href="/terms">terms of sale</Link>.
          </p>

          <p className="legal-updated">Last updated {LEGAL_UPDATED}.</p>
        </div>
      </section>
    </div>
  );
}
