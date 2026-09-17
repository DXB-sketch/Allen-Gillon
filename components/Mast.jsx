"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/music", label: "Albums" },
  { href: "/biography", label: "Timeless" },
  { href: "/hire", label: "Bookings" },
  { href: "/books", label: "eBooks" },
  { href: "/anns-art", label: "Ann Gillon" },
];

export default function Mast() {
  const pathname = usePathname();
  return (
    <div className="mast">
      <Link className="logo" href="/">
        Allen Gillon
      </Link>
      <nav className="mnav" aria-label="Site">
        {links.map((l) => (
          <Link
            key={l.href}
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
