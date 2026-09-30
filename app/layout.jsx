import "./site.css";
import Mast from "../components/Mast";
import Footer from "../components/Footer";
import { PlayerProvider, NowBar } from "../components/Player";
import PageReader from "../components/PageReader";
import { ReaderVoiceProvider } from "../components/ReaderVoice";

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
          <ReaderVoiceProvider>
            <Mast />
            {/* voice: "male" suits the main site. The other site's sections
                (books, read, anns-art, delivery) switch it to "female" from
                their own layout.jsx with <ReaderVoice>. W2 moves PageReader into
                each site layout: main passes voice="male", other voice="female". */}
            <PageReader voice="male" />
            {children}
            <NowBar />
            <Footer />
          </ReaderVoiceProvider>
        </PlayerProvider>
      </body>
    </html>
  );
}
