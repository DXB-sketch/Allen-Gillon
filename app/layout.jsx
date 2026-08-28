import "./site.css";
import Mast from "../components/Mast";
import Footer from "../components/Footer";
import { PlayerProvider, NowBar } from "../components/Player";

export const metadata = {
  title: "Allen Gillon",
  description:
    "Allen Gillon: guitarist, songwriter, author and playwright from Bribie Island, Queensland. Hear his albums free, hire him for a gig, and read his story.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Dynalight&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <PlayerProvider>
          <Mast />
          {children}
          <NowBar />
          <Footer />
        </PlayerProvider>
      </body>
    </html>
  );
}
