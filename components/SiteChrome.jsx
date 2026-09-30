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
export default function SiteChrome({ site, children }) {
  return (
    <div className="site" data-site={site}>
      <SiteMast site={site} />
      <PageReader voice={READER_VOICE[site]} />
      <div id="main" tabIndex={-1}>
        {children}
      </div>
      <SiteFooter site={site} />
      <MotionObserver />
    </div>
  );
}
