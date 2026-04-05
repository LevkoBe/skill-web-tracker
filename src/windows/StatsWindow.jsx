import { useMemo } from "react";
import { Body, Table, useI18n } from "@levkobe/c7one";
import { useSkillContext } from "../context/SkillContext";
import { useRoleStats } from "../hooks/useRoleStats";

function formatDate(dayKey) {
  // dayKey is "YYYY-MM-DD"
  const [, mm, dd] = dayKey.split("-");
  return `${dd}.${mm}`;
}

function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function StatsWindow() {
  const { t } = useI18n();
  const { roles, points } = useSkillContext();
  const { sortedRoles } = useRoleStats(roles, points);

  const { sortedDays, countMap } = useMemo(() => {
    const daySet = new Set();
    const map = new Map(); // roleId -> Map<dayKey, count>

    for (const pt of points) {
      const ts = pt.startedAt ?? pt.id;
      const key = dayKey(ts);
      daySet.add(key);

      if (!map.has(pt.roleId)) map.set(pt.roleId, new Map());
      const dayMap = map.get(pt.roleId);
      dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
    }

    return { sortedDays: [...daySet].sort(), countMap: map };
  }, [points]);

  const columns = useMemo(() => {
    const roleCol = {
      key: "role",
      header: t("stats.role"),
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{
              backgroundColor: row._color,
              boxShadow: `0 0 4px ${row._color}`,
            }}
          />
          <span>{row._name}</span>
        </div>
      ),
    };

    const dateCols = sortedDays.map((day) => ({
      key: day,
      header: formatDate(day),
      align: "center",
      render: (_, row) => {
        const n = row._counts?.get(day) ?? 0;
        if (n === 0) return null;
        return (
          <span
            className="font-mono font-medium text-xs"
            style={{ color: n === 1 ? row._color : undefined }}
          >
            {n === 1 ? "x" : String(n)}
          </span>
        );
      },
    }));

    return [roleCol, ...dateCols];
  }, [sortedDays, t]);

  const data = useMemo(
    () =>
      sortedRoles.map((role) => ({
        role: role.name,
        _name: role.name,
        _color: role.color,
        _counts: countMap.get(role.id),
        // spread day keys so Table's default string renderer has something
        ...Object.fromEntries(sortedDays.map((d) => [d, ""])),
      })),
    [sortedRoles, countMap, sortedDays],
  );

  return (
    <div className="h-full overflow-y-auto bg-bg-base">
      <div className="px-4 py-3 border-b border-border sticky top-0 bg-bg-base z-10">
        <Body
          size="sm"
          className="text-fg-disabled uppercase tracking-widest font-semibold"
        >
          {t("stats.title")}
        </Body>
      </div>

      <div className="px-4 py-4">
        <Table
          data={data}
          columns={columns}
          stickyHeader
          emptyMessage={t("stats.empty")}
        />
      </div>
    </div>
  );
}
