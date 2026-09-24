import Link from "next/link";

export const metadata = {
  title: "Reviews · Allen Gillon",
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
    <>
      <style>{String.raw`
        .reviewsHead{padding:52px 0 34px;border-bottom:var(--rule);}
        .reviewsHead .eyebrow{margin:0 0 4px;color:var(--blue);font-size:.76rem;font-weight:700;letter-spacing:.11em;text-transform:uppercase;}
        .reviewsHead h1{margin:0;color:var(--red);}
        .reviewsHead .intro{max-width:55ch;margin:13px 0 0;font-size:1.08rem;color:var(--soft);}
        .reviewsBody{padding:44px 0 70px;}
        .featuredReview{display:grid;grid-template-columns:minmax(150px,210px) minmax(0,1fr);gap:clamp(24px,6vw,76px);padding-bottom:44px;border-bottom:var(--rule);}
        .reviewPlace{margin:4px 0 0;color:var(--blue);font-size:.76rem;font-weight:700;line-height:1.45;letter-spacing:.09em;text-transform:uppercase;}
        .featuredReview blockquote{position:relative;margin:0;padding-left:42px;max-width:760px;}
        .featuredReview blockquote::before{content:"“";position:absolute;left:0;top:-24px;color:var(--red);font-family:Georgia,serif;font-size:5rem;line-height:1;}
        .featuredReview blockquote p{margin:0;font-size:clamp(1.15rem,2vw,1.45rem);line-height:1.65;}
        .featuredReview cite{display:block;margin-top:16px;color:var(--soft);font-size:.96rem;font-style:normal;font-weight:700;}
        .tableComments{display:grid;grid-template-columns:minmax(150px,210px) minmax(0,1fr);gap:clamp(24px,6vw,76px);padding:42px 0;}
        .tableComments h2{margin:0;color:var(--ink);font-size:1.08rem;line-height:1.4;}
        .tableComments ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 clamp(24px,6vw,70px);list-style:none;margin:0;padding:0;}
        .tableComments li{padding:0 0 14px;margin:0 0 14px;border-bottom:1px solid oklch(.22 .02 300 / .18);font-size:1.08rem;font-style:italic;}
        .reviewsBack{display:inline-flex;align-items:center;gap:8px;color:var(--blue);font-weight:700;text-decoration:none;}
        .reviewsBack:hover{text-decoration:underline;text-underline-offset:4px;}
        @media (max-width:680px){
          .reviewsHead{padding:38px 0 28px;}
          .reviewsBody{padding-top:32px;}
          .featuredReview,.tableComments{grid-template-columns:1fr;gap:18px;}
          .featuredReview blockquote{padding-left:32px;}
          .tableComments ul{grid-template-columns:1fr;}
        }
      `}</style>
      <main>
        <header className="reviewsHead">
          <div className="wrap">
            <p className="eyebrow">In their own words</p>
            <h1 className="script">Reviews</h1>
            <p className="intro">Comments from people who have heard Allen play around Bribie Island.</p>
          </div>
        </header>

        <section className="reviewsBody" aria-label="Audience reviews">
          <div className="wrap">
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

            <Link className="reviewsBack" href="/">
              <span aria-hidden="true">&#8592;</span> Back home
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
