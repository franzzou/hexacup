import Link from "next/link";

import { requireAdmin } from "@/lib/admin";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireAdmin();

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
        <nav className="flex gap-4 text-sm">
          <Link href="/admin/matchs" className="font-semibold hover:text-accent">
            Matchs
          </Link>
          <Link href="/admin/matchs/nouveau" className="text-muted hover:text-accent">
            Nouveau match
          </Link>
        </nav>
        <span className="text-xs text-muted">{session?.user?.email}</span>
      </div>
      {children}
    </div>
  );
}
