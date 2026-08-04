"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full border border-black/10 px-5 py-2 text-sm font-medium dark:border-white/20"
    >
      Se déconnecter
    </button>
  );
}
