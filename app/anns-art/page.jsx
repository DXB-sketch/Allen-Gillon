export const metadata = {
  title: "Ann's art · Allen Gillon",
  description:
    "Paintings by Ann Gillon: African Wild Dog, Arrow, Ghost Town and Kimberley Trail. Originals available — text Allen to enquire.",
};

/* Artworks carried over from the "Art By Ann" page of the old Wix site,
   including the prices listed there (AUD). */
const artworks = [
  {
    id: "african-wild-dog",
    title: "African Wild Dog",
    medium: "Acrylic",
    note: "Commissioned piece",
    price: "$600",
    src: "/images/art/african-wild-dog.png",
  },
  {
    id: "arrow",
    title: "Arrow",
    medium: "Watercolour",
    price: "$250",
    src: "/images/art/arrow.jpg",
  },
  {
    id: "ghost-town",
    title: "Ghost Town",
    medium: "Acrylic",
    price: "$295",
    src: "/images/art/ghost-town.jpg",
  },
  {
    id: "kimberley-trail",
    title: "Kimberley Trail",
    medium: "Acrylic",
    price: "$285",
    src: "/images/art/kimberley-trail.png",
  },
];

export default function AnnsArtPage() {
  return (
    <>
      <style>{`
  .artgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:44px;padding:16px 0 48px;}
  .artgrid figure{margin:0;}
  .artgrid img{width:100%;height:auto;display:block;border:3px solid var(--ink);border-radius:3px;background:#fff;}
  .artgrid figcaption{margin-top:10px;}
  .artgrid .atitle{font-size:1.3rem;font-weight:700;}
  .artgrid .ameta{color:var(--soft);font-size:1.05rem;}
  .artgrid .aprice{font-family:"Dynalight","Times New Roman",cursive;font-size:1.8rem;color:var(--red);line-height:1.1;margin-top:2px;}
  .artgrid figure:nth-child(even) .aprice{color:var(--blue);}
  @media (max-width:820px){.artgrid{grid-template-columns:1fr;gap:32px;}}
  @media (max-width:640px){
    .pagehead .plain{padding-left:12px;padding-right:4px;}
    .artgrid{padding-left:12px;padding-right:12px;}
  }
`}</style>
      <main>
        <header className="pagehead">
          <div className="wrap">
            <h1 className="script">Ann&rsquo;s art</h1>
            <p className="plain">
              When she is not singing, Ann paints. Here are some of her works in
              acrylic and watercolour. Originals are for sale &mdash; to enquire
              about a piece, <a href="sms:+61438747882">Text 0438 747 882</a>.
            </p>
          </div>
        </header>

        <section aria-label="Paintings by Ann">
          <div className="wrap artgrid">
            {artworks.map((art) => (
              <figure key={art.id} id={art.id}>
                <img src={art.src} alt={`${art.title} — ${art.medium} painting by Ann Gillon`} loading="lazy" />
                <figcaption>
                  <div className="atitle">{art.title}</div>
                  <div className="ameta">
                    {art.medium}
                    {art.note ? ` · ${art.note}` : ""}
                  </div>
                  <div className="aprice">{art.price}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
