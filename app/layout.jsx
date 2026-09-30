import "./site.css";
import { PlayerProvider, NowBar } from "../components/Player";
import PageReader from "../components/PageReader";

// Shared by both hosts. The (main) and (other) group layouts add each site's
// mast, footer, metadataBase and title template, and set data-site.
export const metadata = {
  title: "Allen Gillon",
  description:
    "Allen Gillon is a guitarist, songwriter, author and playwright from Bribie Island, Queensland.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-AU">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Dynalight&family=Lora:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <PlayerProvider>
          <PageReader />
          {children}
          <NowBar />
        </PlayerProvider>
      </body>
    </html>
  );
}
