import Link from "next/link";

export default function NotFoundContent() {
  return (
    <main>
      <header className="pagehead">
        <div className="wrap">
          <h1 className="script">Page not found</h1>
          <p className="plain">
            That page is not here. <Link href="/">Go to the home page</Link>.
          </p>
        </div>
      </header>
    </main>
  );
}
