import Link from "next/link";
import "./hire.css";

export const metadata = {
  title: "Bookings",
  description:
    "Book Allen Gillon to play guitar at your venue around Bribie Island and South East Queensland.",
};

export default function HirePage() {
  return (
    <main>
      <header className="pagehead band">
        <h1 className="script">Bookings</h1>
        <p className="plain">Light jazz guitar for restaurants where people are eating, drinking and enjoying themselves. Allen has been doing exactly this for many years, and he still loves a full diary.</p>
      </header>

      <section className="book-band band ink" aria-label="Bookings">
        <h2 className="script">Book a date</h2>
        <p>Speak with Allen directly. Tell him the date and venue you have in mind. You can also reach Allen on Facebook.</p>
        <div className="phones">
          <a href="sms:+61438747882">Text 0438 747 882</a>
          <a href="https://www.facebook.com/people/Allen-Gillon/100011388424486/" target="_blank" rel="noopener">Allen on Facebook</a>
        </div>
      </section>

      <section className="hire-offers band">
        <ul className="offer">
          <li>
            <span className="what">Restaurant guitarist</span>
            <span className="how">Allen plays solo jazz guitar on the Trini Lopez Gibson he bought in Parramatta in 1967. He knows more than 300 melodies and keeps the volume comfortable for dinner. Many of the backing tracks are his own arrangements. Listen to &ldquo;Desafinado&rdquo; and &ldquo;Take Five&rdquo; on <Link href="/music">the albums page</Link>.</span>
          </li>
          <li>
            <span className="what">Functions and events</span>
            <span className="how">Allen plays weddings, anniversaries, club nights and private parties around Bribie Island, Brisbane and the Sunshine Coast. Tell him about the occasion and he will shape the set around it.</span>
          </li>
        </ul>
        <img className="gx-hero" src="/images/personal/allen-playing-red-gibson-waterfront.jpg" alt="Allen playing his red Gibson on the waterfront" loading="lazy" />
      </section>

      <section className="diners band" aria-label="What diners say">
        <p>Heard between courses: &ldquo;Beautiful.&rdquo; &ldquo;Unforgettable.&rdquo; &ldquo;I love Al&rsquo;s light jazz.&rdquo; &ldquo;Pour me another glass.&rdquo;</p>
      </section>
    </main>
  );
}
