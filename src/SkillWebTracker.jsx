import { useState, useRef } from "react";
import { Settings } from "lucide-react";
import { useSkillWeb } from "./hooks/useSkillWeb";
import { useCanvasDrag } from "./hooks/useCanvasDrag";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useTimer } from "./hooks/useTimer";
import { formatElapsed } from "./utils/time";
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
    finalizeLastOpenPoint,
    save,
    load,
    reset,
    undo,
    redo,
  } = useSkillWeb();

  const { isDragging, dragHandlers } = useCanvasDrag(offset, setOffset);
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef(null);

  const { elapsed, isRunning, start: startTimer, stop: stopTimer } = useTimer();

  const handleTimerStop = () => {
    finalizeLastOpenPoint();
    stopTimer();
  };
  const handleTimerToggle = () =>
    isRunning ? handleTimerStop() : startTimer();

  useKeyboardShortcuts({
    undo,
    redo,
    save,
    fileInputRef,
    setActiveRole,
    onTimerToggle: activeRole ? handleTimerToggle : undefined,
  });

  const handleRoleSelect = (id) => {
    setActiveRole(id);
    stopTimer();
    if (id !== null && (settings.timerActiveByDefault ?? false)) startTimer();
  };

  const handleSettingsChange = (next) => {
    const justEnabled =
      !settings.timerActiveByDefault && next.timerActiveByDefault;
    setSettings(next);
    if (justEnabled && activeRole !== null && !isRunning) startTimer();
  };

  const handleCanvasClick = (e) => {
    if (!activeRole || isDragging) return;
    const rect = e.target.getBoundingClientRect();
    addPoint(e.clientX - rect.left - offset.x, e.clientY - rect.top - offset.y);
    if (settings.timerActiveByDefault ?? false) {
      startTimer();
    } else {
      stopTimer();
    }
  };

  const activeRoleName = roles.find((r) => r.id === activeRole)?.name;

  return (
    <div className="flex h-screen bg-black text-gray-300">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={load}
        className="hidden"
      />

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
          <div className="absolute top-4 left-4 flex items-center gap-3 bg-zinc-950 px-4 py-2 rounded border border-gray-800 shadow-lg">
            <div>
              <span className="text-gray-500 text-sm">Active:</span>
              <span className="ml-2 text-gray-300">{activeRoleName}</span>
            </div>

            <div className="flex items-center gap-2 border-l border-gray-800 pl-3">
              <span
                className={`text-sm font-mono tabular-nums w-14 text-right ${
                  isRunning ? "text-gray-200" : "text-gray-600"
                }`}
              >
                {formatElapsed(elapsed)}
              </span>

              <button
                onClick={handleTimerToggle}
                className={`text-xs px-2 py-0.5 rounded border transition ${
                  isRunning
                    ? "border-red-800 text-red-400 hover:bg-red-900/30"
                    : "border-gray-700 text-gray-400 hover:bg-gray-800"
                }`}
                title="Toggle timer (Enter)"
              >
                {isRunning ? "Stop" : "Start"}
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowSettings((s) => !s)}
          className="absolute top-4 right-4 bg-zinc-950 p-2 rounded border border-gray-800 hover:border-gray-700 text-gray-400"
        >
          <Settings size={20} />
        </button>

        {showSettings && (
          <SettingsPanel
            settings={settings}
            onSettingsChange={handleSettingsChange}
          />
        )}
      </div>

      <RolesPanel
        roles={roles}
        points={points}
        activeRole={activeRole}
        onRoleSelect={handleRoleSelect}
        onAddRole={addRole}
        onDeleteRole={deleteRole}
        onUpdateRole={updateRole}
        onUpdateRoleColor={updateRoleColor}
        onSave={save}
        onLoad={() => fileInputRef.current?.click()}
        onReset={reset}
      />

      <ProgressionPanel roles={roles} points={points} />
    </div>
  );
};

export default SkillWebTracker;
