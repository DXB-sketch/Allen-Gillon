import Link from "next/link";
import "./home.css";

export const metadata = {
  title: { absolute: "Allen Gillon" },
  description:
    "Allen Gillon is a guitarist from Bribie Island, Queensland. Listen to his albums or book him for a venue.",
};

export default function Page() {
  return (
    <main>
      <header className="home-hero band">
        <h1 className="script">Allen Gillon</h1>
        <div className="home-photos">
          <div className="photoCollage" data-reader-skip>
            <img
              className="mainPhoto"
              src="/images/personal/allen-playing-red-gibson-waterfront.jpg"
              alt="Allen playing his red Gibson on the Bribie Island waterfront"
            />
            <img className="photoThree" src="/images/personal/current-allen-and-ann-bribie-cap.jpg" alt="Allen and Ann wearing sunglasses at Bribie Island" />
          </div>
          <ul className="venues" aria-label="Venues where Allen has played">
            <li>Serenity Cafe</li>
            <li>Sunset Pier Cafe</li>
            <li>Cafe 191</li>
            <li>Coffee Club</li>
            <li>Steakout Restaurant</li>
            <li>The Jetty</li>
            <li>Bowls Club</li>
            <li>Sandstone Tavern</li>
          </ul>
        </div>
        <div className="home-doors">
          <ol className="idx">
            <li>
              <span className="no">1</span>
              <span className="idx-art">
                <img
                  src="/images/personal/promo-allen-gillon-guitarist-gibson.jpg"
                  alt=""
                />
              </span>
              <Link href="/hire">
                Bookings{" "}
                <small>
                  Solo guitar for restaurants and private bookings
                </small>
              </Link>
            </li>
            <li>
              <span className="no">2</span>
              <span className="idx-art">
                <img
                  src="/images/albums/album-thats-the-time.jpg"
                  alt="That's The Time album cover"
                />
              </span>
              <Link href="/music">
                Listen Free{" "}
                <small>
                  Four albums to hear free, and his original songs
                </small>
              </Link>
            </li>
          </ol>
          <p className="heroIntro">
            Allen plays smooth guitar in restaurants around Bribie Island. There is no microphone and no fuss, just his Gibson at a comfortable dinner volume. Diners have called the music &ldquo;beautiful&rdquo; and &ldquo;unforgettable&rdquo;.
          </p>
        </div>
      </header>

      <section className="home-quote band" aria-label="From the audience">
        <blockquote>
          <p>Popped into the Banksia Beach Art Centre Cafe last Tuesday for their delicious coffee and cakes. Not only did I get that, but was also entertained by solo guitarist Allen Gillon, playing some terrific instrumental music, oldies but goodies. Thoroughly enjoyed it all.</p>
          <cite>Jan Hanson</cite>
          <Link className="reviewsLink" href="/reviews">
            See Friendly reviews
          </Link>
        </blockquote>
      </section>
    </main>
  );
}
