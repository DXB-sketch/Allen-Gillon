import FriendlyReviewForm from "../../../components/FriendlyReviewForm";
import ReviewsCup from "../../../components/illustrations/ReviewsCup";
import ReviewsGlass from "../../../components/illustrations/ReviewsGlass";
import ApprovedReviews from "./ApprovedReviews";
import { pageMetadata } from "../../../lib/seo.mjs";
import { breadcrumbs, jsonLdProps } from "../../../lib/schema.mjs";
import "./reviews.css";

export const metadata = pageMetadata("main", "/reviews");

// Breadcrumbs only: never a Review or AggregateRating for Allen's own reviews.
const JSON_LD = breadcrumbs([{ name: "Home", url: "/" }, { name: "Reviews" }], "main");

const tableComments = [
  "Beautiful.",
  "Unforgettable.",
  "I love Al’s light jazz.",
  "Pour me another glass.",
];

// Order (W5): one large featured quote, the table comments as an unruled
// cluster, the approved reviews, then the form. Space separates the parts.
export default function ReviewsPage() {
  return (
    <div>
      <script {...jsonLdProps(JSON_LD)} />
      <header className="reviewsHead pagehead band">
        <h1 className="script">Friendly reviews</h1>
        <p className="intro">Comments from people who have heard Allen play around Bribie Island.</p>
      </header>

      <div className="reviewsBody band">
        <figure className="featuredReview">
          <blockquote>
            <p>Popped into the Banksia Beach Art Centre Cafe last Tuesday for their delicious coffee and cakes. Not only did I get that, but was also entertained by solo guitarist Allen Gillon, playing some terrific instrumental music, oldies but goodies. Thoroughly enjoyed it all.</p>
          </blockquote>
          <figcaption>
            <cite>Jan Hanson</cite>
            <span className="reviewPlace">Banksia Beach Art Centre Cafe</span>
          </figcaption>
          <ReviewsCup className="reviewsCup" draw />
        </figure>

        <section className="tableComments" aria-labelledby="table-comments-title">
          <h2 id="table-comments-title">Heard between courses</h2>
          <ReviewsGlass className="reviewsGlass" draw delay={200} />
          <ul>
            {tableComments.map((comment) => (
              <li key={comment}>&ldquo;{comment}&rdquo;</li>
            ))}
          </ul>
        </section>

        <ApprovedReviews />

        <FriendlyReviewForm />
      </div>
    </div>
  );
}
