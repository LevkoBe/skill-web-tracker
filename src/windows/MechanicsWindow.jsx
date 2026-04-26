import { useMemo } from "react";
import { Lock } from "lucide-react";
import { Card, Body, useI18n } from "@levkobe/c7one";
import { useSkillContext } from "../context/SkillContext";
import { DEFAULT_SETTINGS } from "../config";

export function MechanicsWindow() {
  const { t } = useI18n();
  const {
    roles,
    techniques,
    points,
    activeMechanic,
    unlockedNodes,
    settings,
    handleMechanicSelect,
  } = useSkillContext();

  const isGradual = (settings.gameMode ?? DEFAULT_SETTINGS.gameMode) === "gradual";
  const unlockedSet = useMemo(() => new Set(unlockedNodes), [unlockedNodes]);

  const techMap = useMemo(
    () => new Map(techniques.map((t) => [t.id, t])),
    [techniques],
  );

  const pointsPerMechanic = useMemo(() => {
    const map = new Map();
    for (const p of points) {
      if (p.mechanicId) map.set(p.mechanicId, (map.get(p.mechanicId) ?? 0) + 1);
    }
    return map;
  }, [points]);

  const groups = useMemo(() => {
    return roles
      .filter((r) => !isGradual || unlockedSet.has(r.id))
      .map((r) => ({
        role: r,
        mechs: (r.techniques ?? []).map((id) => ({
          id,
          name: techMap.get(id)?.name ?? id,
          count: pointsPerMechanic.get(id) ?? 0,
          unlocked: !isGradual || unlockedSet.has(id),
        })),
      }))
      .filter((g) => g.mechs.length > 0);
  }, [roles, pointsPerMechanic, unlockedSet, isGradual, techMap]);

  return (
    <div className="flex flex-col h-full bg-bg-base overflow-hidden">
      <div className="px-3 py-2 border-b border-border shrink-0">
        <Body
          size="sm"
          className="text-fg-disabled uppercase tracking-widest font-semibold"
        >
          {t("mechanics.title")}
        </Body>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {groups.length === 0 && (
          <div className="text-xs text-fg-disabled text-center py-6">
            {t("mechanics.empty")}
          </div>
        )}

        {groups.map(({ role, mechs }) => (
          <div key={role.id} className="space-y-1">
            <div className="flex items-center gap-1.5 px-0.5">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: role.color, boxShadow: `0 0 3px ${role.color}` }}
              />
              <span className="text-xs font-semibold text-fg-muted uppercase tracking-wide truncate">
                {role.name}
              </span>
            </div>

            {mechs.map(({ id, name, count, unlocked }) =>
              unlocked ? (
                <Card
                  key={id}
                  variant={activeMechanic === id ? "elevated" : "outlined"}
                  className={`p-0 cursor-pointer transition-colors select-none ${
                    activeMechanic === id ? "" : "hover:bg-bg-elevated"
                  }`}
                  onClick={() => handleMechanicSelect(id)}
                >
                  <div className="flex items-center justify-between px-2.5 py-1.5">
                    <span className="text-sm text-fg-primary truncate">{name}</span>
                    {count > 0 && (
                      <span className="text-xs text-fg-disabled shrink-0 ml-2 tabular-nums">
                        ×{count}
                      </span>
                    )}
                  </div>
                </Card>
              ) : (
                <div
                  key={id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-(--radius) border border-border/40 opacity-40 select-none"
                >
                  <Lock size={11} className="text-fg-disabled shrink-0" />
                  <span className="text-xs text-fg-disabled italic">
                    {t("mechanics.locked")}
                  </span>
                </div>
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
