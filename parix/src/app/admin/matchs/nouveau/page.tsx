import { MatchForm } from "@/components/admin/match-form";
import { prisma } from "@/lib/prisma";

import { createMatch } from "../actions";

export default async function NouveauMatchPage() {
  const sports = await prisma.sport.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Nouveau match</h1>
      <MatchForm action={createMatch} sports={sports} submitLabel="Créer le match" />
    </div>
  );
}
