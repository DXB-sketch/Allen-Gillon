import "./site.css";
import Mast from "../components/Mast";
import Footer from "../components/Footer";
import { PlayerProvider, NowBar } from "../components/Player";
import PageReader from "../components/PageReader";

export const metadata = {
  metadataBase: new URL("https://allengillon.com"),
  title: "Allen Gillon",
  description:
    "Allen Gillon is a guitarist, songwriter, author and playwright from Bribie Island, Queensland.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Dynalight&family=Lora:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <PlayerProvider>
          <Mast />
          <PageReader />
          {children}
          <NowBar />
          <Footer />
        </PlayerProvider>
      </body>
    </html>
  );
}
