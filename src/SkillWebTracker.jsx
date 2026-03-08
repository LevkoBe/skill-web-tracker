import { useState, useRef } from "react";
import {
  Settings,
  Fullscreen,
  HelpCircle,
  Undo2,
  Redo2,
  RotateCw,
} from "lucide-react";
import { useSkillWeb } from "./hooks/useSkillWeb";
import { useCanvasDrag } from "./hooks/useCanvasDrag";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useTimer } from "./hooks/useTimer";
import { formatElapsed } from "./utils/time";
import { SettingsPanel } from "./panels/SettingsPanel";
import { WebCanvas } from "./panels/WebCanvas";
import { RolesPanel } from "./panels/RolesPanel";
import { ProgressionPanel } from "./panels/ProgressionPanel";

const TOOLTIP_HIT_RADIUS = 12;

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
    updatePointNote,
    save,
    load,
    reset,
    undo,
    redo,
  } = useSkillWeb();

  const { isDragging, dragHandlers, scale, zoom, zoomReset, zoomToFit } =
    useCanvasDrag(offset, setOffset);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const lastCanvasPos = useRef(null);

  const [pendingNote, setPendingNote] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [tooltip, setTooltip] = useState(null);

  const { elapsed, isRunning, start: startTimer, stop: stopTimer } = useTimer();

  const handleTimerStop = () => {
    finalizeLastOpenPoint();
    stopTimer();
  };
  const handleTimerToggle = () =>
    isRunning ? handleTimerStop() : startTimer();

  const handleKeyboardZoom = (delta) => {
    const el = containerRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const pos = lastCanvasPos.current ?? { x: width / 2, y: height / 2 };
    zoom(delta, pos.x, pos.y);
  };

  useKeyboardShortcuts({
    undo,
    redo,
    save,
    fileInputRef,
    setActiveRole,
    onTimerToggle: activeRole ? handleTimerToggle : undefined,
    onZoom: handleKeyboardZoom,
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
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    const newId = Date.now();
    addPoint((canvasX - offset.x) / scale, (canvasY - offset.y) / scale);
    setPendingNote({ pointId: newId, screenX: canvasX, screenY: canvasY });
    setNoteText("");
    setTooltip(null);
    if (settings.timerActiveByDefault ?? false) startTimer();
    else stopTimer();
  };

  const commitNote = () => {
    if (!pendingNote) return;
    if (noteText.trim()) updatePointNote(pendingNote.pointId, noteText.trim());
    setPendingNote(null);
    setNoteText("");
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    lastCanvasPos.current = { x: mx, y: my };
    if (pendingNote) return;
    let best = null;
    let bestDist = TOOLTIP_HIT_RADIUS;
    points.forEach((p) => {
      const dist = Math.hypot(
        p.x * scale + offset.x - mx,
        p.y * scale + offset.y - my,
      );
      if (dist < bestDist) {
        bestDist = dist;
        best = p;
      }
    });
    setTooltip(best ? { point: best, screenX: mx, screenY: my } : null);
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

      <div
        ref={containerRef}
        className="flex-1 relative border-r border-gray-900"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        <WebCanvas
          points={points}
          connections={connections}
          offset={offset}
          scale={scale}
          activeRole={activeRole}
          settings={settings}
          roles={roles}
          onCanvasClick={handleCanvasClick}
          dragHandlers={dragHandlers}
        />

        {pendingNote && (
          <input
            autoFocus
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onBlur={commitNote}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitNote();
              }
              if (e.key === "Escape") {
                setPendingNote(null);
                setNoteText("");
              }
            }}
            placeholder="Note… (Enter to save, Esc to skip)"
            style={{
              position: "absolute",
              left: pendingNote.screenX + 10,
              top: pendingNote.screenY + 10,
            }}
            className="bg-zinc-900 border border-gray-700 text-gray-300 text-xs px-2 py-1 rounded outline-none w-48 placeholder-gray-600 shadow-lg"
          />
        )}

        {tooltip &&
          !pendingNote &&
          (() => {
            const p = tooltip.point;
            const durationMs = p.endedAt === null ? 0 : p.endedAt - p.startedAt;
            return (
              <div
                style={{
                  position: "absolute",
                  left: tooltip.screenX + 14,
                  top: tooltip.screenY + 14,
                  pointerEvents: "none",
                }}
                className="bg-zinc-900 border border-gray-800 text-xs rounded px-2 py-1.5 shadow-lg"
              >
                <div className="text-gray-400 font-mono tabular-nums">
                  {formatElapsed(Math.max(0, durationMs))}
                </div>
                {p.note && (
                  <div
                    className="text-gray-500 mt-0.5 leading-tight"
                    style={{ maxWidth: 160 }}
                  >
                    {p.note}
                  </div>
                )}
              </div>
            );
          })()}

        {activeRoleName && (
          <div className="absolute top-4 left-4 flex items-center gap-3 bg-zinc-950 px-4 py-2 rounded border border-gray-800 shadow-lg">
            <div>
              <span className="text-gray-500 text-sm">Active:</span>
              <span className="ml-2 text-gray-300">{activeRoleName}</span>
            </div>
            <div className="flex items-center gap-2 border-l border-gray-800 pl-3">
              <span
                className={`text-sm font-mono tabular-nums w-14 text-right ${isRunning ? "text-gray-200" : "text-gray-600"}`}
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

        <div className="absolute bottom-4 left-4 flex text-gray-500 items-center gap-1 bg-zinc-950 rounded border border-gray-800 overflow-hidden">
          <span className="px-2 py-1">{Math.round(scale * 100)}%</span>
          <div className="w-px h-4 bg-gray-800" />
          <button
            onClick={() => {
              const el = containerRef.current;
              if (!el) return;
              zoomReset(points, el.getBoundingClientRect());
            }}
            title="Reset zoom (100%)"
            className="flex-row px-2 py-1 text-xs hover:text-gray-300 hover:bg-zinc-800 transition font-mono tabular-nums"
          >
            <RotateCw size={20} />
          </button>
          <div className="w-px h-4 bg-gray-800" />
          <button
            onClick={() => {
              const el = containerRef.current;
              if (!el) return;
              zoomToFit(points, el.getBoundingClientRect());
            }}
            title="Fit all content in view"
            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-300 hover:bg-zinc-800 transition"
          >
            <Fullscreen size={20} />
          </button>
        </div>

        <div className="absolute top-4 right-4 flex items-center bg-zinc-950 rounded border border-gray-800 overflow-hidden">
          {[
            {
              icon: <HelpCircle size={16} />,
              title: "Keyboard shortcuts (?)",
              onClick: () => {
                setShowHelp((s) => !s);
                setShowSettings(false);
              },
            },
            {
              icon: <Undo2 size={16} />,
              title: "Undo (Ctrl+Z)",
              onClick: undo,
            },
            {
              icon: <Redo2 size={16} />,
              title: "Redo (Ctrl+Shift+Z)",
              onClick: redo,
            },
            {
              icon: <Settings size={16} />,
              title: "Settings",
              onClick: () => {
                setShowSettings((s) => !s);
                setShowHelp(false);
              },
            },
          ].map(({ icon, title, onClick }, i, arr) => (
            <button
              key={title}
              onClick={onClick}
              title={title}
              className={`p-2 text-gray-500 hover:text-gray-300 hover:bg-zinc-800 transition
                ${i < arr.length - 1 ? "border-r border-gray-800" : ""}`}
            >
              {icon}
            </button>
          ))}
        </div>

        {showHelp && (
          <div className="absolute top-14 right-4 bg-zinc-950 border border-gray-800 rounded shadow-xl text-xs text-gray-400 w-64 overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-800 text-gray-300 font-medium">
              Keyboard shortcuts
            </div>
            <table className="w-full">
              <tbody>
                {[
                  ["Enter", "Toggle timer"],
                  ["Ctrl+Z", "Undo"],
                  ["Ctrl+Shift+Z / Ctrl+Y", "Redo"],
                  ["Ctrl+S", "Save to file"],
                  ["Ctrl+O", "Open file"],
                  ["Ctrl++ / Ctrl+=", "Zoom in"],
                  ["Ctrl+-", "Zoom out"],
                  ["Pinch / Ctrl+scroll", "Zoom"],
                ].map(([key, desc]) => (
                  <tr
                    key={key}
                    className="border-b border-gray-900 last:border-0"
                  >
                    <td className="px-3 py-1.5 font-mono text-gray-500 whitespace-nowrap">
                      {key}
                    </td>
                    <td className="px-3 py-1.5 text-gray-400">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
