import Link from "next/link";

import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/offres", label: "Offres" },
  { href: "/performances", label: "Performances" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-black tracking-tight">
          <span className="h-2.5 w-2.5 rounded-sm bg-accent" />
          Par<span className="text-accent">ix</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-6 text-sm font-medium text-muted">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          {session?.user ? (
            <>
              <span className="hidden text-muted sm:inline">{session.user.email}</span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="font-medium text-muted transition-colors hover:text-foreground">
                Se connecter
              </Link>
              <Link href="/register" className="btn-primary">
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
