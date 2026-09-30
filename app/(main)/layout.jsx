import SiteChrome from "../../components/SiteChrome";

export const metadata = {
  metadataBase: new URL("https://allengillon.com"),
  title: {
    default: "Allen Gillon",
    template: "%s · Allen Gillon",
  },
  openGraph: {
    siteName: "Allen Gillon",
    locale: "en_AU",
  },
};

export default function MainLayout({ children }) {
  return <SiteChrome site="main">{children}</SiteChrome>;
}
