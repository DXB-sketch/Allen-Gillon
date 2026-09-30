import Link from "next/link";
import HireSpotlight from "../../../components/illustrations/HireSpotlight";
import { pageMetadata } from "../../../lib/seo.mjs";
import { breadcrumbs, jsonLdProps } from "../../../lib/schema.mjs";
import "./hire.css";

export const metadata = pageMetadata("main", "/hire");

// bookingService() is already in the layout's site graph.
const JSON_LD = breadcrumbs([{ name: "Home", url: "/" }, { name: "Bookings" }], "main");

const FACEBOOK = "https://www.facebook.com/people/Allen-Gillon/100011388424486/";

const DINERS = ["Beautiful.", "Unforgettable.", "I love Al’s light jazz.", "Pour me another glass."];

export default function HirePage() {
  return (
    <main className="hire">
      <script {...jsonLdProps(JSON_LD)} />
      <header className="pagehead band">
        <h1 className="script">Bookings</h1>
        <p className="plain">Light jazz guitar for restaurants where people are eating, drinking and enjoying themselves. Allen has been doing exactly this for many years, and he still loves a full diary.</p>
      </header>

      {/* The page's one primary thing: the number to text. TODO(human): add a
          tel: link here only once Allen confirms he takes phone calls. */}
      <section id="booking" className="book-band band ink" aria-labelledby="book-a-date">
        <h2 className="script" id="book-a-date">Book a date</h2>
        <HireSpotlight className="spotlight spotlight--across" aim="across" ground="ink" draw />
        <HireSpotlight className="spotlight spotlight--down" aim="down" ground="ink" offset={5} draw />
        <div className="phones">
          <a className="sms" href="sms:+61438747882">
            <span className="sms-verb">Text</span> <span className="sms-number">0438 747 882</span>
          </a>
          <p>Speak with Allen directly. Tell him the date and venue you have in mind. You can also reach <a href={FACEBOOK} target="_blank" rel="noopener">Allen on Facebook</a>.</p>
        </div>
      </section>

      <section className="hire-offers band" aria-label="What Allen plays">
        <ul className="offer">
          <li>
            <h2>Restaurant guitarist</h2>
            <p>Allen plays solo jazz guitar on the Trini Lopez Gibson he bought in Parramatta in 1967. He knows more than 300 melodies and keeps the volume comfortable for dinner. Many of the backing tracks are his own arrangements. Listen to &ldquo;Desafinado&rdquo; and &ldquo;Take Five&rdquo; on <Link href="/music">the albums page</Link>.</p>
          </li>
          <li>
            <h2>Functions and events</h2>
            <p>Allen plays weddings, anniversaries, club nights and private parties around Bribie Island, Brisbane and the Sunshine Coast. Tell him about the occasion and he will shape the set around it.</p>
          </li>
        </ul>
        <img
          className="gx-hero"
          src="/images/personal/allen-playing-chandler-theatre.jpg"
          alt="Allen in a pale jacket playing his red Gibson on a dark stage, one hand raised at the end of a strum"
          width="670"
          height="607"
          loading="lazy"
          decoding="async"
        />
      </section>

      <section className="diners band" aria-labelledby="diners-say">
        <h2 id="diners-say">Heard between courses</h2>
        <ul>
          {DINERS.map((line) => (
            <li key={line}>
              <span className="qm">&ldquo;</span>{line}<span className="qm">&rdquo;</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
