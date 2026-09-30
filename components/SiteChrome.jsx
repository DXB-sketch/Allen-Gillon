import SiteMast from "./SiteMast";
import SiteFooter from "./SiteFooter";
import PageReader from "./PageReader";
import MotionObserver from "./illustrations/MotionObserver";

// The page reader's narrator per site: Allen's music site uses a male voice,
// the family and stories site a female one.
const READER_VOICE = { main: "male", other: "female" };

// Mast, page content and footer for one site. Used by the (main) and (other)
// group layouts, and by the host-aware pages outside them (/comments, not-found).
// data-site lets per-site CSS target either host without reading the request.
//
// Landmarks: the mast is the <header> (with the site <nav>), this <main> is
// the only main landmark on every page, and the footer is the <footer>.
// Pages render their content in a plain <div> and never a second <main>.
// The skip link in app/layout.jsx (and app/global-not-found.jsx) targets
// #main; tabIndex -1 lets it take focus without joining the tab order.
export default function SiteChrome({ site, children }) {
  return (
    <div className="site" data-site={site}>
      <SiteMast site={site} />
      <PageReader voice={READER_VOICE[site]} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter site={site} />
      <MotionObserver />
    </div>
  );
}
