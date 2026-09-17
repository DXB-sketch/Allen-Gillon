import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div>
          <div className="fscript">Allen Gillon</div>
          <p>Bribie Island, Queensland</p>
          <p>
            <a href="sms:+61438747882">Text 0438 747 882</a>
          </p>
        </div>
        <nav aria-label="Footer">
          <Link href="/">Home</Link>
          <Link href="/music">Albums</Link>
          <Link href="/biography">Timeless</Link>
          <Link href="/hire">Bookings</Link>
          <Link href="/books">eBooks</Link>
          <Link href="/anns-art">Ann Gillon</Link>
          <a
            className="fb"
            href="https://www.facebook.com/people/Allen-Gillon/100011388424486/"
            target="_blank"
            rel="noopener"
          >
            Facebook
          </a>
          <a
            className="yt"
            href="https://www.youtube.com/watch?v=6idFN_r1Dlw"
            target="_blank"
            rel="noopener"
          >
            YouTube
          </a>
        </nav>
        <p>&copy; 2026 Allen Gillon</p>
      </div>
    </footer>
  );
}
