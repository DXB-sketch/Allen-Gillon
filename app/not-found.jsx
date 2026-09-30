import NotFoundContent from "../components/NotFoundContent";

// No robots entry: vinext already adds <meta name="robots" content="noindex"> to 404s.
export const metadata = {
  title: "Page not found",
};

// notFound() thrown inside a (main) or (other) page renders here, inside that
// group's layout, so the right mast and footer are already on the page.
// Unmatched URLs render app/global-not-found.jsx instead (host-aware).
export default function NotFound() {
  return <NotFoundContent />;
}
