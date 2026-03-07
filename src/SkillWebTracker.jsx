import { useState } from "react";
import { Settings } from "lucide-react";
import { useSkillWeb } from "./hooks/useSkillWeb";
import { useCanvasDrag } from "./hooks/useCanvasDrag";
import { SettingsPanel } from "./panels/SettingsPanel";
import { WebCanvas } from "./panels/WebCanvas";
import { RolesPanel } from "./panels/RolesPanel";
import { ProgressionPanel } from "./panels/ProgressionPanel";

const SkillWebTracker = () => {
  const {
    roles,
    points,
    connections,
    offset,
    settings,
    activeRole,
    setOffset,
    setSettings,
    setActiveRole,
    addPoint,
    addRole,
    deleteRole,
    updateRole,
    updateRoleColor,
    save,
    load,
    reset,
  } = useSkillWeb();

  const { isDragging, dragHandlers } = useCanvasDrag(offset, setOffset);
  const [showSettings, setShowSettings] = useState(false);

  const handleCanvasClick = (e) => {
    if (!activeRole || isDragging) return;
    const rect = e.target.getBoundingClientRect();
    addPoint(e.clientX - rect.left - offset.x, e.clientY - rect.top - offset.y);
  };

  const activeRoleName = roles.find((r) => r.id === activeRole)?.name;

  return (
    <div className="flex h-screen bg-black text-gray-300">
      <div className="flex-1 relative border-r border-gray-900">
        <WebCanvas
          points={points}
          connections={connections}
          offset={offset}
          activeRole={activeRole}
          settings={settings}
          onCanvasClick={handleCanvasClick}
          dragHandlers={dragHandlers}
        />

        {activeRoleName && (
          <div className="absolute top-4 left-4 bg-zinc-950 px-4 py-2 rounded border border-gray-800 shadow-lg">
            <span className="text-gray-500 text-sm">Active:</span>
            <span className="ml-2 text-gray-300">{activeRoleName}</span>
          </div>
        )}

        <button
          onClick={() => setShowSettings((s) => !s)}
          className="absolute top-4 right-4 bg-zinc-950 p-2 rounded border border-gray-800 hover:border-gray-700 text-gray-400"
        >
          <Settings size={20} />
        </button>

        {showSettings && (
          <SettingsPanel settings={settings} onSettingsChange={setSettings} />
        )}
      </div>

      <RolesPanel
        roles={roles}
        points={points}
        activeRole={activeRole}
        onRoleSelect={setActiveRole}
        onAddRole={addRole}
        onDeleteRole={deleteRole}
        onUpdateRole={updateRole}
        onUpdateRoleColor={updateRoleColor}
        onSave={save}
        onLoad={load}
        onReset={reset}
      />

      <ProgressionPanel roles={roles} points={points} />
    </div>
  );
};

export default SkillWebTracker;
