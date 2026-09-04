"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/music", label: "Albums" },
  { href: "/plays", label: "Plays" },
  { href: "/books", label: "Publications" },
  { href: "/anns-art", label: "Ann's art" },
  { href: "/biography", label: "About Al" },
  { href: "/hire", label: "Bookings" },
];

export default function Mast() {
  const pathname = usePathname();
  return (
    <div className="mast">
      <Link className="logo" href="/">
        Allen <em>Gillon</em>
      </Link>
      <nav className="mnav" aria-label="Site">
        {/* The original site marked no nav link on the homepage, only on the
            other five pages — reproduce that exactly. */}
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={pathname === l.href && l.href !== "/" ? "page" : undefined}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
