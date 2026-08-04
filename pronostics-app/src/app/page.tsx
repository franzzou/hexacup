import Link from "next/link";

import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-md flex-col items-center gap-6 rounded-xl border border-black/10 bg-white p-10 text-center dark:border-white/15 dark:bg-black">
        <h1 className="text-2xl font-semibold">Pronostics</h1>

        {session?.user ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-zinc-600 dark:text-zinc-400">
              Connecté en tant que{" "}
              <span className="font-medium text-zinc-950 dark:text-zinc-50">
                {session.user.email}
              </span>{" "}
              ({session.user.role})
            </p>
            <SignOutButton />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <p className="text-zinc-600 dark:text-zinc-400">
              Analyses et recommandations sportives, sans pari réel.
            </p>
            <div className="flex gap-3">
              <Link
                href="/login"
                className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background"
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                className="rounded-full border border-black/10 px-5 py-2 text-sm font-medium dark:border-white/20"
              >
                S&apos;inscrire
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
