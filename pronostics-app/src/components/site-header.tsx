import Link from "next/link";

import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/offres", label: "Offres" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b border-black/10 dark:border-white/15">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-semibold">
          Pronostics
        </Link>

        <nav className="flex flex-wrap items-center gap-4 text-sm">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          {session?.user ? (
            <>
              <span className="text-zinc-600 dark:text-zinc-400">
                {session.user.email}
              </span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                Se connecter
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-foreground px-4 py-1.5 font-medium text-background"
              >
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
