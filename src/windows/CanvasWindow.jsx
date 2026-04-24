import { useState, useRef } from "react";
import { Fullscreen, HelpCircle, Undo2, Redo2, RotateCw } from "lucide-react";
import { Card, Button, Divider, useC7One, useI18n } from "@levkobe/c7one";
import { useSkillContext } from "../context/SkillContext";
import { useCanvasDrag } from "../hooks/useCanvasDrag";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { WebCanvas } from "../panels/WebCanvas";
import { formatElapsed } from "../utils/time";

const TOOLTIP_HIT_RADIUS = 12;

export function CanvasWindow() {
  const { t } = useI18n();
  const {
    roles,
    points,
    connections,
    offset,
    settings,
    techniques,
    activeRole,
    activeMechanic,
    setOffset,
    addPoint,
    updatePointNote,
    timer,
    handleTimerToggle,
    handleTimerStop,
    fileInputRef,
    save,
    undo,
    redo,
  } = useSkillContext();

  const { colors } = useC7One();
  const bgColor = colors["--color-bg-base"] || "#0f0f0f";

  const { isDragging, dragHandlers, scale, zoom, zoomReset, zoomToFit } =
    useCanvasDrag(offset, setOffset);

  const containerRef = useRef(null);
  const lastCanvasPos = useRef(null);
  const [pendingNote, setPendingNote] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [tooltip, setTooltip] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

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
    setActiveRole: undefined,
    onTimerToggle: activeRole ? handleTimerToggle : undefined,
    onZoom: handleKeyboardZoom,
  });

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
    if (settings.timerActiveByDefault ?? false) timer.start();
    else handleTimerStop();
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
  const activeMechanicName = techniques.find((t) => t.id === activeMechanic)?.name;

  const shortcuts = [
    ["Enter", t("shortcut.enter")],
    ["Ctrl+Z", t("shortcut.ctrlZ")],
    ["Ctrl+Shift+Z / Ctrl+Y", t("shortcut.ctrlShiftZ")],
    ["Ctrl+S", t("shortcut.ctrlS")],
    ["Ctrl+O", t("shortcut.ctrlO")],
    ["Ctrl++ / Ctrl+=", t("shortcut.zoomIn")],
    ["Ctrl+-", t("shortcut.zoomOut")],
    ["Pinch / Ctrl+scroll", t("shortcut.pinch")],
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
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
        bgColor={bgColor}
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
          placeholder={t("canvas.note.placeholder")}
          style={{
            position: "absolute",
            left: pendingNote.screenX + 10,
            top: pendingNote.screenY + 10,
          }}
          className="bg-bg-elevated border border-border text-fg-primary text-xs px-2 py-1 rounded-(--radius) outline-none w-48 placeholder:text-fg-disabled shadow-c7-sm"
        />
      )}

      {tooltip &&
        !pendingNote &&
        (() => {
          const p = tooltip.point;
          const durationMs =
            p.endedAt === null ? 0 : p.endedAt - p.startedAt;
          return (
            <div
              style={{
                position: "absolute",
                left: tooltip.screenX + 14,
                top: tooltip.screenY + 14,
                pointerEvents: "none",
              }}
              className="bg-bg-elevated border border-border text-xs rounded-(--radius) px-2 py-1.5 shadow-c7-sm"
            >
              <div className="text-fg-muted font-mono tabular-nums">
                {formatElapsed(Math.max(0, durationMs))}
              </div>
              {p.note && (
                <div
                  className="text-fg-disabled mt-0.5 leading-tight"
                  style={{ maxWidth: 160 }}
                >
                  {p.note}
                </div>
              )}
            </div>
          );
        })()}

      {activeRoleName && (
        <Card
          variant="flat"
          className="absolute top-4 left-4 flex items-center gap-3 px-4 py-2 border border-border shadow-c7-sm"
        >
          <div className="flex flex-col">
            <div>
              <span className="text-fg-disabled text-sm">
                {t("canvas.active.label")}
              </span>
              <span className="ml-2 text-fg-primary">{activeRoleName}</span>
            </div>
            {activeMechanicName && (
              <span className="text-xs text-fg-muted mt-0.5">
                {activeMechanicName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 border-l border-border pl-3">
            <span
              className={`text-sm font-mono tabular-nums w-14 text-right ${
                timer.isRunning ? "text-fg-primary" : "text-fg-disabled"
              }`}
            >
              {formatElapsed(timer.elapsed)}
            </span>
            <Button
              variant={timer.isRunning ? "destructive" : "secondary"}
              size="sm"
              onClick={handleTimerToggle}
              title={t("canvas.timer.toggle")}
            >
              {timer.isRunning
                ? t("canvas.timer.stop")
                : t("canvas.timer.start")}
            </Button>
          </div>
        </Card>
      )}

      <Card
        variant="flat"
        className="absolute bottom-4 left-4 flex items-center border border-border overflow-hidden text-fg-muted"
      >
        <span className="px-2 py-1 text-sm tabular-nums">
          {Math.round(scale * 100)}%
        </span>
        <Divider orientation="vertical" className="h-4 mx-0" />
        <button
          onClick={() => {
            const el = containerRef.current;
            if (!el) return;
            zoomReset(points, el.getBoundingClientRect());
          }}
          title={t("canvas.zoom.reset")}
          className="px-2 py-1 hover:text-fg-primary hover:bg-bg-elevated transition-colors"
        >
          <RotateCw size={16} />
        </button>
        <Divider orientation="vertical" className="h-4 mx-0" />
        <button
          onClick={() => {
            const el = containerRef.current;
            if (!el) return;
            zoomToFit(points, el.getBoundingClientRect());
          }}
          title={t("canvas.zoom.fit")}
          className="px-2 py-1 hover:text-fg-primary hover:bg-bg-elevated transition-colors"
        >
          <Fullscreen size={16} />
        </button>
      </Card>

      <Card
        variant="flat"
        className="absolute top-4 right-4 flex items-center border border-border overflow-hidden"
      >
        {[
          {
            icon: <HelpCircle size={15} />,
            title: t("canvas.shortcuts.button"),
            onClick: () => setShowHelp((s) => !s),
          },
          {
            icon: <Undo2 size={15} />,
            title: t("canvas.undo"),
            onClick: undo,
          },
          {
            icon: <Redo2 size={15} />,
            title: t("canvas.redo"),
            onClick: redo,
          },
        ].map(({ icon, title, onClick }, i, arr) => (
          <button
            key={title}
            onClick={onClick}
            title={title}
            className={`p-2 text-fg-muted hover:text-fg-primary hover:bg-bg-elevated transition-colors ${
              i < arr.length - 1 ? "border-r border-border" : ""
            }`}
          >
            {icon}
          </button>
        ))}
      </Card>

      {showHelp && (
        <Card
          variant="flat"
          className="absolute top-14 right-4 border border-border shadow-c7-sm text-xs text-fg-muted w-64 overflow-hidden"
        >
          <div className="px-3 py-2 border-b border-border text-fg-primary font-medium text-sm">
            {t("canvas.help.title")}
          </div>
          <table className="w-full">
            <tbody>
              {shortcuts.map(([key, desc]) => (
                <tr key={key} className="border-b border-border last:border-0">
                  <td className="px-3 py-1.5 font-mono text-fg-disabled whitespace-nowrap">
                    {key}
                  </td>
                  <td className="px-3 py-1.5 text-fg-muted">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
