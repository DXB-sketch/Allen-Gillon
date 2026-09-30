import NotFoundContent from "../components/NotFoundContent";

export const metadata = {
  title: "Page not found",
  robots: { index: false },
};

// notFound() thrown inside a (main) or (other) page renders here, inside that
// group's layout, so the right mast and footer are already on the page.
// Unmatched URLs render app/global-not-found.jsx instead (host-aware).
export default function NotFound() {
  return <NotFoundContent />;
}
