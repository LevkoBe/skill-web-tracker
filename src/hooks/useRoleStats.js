import { useMemo } from "react";
import { getLevelFromCount } from "../utils/fibonacci";

export const useRoleStats = (roles, points) => {
  const pointCounts = useMemo(() => {
    const map = new Map();
    for (const p of points) map.set(p.roleId, (map.get(p.roleId) ?? 0) + 1);
    return map;
  }, [points]);

  const levels = useMemo(() => {
    const map = new Map();
    for (const role of roles) {
      map.set(role.id, getLevelFromCount(pointCounts.get(role.id) ?? 0));
    }
    return map;
  }, [roles, pointCounts]);

  const sortedRoles = useMemo(
    () =>
      [...roles].sort(
        (a, b) => (pointCounts.get(b.id) ?? 0) - (pointCounts.get(a.id) ?? 0),
      ),
    [roles, pointCounts],
  );

  return { pointCounts, levels, sortedRoles };
};
