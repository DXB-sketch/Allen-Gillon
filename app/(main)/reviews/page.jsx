import Link from "next/link";
import FriendlyReviewForm from "../../../components/FriendlyReviewForm";
import "./reviews.css";

export const metadata = {
  title: "Friendly reviews",
  description: "Comments from people who have heard Allen Gillon play around Bribie Island.",
};

const tableComments = [
  "Beautiful.",
  "Unforgettable.",
  "I love Al’s light jazz.",
  "Pour me another glass.",
];

export default function ReviewsPage() {
  return (
    <main>
      <header className="reviewsHead pagehead band">
        <h1 className="script">Friendly reviews</h1>
        <p className="intro">Comments from people who have heard Allen play around Bribie Island.</p>
      </header>

      <section className="reviewsBody band" aria-label="Friendly reviews">
        <article className="featuredReview">
          <p className="reviewPlace">Banksia Beach Art Centre Cafe</p>
          <blockquote>
            <p>Popped into the Banksia Beach Art Centre Cafe last Tuesday for their delicious coffee and cakes. Not only did I get that, but was also entertained by solo guitarist Allen Gillon, playing some terrific instrumental music, oldies but goodies. Thoroughly enjoyed it all.</p>
            <cite>Jan Hanson</cite>
          </blockquote>
        </article>

        <section className="tableComments" aria-labelledby="table-comments-title">
          <h2 id="table-comments-title">Heard between courses</h2>
          <ul>
            {tableComments.map((comment) => (
              <li key={comment}>&ldquo;{comment}&rdquo;</li>
            ))}
          </ul>
        </section>

        <FriendlyReviewForm />

        <Link className="reviewsBack" href="/">
          <span aria-hidden="true">&#8592;</span> Back home
        </Link>
      </section>
    </main>
  );
}
