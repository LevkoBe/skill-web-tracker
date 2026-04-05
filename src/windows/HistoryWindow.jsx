import { useMemo } from "react";
import { Body, useI18n } from "@levkobe/c7one";
import { useSkillContext } from "../context/SkillContext";

function toDayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDayLabel(key, todayKey, yesterdayKey, t) {
  if (key === todayKey) return t("history.today");
  if (key === yesterdayKey) return t("history.yesterday");
  const [, mm, dd] = key.split("-");
  return `${dd}.${mm}`;
}

export function HistoryWindow() {
  const { t } = useI18n();
  const { roles, points } = useSkillContext();

  const roleMap = useMemo(
    () => new Map(roles.map((r) => [r.id, r])),
    [roles],
  );

  const todayKey = toDayKey(Date.now());
  const yesterdayKey = toDayKey(Date.now() - 86_400_000);

  // dayKey -> roleId -> count
  const dayData = useMemo(() => {
    const map = new Map();
    for (const pt of points) {
      const ts = pt.startedAt ?? pt.id;
      const dk = toDayKey(ts);
      if (!map.has(dk)) map.set(dk, new Map());
      const rm = map.get(dk);
      rm.set(pt.roleId, (rm.get(pt.roleId) ?? 0) + 1);
    }
    return map;
  }, [points]);

  // Sorted days (chronological)
  const sortedDays = useMemo(
    () => [...dayData.keys()].sort(),
    [dayData],
  );

  // Per day: roles sorted by count desc
  const columns = useMemo(
    () =>
      sortedDays.map((dk) => {
        const roleCountMap = dayData.get(dk);
        const entries = [...roleCountMap.entries()]
          .map(([roleId, count]) => ({ role: roleMap.get(roleId), count }))
          .filter((e) => e.role != null)
          .sort((a, b) => b.count - a.count);
        return { dk, entries };
      }),
    [sortedDays, dayData, roleMap],
  );

  if (sortedDays.length === 0) {
    return (
      <div className="h-full flex flex-col bg-bg-base">
        <div className="px-4 py-3 border-b border-border">
          <Body size="sm" className="text-fg-disabled uppercase tracking-widest font-semibold">
            {t("history.title")}
          </Body>
        </div>
        <div className="flex-1 flex items-center justify-center text-sm text-fg-disabled">
          {t("history.empty")}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-bg-base overflow-hidden">
      {/* Window header */}
      <div className="px-4 py-3 border-b border-border shrink-0">
        <Body size="sm" className="text-fg-disabled uppercase tracking-widest font-semibold">
          {t("history.title")}
        </Body>
      </div>

      {/* Horizontally scrollable column layout */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <div className="flex h-full min-w-max divide-x divide-border">
          {columns.map(({ dk, entries }) => (
            <div key={dk} className="flex flex-col w-44 shrink-0">
              {/* Day header — sticky top */}
              <div className="sticky top-0 z-10 bg-bg-elevated px-3 py-2 border-b border-border">
                <span className="text-xs font-semibold text-fg-muted uppercase tracking-wide">
                  {formatDayLabel(dk, todayKey, yesterdayKey, t)}
                </span>
              </div>

              {/* Role entries for this day */}
              <div className="flex flex-col divide-y divide-border/40">
                {entries.map(({ role, count }) => (
                  <div key={role.id} className="px-3 py-2.5 flex flex-col gap-1.5">
                    {/* Role name row */}
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: role.color,
                          boxShadow: `0 0 3px ${role.color}`,
                        }}
                      />
                      <span className="text-xs text-fg-primary leading-tight truncate">
                        {role.name}
                      </span>
                    </div>
                    {/* Dots row */}
                    <div className="flex flex-wrap gap-1 pl-3">
                      {Array.from({ length: count }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: role.color,
                            opacity: 0.7,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
