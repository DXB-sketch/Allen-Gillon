import SiteChrome from "../../components/SiteChrome";

export const metadata = {
  metadataBase: new URL("https://other.allengillon.com"),
  title: {
    default: "More on Allen",
    template: "%s · More on Allen",
  },
  description:
    "More on Allen Gillon: family, writing, Timeless and Ann's art, from Bribie Island, Queensland.",
  openGraph: {
    siteName: "More on Allen",
    locale: "en_AU",
  },
};

export default function OtherLayout({ children }) {
  return <SiteChrome site="other">{children}</SiteChrome>;
}
