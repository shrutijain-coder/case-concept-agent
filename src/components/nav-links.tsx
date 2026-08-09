"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "Practice history" },
  { href: "/peer-learning", label: "Peer learning" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="space-y-0.5">
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "block rounded-md px-2.5 py-1.5 text-[13px] transition-colors duration-150",
              active
                ? "bg-sunken font-medium text-ink"
                : "text-ink-muted hover:bg-sunken hover:text-ink",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
