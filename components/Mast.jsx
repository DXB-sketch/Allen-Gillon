"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/music", label: "Albums" },
  { href: "/plays", label: "Plays" },
  { href: "/books", label: "Books" },
  { href: "/biography", label: "About Me" },
  { href: "/hire", label: "Hire Me" },
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
