import "./site.css";
import "./illustrations.css";
import { PlayerProvider, NowBar } from "../components/Player";
import { SITE_MARKER_SCRIPT } from "../lib/sites.mjs";

// Shared by both hosts. <html data-site> comes from SITE_MARKER_SCRIPT (host
// based, before first paint) so this layout never reads the request and pages
// stay static. The (main) and (other) group layouts add each site's mast,
// footer, metadataBase and title template, and also set data-site on their
// wrapper.
export const metadata = {
  title: "Allen Gillon",
  description:
    "Allen Gillon is a guitarist, songwriter, author and playwright from Bribie Island, Queensland.",
};

export default function RootLayout({ children }) {
  return (
    // data-site is set by the inline script, so React is told not to expect it.
    <html lang="en-AU" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SITE_MARKER_SCRIPT }} />
        {/* Dynalight is self-hosted (public/fonts); body text is the system Times. */}
        <link rel="preload" href="/fonts/dynalight-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <PlayerProvider>
          {children}
          <NowBar />
        </PlayerProvider>
      </body>
    </html>
  );
}
