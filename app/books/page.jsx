export const metadata = {
  title: "Children's Books · Allen Gillon",
  description:
    "Children's storybooks written by Allen Gillon for young readers and the adults who read to them.",
};

export default function BooksPage() {
  return (
    <>
      <style>{`
  .shelf{margin-top:20px;}
  .shelf li{display:grid;grid-template-columns:96px 1fr;gap:24px;align-items:center;padding:22px 0;}
  .shelf .spine{width:96px;height:124px;border:2px solid var(--ink);border-radius:2px;background:var(--paper-2);
    display:flex;align-items:flex-end;padding:8px;font-size:.85rem;line-height:1.2;color:var(--soft);}
  .shelf .spine.b{background:var(--blue);color:var(--on);}
  .shelf h3{font-size:1.4rem;}
  .shelf p{margin:6px 0 0;color:var(--soft);font-size:1.05rem;max-width:56ch;}
  @media (max-width:640px){.shelf li{grid-template-columns:76px 1fr;gap:16px;}.shelf .spine{width:76px;height:100px;}}
`}</style>
      <main>
        <header className="pagehead">
          <div className="wrap">
            <h1 className="script">Children's Books</h1>
            <p className="plain">Storybooks written by Allen for young readers and the adults who read to them. He is a qualified teacher, and it shows: the stories are built to be read aloud.</p>
          </div>
        </header>

        <section>
          <div className="wrap">
            <ul className="ruled shelf" aria-label="The books">
              <li>
                <span className="spine b" aria-hidden="true">Title to come</span>
                <div>
                  <h3>The first storybook</h3>
                  <p>Cover and pages are being prepared for this site. The title and a sample will appear here.</p>
                </div>
              </li>
              <li>
                <span className="spine b" aria-hidden="true">Title to come</span>
                <div>
                  <h3>The second storybook</h3>
                  <p>Details are on their way from Allen's shelf to this one.</p>
                </div>
              </li>
              <li>
                <span className="spine" aria-hidden="true">More to come</span>
                <div>
                  <h3>And more behind them</h3>
                  <p>Allen is still writing. New titles will be added as they are ready.</p>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
