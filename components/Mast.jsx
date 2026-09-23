"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/hire", label: "Bookings" },
  { href: "/music", label: "Albums" },
  { href: "/biography", label: "Timeless" },
  { href: "/books", label: "Stories" },
  { href: "/anns-art", label: "Ann Gillon" },
];

export default function Mast() {
  const pathname = usePathname();
  return (
    <div className={`mast${pathname === "/" ? " home-mast" : ""}`}>
      <Link className="logo" href="/">
        Allen Gillon
      </Link>
      <nav className="mnav" aria-label="Site">
        {links.map((l) => (
          <Link
            key={l.href}
            className={l.href === "/hire" ? "nav-booking" : undefined}
            href={l.href}
            aria-current={pathname === l.href ? "page" : undefined}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
