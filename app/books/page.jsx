export const metadata = {
  title: "Children's Books · Allen Gillon",
  description:
    "The Chinese Chimes stories: short ebooks with a gentle moral for young readers, written and narrated by Allen Gillon.",
};

export default function BooksPage() {
  return (
    <main>
      <header className="pagehead">
        <div className="wrap">
          <h1 className="script">Children's Books</h1>
          <p className="plain">The Chinese Chimes stories: short stories for young readers, each with a gentle moral, written by Allen the teacher. Released as ebooks and narrated on YouTube. The current recordings use an older computer voice; fresh recordings are on the way.</p>
        </div>
      </header>

      <section aria-label="The Chinese Chimes stories">
        <div className="wrap">
          <div className="videos">
            <figure className="video">
              <div className="frame">
                <iframe
                  src="https://www.youtube-nocookie.com/embed/OAu1PmILqeA"
                  title="Funny Fah Learns When to Stop"
                  loading="lazy"
                  allow="encrypted-media; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <figcaption>Funny Fah Learns When to Stop</figcaption>
            </figure>
            <figure className="video">
              <div className="frame">
                <iframe
                  src="https://www.youtube-nocookie.com/embed/ZwzVEIQp3Cw"
                  title="Imaginative Little Mee"
                  loading="lazy"
                  allow="encrypted-media; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <figcaption>Imaginative Little Mee</figcaption>
            </figure>
            <figure className="video">
              <div className="frame">
                <iframe
                  src="https://www.youtube-nocookie.com/embed/Ynu-5Rt7Vyw"
                  title="Hi Doh"
                  loading="lazy"
                  allow="encrypted-media; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <figcaption>Hi Doh</figcaption>
            </figure>
            <figure className="video">
              <div className="frame">
                <iframe
                  src="https://www.youtube-nocookie.com/embed/cEuPWVPPN0o"
                  title="Little Ray"
                  loading="lazy"
                  allow="encrypted-media; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <figcaption>Little Ray</figcaption>
            </figure>
          </div>
        </div>
      </section>
    </main>
  );
}
