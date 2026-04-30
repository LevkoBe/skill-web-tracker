import React from "react";
import { Badge, useI18n } from "@levkobe/c7one";
import { useSkillContext } from "../context/SkillContext";
import { useRoleStats } from "../hooks/useRoleStats";
import { FIBONACCI_SET } from "../utils/fibonacci";

const RoleProgressRow = React.memo(({ role, count }) => {
  const { t } = useI18n();
  const boxCount = Math.max(50, count + 10);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{
            backgroundColor: role.color,
            boxShadow: `0 0 4px ${role.color}`,
          }}
        />
        <span className="text-sm text-fg-primary">{role.name}</span>
        <Badge variant="neutral" className="ml-auto">
          {count}
        </Badge>
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
                isMilestone ? "border-border" : "border-border/55",
                filled ? "bg-fg-muted" : "",
                !filled ? "bg-transparent" : "",
              ].join(" ")}
              style={
                filled && isMilestone
                  ? {
                      backgroundColor: role.color + "80",
                      borderColor: role.color + "cc",
                    }
                  : {}
              }
              title={
                isMilestone
                  ? t("progression.milestone", { n: num })
                  : String(num)
              }
            />
          );
        })}
      </div>
    </div>
  );
});

export function ProgressionWindow() {
  const { roles, points } = useSkillContext();
  const { pointCounts, sortedRoles } = useRoleStats(roles, points);

  return (
    <div className="h-full overflow-y-auto bg-bg-base">
      <div className="px-4 py-4 space-y-6">
        {sortedRoles.map((role) => (
          <RoleProgressRow
            key={role.id}
            role={role}
            count={pointCounts.get(role.id) ?? 0}
          />
        ))}
      </div>
    </div>
  );
}
