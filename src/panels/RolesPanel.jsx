import { useState } from "react";
import { Plus, Save, Upload, RotateCcw } from "lucide-react";
import { RoleItem } from "../components/RoleItem";
import { useRoleStats } from "../hooks/useRoleStats";

export const RolesPanel = ({
  roles,
  points,
  activeRole,
  onRoleSelect,
  onAddRole,
  onDeleteRole,
  onUpdateRole,
  onUpdateRoleColor,
  onSave,
  onLoad,
  onReset,
}) => {
  const [newRoleName, setNewRoleName] = useState("");
  const { levels, sortedRoles } = useRoleStats(roles, points);

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;
    onAddRole(newRoleName.trim());
    setNewRoleName("");
  };

  const handleReset = () => {
    if (
      confirm(
        "Reset everything to defaults?\n\nThis will clear all roles, points, and connections.",
      )
    ) {
      onReset();
    }
  };

  return (
    <div
      className="w-72.5 bg-zinc-950 border-r border-gray-900 p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onRoleSelect(null);
      }}
    >
      <h2 className="text-lg font-medium mb-4 text-gray-400 tracking-wide">
        ROLES
      </h2>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddRole()}
          placeholder="New role..."
          className="flex-1 bg-black border border-gray-800 px-3 py-2 rounded outline-none text-gray-300 placeholder-gray-700"
        />
        <button
          onClick={handleAddRole}
          className="bg-gray-900 hover:bg-gray-800 border border-gray-800 p-2 rounded text-gray-400"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-2">
        {sortedRoles.map((role) => (
          <RoleItem
            key={role.id}
            role={role}
            isActive={activeRole === role.id}
            level={levels.get(role.id) ?? 0}
            onSelect={() =>
              onRoleSelect(activeRole === role.id ? null : role.id)
            }
            onDelete={() => onDeleteRole(role.id)}
            onColorChange={(color) => onUpdateRoleColor(role.id, color)}
            onUpdateRole={(updates) => onUpdateRole(role.id, updates)}
          />
        ))}
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex gap-2">
          <button
            onClick={onSave}
            className="flex-1 bg-gray-900 hover:bg-gray-800 border border-gray-800 px-4 py-2 rounded flex items-center justify-center gap-2 text-gray-400 text-sm"
          >
            <Save size={16} /> Save
          </button>
          <button
            onClick={onLoad}
            className="flex-1 bg-gray-900 hover:bg-gray-800 border border-gray-800 px-4 py-2 rounded flex items-center justify-center gap-2 cursor-pointer text-gray-400 text-sm"
          >
            <Upload size={16} /> Load
          </button>
        </div>
        <button
          onClick={handleReset}
          className="w-full bg-red-900/30 hover:bg-red-900/50 border border-red-800 px-4 py-2 rounded flex items-center justify-center gap-2 text-red-400 text-sm"
        >
          <RotateCcw size={16} /> Reset All
        </button>
      </div>
    </div>
  );
};
