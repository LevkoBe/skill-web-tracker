import { useRoleStats } from "../hooks/useRoleStats";
import { FIBONACCI_SET } from "../utils/fibonacci";

export const ProgressionPanel = ({ roles, points }) => {
  const { pointCounts, sortedRoles } = useRoleStats(roles, points);

  return (
    <div className="w-80 bg-zinc-950 p-6 overflow-y-auto">
      <h2 className="text-lg font-medium mb-4 text-gray-400 tracking-wide">
        PROGRESSION
      </h2>

      {sortedRoles.map((role) => {
        const count = pointCounts.get(role.id) ?? 0;
        const boxCount = Math.max(50, count + 10);

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
              {Array.from({ length: boxCount }).map((_, idx) => {
                const num = idx + 1;
                const isMilestone = FIBONACCI_SET.has(num);
                const filled = num <= count;
                return (
                  <div
                    key={idx}
                    className={[
                      "w-2.5 h-2.5 border",
                      isMilestone ? "border-gray-700" : "border-gray-900",
                      filled
                        ? isMilestone
                          ? "bg-gray-700"
                          : "bg-gray-800"
                        : "bg-transparent",
                    ].join(" ")}
                    title={isMilestone ? `Milestone: ${num}` : String(num)}
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
