import { useState, useMemo } from "react";
import { Search, Edit2, Trash2 } from "lucide-react";
import { Input, Button, useI18n } from "@levkobe/c7one";
import { RoleCardModal } from "../components/RoleCardModal";
import { useRoleStats } from "../hooks/useRoleStats";
import { useSkillContext } from "../context/SkillContext";

function RoleCatalogueCard({ role, level, onDelete }) {
  const [showCard, setShowCard] = useState(false);

  return (
    <>
      <div className="group relative rounded-lg border border-border bg-bg-elevated px-4 py-3">
        <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-auto w-auto"
            onClick={() => setShowCard(true)}
          >
            <Edit2 size={12} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-auto w-auto text-error hover:text-error"
            onClick={onDelete}
          >
            <Trash2 size={12} />
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-1 pr-12">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: role.color, boxShadow: `0 0 4px ${role.color}` }}
          />
          <span className="text-sm font-semibold text-fg-primary truncate">{role.name}</span>
        </div>

        {role.summary && (
          <p className="text-xs text-fg-secondary leading-relaxed">{role.summary}</p>
        )}
      </div>

      <RoleCardModal
        role={role}
        usageLevel={level}
        open={showCard}
        onOpenChange={setShowCard}
      />
    </>
  );
}

export function RolesCatalogueWindow() {
  const { t } = useI18n();
  const { roles, points, deleteRole } = useSkillContext();
  const { levels, sortedRoles } = useRoleStats(roles, points);

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedRoles;
    return sortedRoles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.summary ?? "").toLowerCase().includes(q),
    );
  }, [sortedRoles, query]);

  return (
    <div className="flex flex-col h-full bg-bg-base overflow-hidden">
      <div className="px-4 py-3 border-b border-border shrink-0 flex gap-2">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-disabled pointer-events-none"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("rolesCatalogue.search")}
            className="pl-8"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-fg-disabled text-center py-8">
            {t("rolesCatalogue.empty")}
          </p>
        )}

        {filtered.map((role) => (
          <RoleCatalogueCard
            key={role.id}
            role={role}
            level={levels.get(role.id) ?? 0}
            onDelete={() => deleteRole(role.id)}
          />
        ))}
      </div>
    </div>
  );
}
