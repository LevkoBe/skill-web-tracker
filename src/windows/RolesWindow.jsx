import { useState } from "react";
import { Plus, Save, Upload, RotateCcw } from "lucide-react";
import { Button, Input, Body, Divider, useI18n } from "@levkobe/c7one";
import { RoleItem } from "../components/RoleItem";
import { useRoleStats } from "../hooks/useRoleStats";
import { useSkillContext } from "../context/SkillContext";

export function RolesWindow() {
  const { t } = useI18n();
  const {
    roles,
    points,
    activeRole,
    handleRoleSelect,
    addRole,
    deleteRole,
    updateRole,
    updateRoleColor,
    save,
    triggerLoad,
    reset,
  } = useSkillContext();

  const [newRoleName, setNewRoleName] = useState("");
  const { levels, sortedRoles } = useRoleStats(roles, points);

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;
    addRole(newRoleName.trim());
    setNewRoleName("");
  };

  const handleReset = () => {
    if (confirm(t("roles.reset.confirm"))) reset();
  };

  return (
    <div
      className="flex flex-col h-full bg-bg-base overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleRoleSelect(null);
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border shrink-0">
        <Body
          size="sm"
          className="text-fg-disabled uppercase tracking-widest font-semibold"
        >
          {t("roles.title")}
        </Body>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Add role input */}
        <div className="flex gap-2">
          <Input
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddRole()}
            placeholder={t("roles.add.placeholder")}
            className="flex-1"
          />
          <Button
            onClick={handleAddRole}
            variant="secondary"
            size="sm"
            title={t("roles.add.title")}
          >
            <Plus size={16} />
          </Button>
        </div>

        <Divider />

        {/* Role list */}
        <div className="space-y-1.5">
          {sortedRoles.map((role) => (
            <RoleItem
              key={role.id}
              role={role}
              isActive={activeRole === role.id}
              level={levels.get(role.id) ?? 0}
              onSelect={() =>
                handleRoleSelect(activeRole === role.id ? null : role.id)
              }
              onDelete={() => deleteRole(role.id)}
              onColorChange={(color) => updateRoleColor(role.id, color)}
              onUpdateRole={(updates) => updateRole(role.id, updates)}
            />
          ))}
        </div>
      </div>

      {/* Footer actions */}
      <div className="shrink-0 px-4 py-3 border-t border-border space-y-2">
        <div className="flex gap-2">
          <Button
            onClick={save}
            variant="secondary"
            size="sm"
            className="flex-1 gap-1.5"
          >
            <Save size={14} /> {t("roles.save")}
          </Button>
          <Button
            onClick={triggerLoad}
            variant="secondary"
            size="sm"
            className="flex-1 gap-1.5"
          >
            <Upload size={14} /> {t("roles.load")}
          </Button>
        </div>
        <Button
          onClick={handleReset}
          variant="destructive"
          size="sm"
          className="w-full gap-1.5"
        >
          <RotateCcw size={14} /> {t("roles.reset")}
        </Button>
      </div>
    </div>
  );
}
