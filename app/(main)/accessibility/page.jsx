import { notFound } from "next/navigation";
import Link from "next/link";
import legal from "../../../content/legal.config.json";
import { LEGAL_UPDATED, SMS_DISPLAY, SMS_NUMBER, SUPPORT_EMAIL, legalRouteVisible } from "../../../lib/legal.mjs";
import { pageMetadata } from "../../../lib/seo.mjs";
import "../legal.css";

export const metadata = pageMetadata("main", "/accessibility");

/* Accessibility statement (/accessibility), W7. Published with the other
   legal pages (content/legal.config.json). Keep the "known limits" list
   honest: update it when a limit is fixed or a new one is found. */

const mail = <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>;

export default function AccessibilityPage() {
  if (!legalRouteVisible("/accessibility", legal)) notFound();
  return (
    <div>
      <header className="pagehead band">
        <h1 className="script">Accessibility</h1>
        <p className="plain">
          Allen&rsquo;s websites are built so that everyone can read, listen and find their way around.
        </p>
      </header>
      <section className="legal-body band">
        <div className="prose measure">
          <h2>Our aim</h2>
          <p>
            This statement covers allengillon.com and More on Allen (other.allengillon.com). We aim to meet the Web
            Content Accessibility Guidelines (WCAG) 2.2 at level AA, and to go further where it helps older readers.
          </p>

          <h2>What we have done</h2>
          <ul>
            <li>Large type: body text is 20 pixels, and nothing you need to read is smaller than 16 pixels.</li>
            <li>Strong contrast: body text is at least 7 to 1 against the paper colour.</li>
            <li>Every page works with a keyboard, with a clear blue outline showing where you are, and a &ldquo;Skip to content&rdquo; link.</li>
            <li>Buttons and links are at least 44 pixels high, so they are easy to tap.</li>
            <li>Nothing important appears only when you hover with a mouse.</li>
            <li>If your device asks for reduced motion, the drawings and pages stay still.</li>
            <li>Pages still work when zoomed to 200 per cent.</li>
            <li>Our own videos have captions, and every audiobook has a text version beside it.</li>
            <li>The &ldquo;Listen&rdquo; button at the top of each page reads the page aloud.</li>
            <li>Pictures that carry meaning have text descriptions. Decorative drawings are hidden from screen readers.</li>
          </ul>

          <h2>How we check</h2>
          <p>
            We test every page with automated checkers (axe and pa11y), with a keyboard alone, and at phone and wide
            screen sizes.
          </p>

          <h2>Known limits</h2>
          <ul>
            <li>
              The <Link href="/music#originals">original song videos</Link> are on YouTube, so their captions depend
              on YouTube.
            </li>
            <li>The captions on the Timeless videos describe the music. Sung words there are still being checked with Allen and Ann.</li>
            <li>Some older photos and scanned book pages are low resolution. The stories also have a text only version.</li>
          </ul>

          <h2>Tell us if something gets in the way</h2>
          <p>
            If any part of these websites is hard to use, please let us know and we will fix it or send you the
            information another way. Email {mail}, or <a href={`sms:${SMS_NUMBER}`}>text Allen on {SMS_DISPLAY}</a>.
          </p>

          <p className="legal-updated">Last updated {LEGAL_UPDATED}.</p>
        </div>
      </section>
    </div>
  );
}
