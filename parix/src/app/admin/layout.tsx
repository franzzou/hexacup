import Link from "next/link";

import { requireAdmin } from "@/lib/admin";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireAdmin();

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-4 dark:border-white/15">
        <nav className="flex gap-4 text-sm">
          <Link href="/admin/matchs" className="font-medium hover:underline">
            Matchs
          </Link>
          <Link href="/admin/matchs/nouveau" className="hover:underline">
            Nouveau match
          </Link>
        </nav>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {session?.user?.email}
        </span>
      </div>
      {children}
    </div>
  );
}
