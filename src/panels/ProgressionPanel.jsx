import { useMemo } from "react";

const FIBONACCI = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233];
const FIBONACCI_SET = new Set(FIBONACCI);

export const ProgressionPanel = ({ roles, points }) => {
  const rolePointCounts = useMemo(() => {
    const map = new Map();
    for (const p of points) {
      map.set(p.roleId, (map.get(p.roleId) ?? 0) + 1);
    }
    return map;
  }, [points]);

  const sortedRoles = useMemo(() => {
    return [...roles].sort(
      (a, b) =>
        (rolePointCounts.get(b.id) ?? 0) - (rolePointCounts.get(a.id) ?? 0),
    );
  }, [roles, rolePointCounts]);

  return (
    <div className="w-80 bg-zinc-950 p-6 overflow-y-auto">
      <h2 className="text-lg font-medium mb-4 text-gray-400 tracking-wide">
        PROGRESSION
      </h2>

      {sortedRoles.map((role) => {
        const count = rolePointCounts.get(role.id) ?? 0;
        const maxBoxes = Math.max(50, count + 10);

        return (
          <div key={role.id} className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: role.color,
                  boxShadow: `0 0 4px ${role.color}`,
                }}
              />
              <span className="text-sm text-gray-400">{role.name}</span>
              <span className="text-gray-600 text-xs ml-auto">{count}</span>
            </div>

            <div className="flex flex-wrap gap-0.5">
              {Array.from({ length: maxBoxes }).map((_, idx) => {
                const num = idx + 1;
                const isFib = FIBONACCI_SET.has(num);
                const isCompleted = num <= count;

                return (
                  <div
                    key={idx}
                    className={`w-2.5 h-2.5 border ${
                      isFib ? "border-gray-700" : "border-gray-900"
                    } ${
                      isCompleted
                        ? isFib
                          ? "bg-gray-700"
                          : "bg-gray-800"
                        : "bg-transparent"
                    }`}
                    title={isFib ? `Milestone: ${num}` : num}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
