import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Info,
  Zap,
  Footprints,
  GitFork,
  Edit2,
  Check,
  X,
  Trash2,
} from "lucide-react";
import {
  Modal,
  Badge,
  Button,
  Input,
  Textarea,
  Select,
  useI18n,
} from "@levkobe/c7one";
import rolesData from "../data/roles.json";
import { useSkillContext } from "../context/SkillContext";

const roleMetaMap = new Map(rolesData.map((r) => [r.id, r]));

const TYPE_BADGE = {
  positive: "success",
  negative: "error",
  neutral: "neutral",
  shadow: "warning",
};

// ── Small reusable components ─────────────────────────────────────────────────

function ComplexityDots({ value, max = 5 }) {
  return (
    <div className="flex gap-0.5 items-center">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            i < value ? "bg-fg-primary" : "bg-fg-disabled/30"
          }`}
        />
      ))}
    </div>
  );
}

/**
 * Technique chip — tooltip rendered via portal so it's never clipped by modal overflow.
 * In edit mode shows a trash button instead of navigating.
 */
function TechChip({ tech, isEditing, onDelete }) {
  const [tooltipPos, setTooltipPos] = useState(null);
  if (!tech) return null;

  if (isEditing) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-border bg-bg-elevated text-fg-secondary">
        {tech.name}
        <button
          className="text-fg-disabled hover:text-error transition-colors ml-0.5"
          onClick={onDelete}
          title="Remove"
        >
          <Trash2 size={10} />
        </button>
      </span>
    );
  }

  return (
    <>
      <span
        className="inline-block px-2 py-0.5 rounded-full text-xs border border-border bg-bg-elevated text-fg-secondary cursor-default select-none hover:border-fg-disabled transition-colors"
        onMouseEnter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setTooltipPos({ x: rect.left, y: rect.top });
        }}
        onMouseLeave={() => setTooltipPos(null)}
      >
        {tech.name}
      </span>

      {tooltipPos &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: tooltipPos.x,
              top: tooltipPos.y - 8,
              transform: "translateY(-100%)",
              zIndex: 9999,
              width: "15rem",
            }}
            className="rounded-lg border border-border bg-bg-elevated shadow-xl px-3 py-2 pointer-events-none"
          >
            <p className="text-xs font-semibold text-fg-primary mb-1">
              {tech.name}
            </p>
            <p className="text-xs text-fg-secondary leading-relaxed">
              {tech.description}
            </p>
          </div>,
          document.body,
        )}
    </>
  );
}

/** Role pill — in edit mode shows trash, otherwise navigates */
function RolePill({ roleId, isEditing, onDelete, onOpen }) {
  const { roles } = useSkillContext();
  const liveRole = roles.find((r) => r.id === roleId);
  const meta = liveRole ?? roleMetaMap.get(roleId);
  if (!meta) return null;

  if (isEditing) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-border bg-bg-elevated text-fg-secondary">
        {liveRole && (
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: liveRole.color }}
          />
        )}
        {meta.name}
        <button
          className="text-fg-disabled hover:text-error transition-colors ml-0.5"
          onClick={onDelete}
          title="Remove"
        >
          <Trash2 size={10} />
        </button>
      </span>
    );
  }

  return (
    <button
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-border bg-bg-elevated text-fg-secondary hover:text-fg-primary hover:border-fg-disabled transition-colors"
      onClick={() => onOpen(roleId)}
    >
      {liveRole && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: liveRole.color }}
        />
      )}
      {meta.name}
    </button>
  );
}

/** Inline row with icon + label + content */
function Row({ icon, label, children }) {
  return (
    <div className="flex gap-3 py-3 border-b border-border last:border-0">
      <div className="shrink-0 mt-0.5 text-fg-disabled">{icon}</div>
      <div className="flex-1 min-w-0">
        {label && (
          <p className="text-xs text-fg-disabled uppercase tracking-wider font-semibold mb-1.5">
            {label}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

/**
 * A Select that resets to placeholder after each selection — used for the
 * "add item" affordance in edit mode.
 */
function AddSelect({ options, onAdd, placeholder }) {
  const [val, setVal] = useState("");
  if (!options.length) return null;
  return (
    <Select
      options={options}
      value={val}
      onValueChange={(v) => {
        onAdd(v);
        setVal("");
      }}
      placeholder={placeholder}
      className="h-7 text-xs min-w-44"
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function RoleCardModal({ role, usageLevel, open, onOpenChange }) {
  const { t } = useI18n();
  const { roles, techniques, updateRole } = useSkillContext();

  // Build live tech map from context so custom techniques appear
  const techMap = useMemo(
    () => new Map(techniques.map((t) => [t.id, t])),
    [techniques],
  );

  // Navigation stack
  const [stack, setStack] = useState([]);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editTechniques, setEditTechniques] = useState([]);
  const [editBuildsFrom, setEditBuildsFrom] = useState([]);
  const [editBuildsInto, setEditBuildsInto] = useState([]);

  const handleClose = () => {
    setStack([]);
    setIsEditing(false);
    onOpenChange(false);
  };

  const handleOpenRelated = (roleId) => {
    setIsEditing(false);
    setStack((s) => [...s, roleId]);
  };

  const handleBack = () => {
    setIsEditing(false);
    setStack((s) => s.slice(0, -1));
  };

  // Resolve displayed role
  const activeRoleId = stack.length > 0 ? stack[stack.length - 1] : null;
  const displayRole = activeRoleId
    ? (roles.find((r) => r.id === activeRoleId) ??
      roleMetaMap.get(activeRoleId) ??
      role)
    : role;

  const isLiveRole = roles.some((r) => r.id === displayRole.id);

  const startEdit = () => {
    setEditName(displayRole.name);
    setEditSummary(displayRole.summary ?? "");
    setEditTechniques([...(displayRole.techniques ?? [])]);
    setEditBuildsFrom([...(displayRole.buildsFrom ?? [])]);
    setEditBuildsInto([...(displayRole.buildsInto ?? [])]);
    setIsEditing(true);
  };

  const cancelEdit = () => setIsEditing(false);

  const saveEdit = () => {
    updateRole(displayRole.id, {
      name: editName.trim() || displayRole.name,
      summary: editSummary,
      techniques: editTechniques,
      buildsFrom: editBuildsFrom,
      buildsInto: editBuildsInto,
    });
    setIsEditing(false);
  };

  // ── Computed option lists for the Add selectors ──────────────────────────
  const techOptions = useMemo(
    () =>
      techniques
        .filter((t) => !editTechniques.includes(t.id))
        .map((t) => ({ value: t.id, label: t.name })),
    [techniques, editTechniques],
  );

  const roleOptions = useMemo(
    () =>
      roles
        .filter((r) => r.id !== displayRole.id)
        .map((r) => ({ value: r.id, label: r.name })),
    [roles, displayRole.id],
  );

  const buildsFromOptions = useMemo(
    () => roleOptions.filter((o) => !editBuildsFrom.includes(o.value)),
    [roleOptions, editBuildsFrom],
  );

  const buildsIntoOptions = useMemo(
    () => roleOptions.filter((o) => !editBuildsInto.includes(o.value)),
    [roleOptions, editBuildsInto],
  );

  const typeColor = TYPE_BADGE[displayRole.type] ?? "neutral";

  // Resolve technique objects for display (view + edit)
  const displayTechs = isEditing
    ? editTechniques.map((id) => techMap.get(id)).filter(Boolean)
    : (displayRole.techniques ?? []).map((id) => techMap.get(id)).filter(Boolean);

  const displayBuildsFrom = isEditing ? editBuildsFrom : (displayRole.buildsFrom ?? []);
  const displayBuildsInto = isEditing ? editBuildsInto : (displayRole.buildsInto ?? []);

  // Whether a section should be visible (always in edit, only when non-empty otherwise)
  const showTechs = isEditing || displayTechs.length > 0;
  const showFrom = isEditing || displayBuildsFrom.length > 0;
  const showInto = isEditing || displayBuildsInto.length > 0;

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <Modal.Content
        title={displayRole.name}
        description={displayRole.summary ?? "Role details"}
        className="max-w-md w-full"
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {stack.length > 0 && (
                <button
                  className="text-xs text-fg-disabled hover:text-fg-primary mr-1"
                  onClick={handleBack}
                >
                  ← back
                </button>
              )}
              {isEditing ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                  autoFocus
                  className="h-7 text-base font-semibold"
                />
              ) : (
                <h2 className="text-lg font-semibold text-fg-primary leading-tight">
                  {displayRole.name}
                </h2>
              )}
              <Badge variant={typeColor} className="text-xs capitalize shrink-0">
                {displayRole.type ?? "positive"}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs text-fg-disabled">
                {t("roleCard.complexity", { n: displayRole.complexity ?? 1 })}
              </span>
              <ComplexityDots value={displayRole.complexity ?? 1} />
              {usageLevel != null && !activeRoleId && (
                <span className="text-xs text-fg-disabled">
                  {t("role.level", { n: usageLevel })}
                </span>
              )}
            </div>
          </div>

          {/* Color dot + edit controls */}
          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
            <div
              className="w-3.5 h-3.5 rounded-full"
              style={{
                backgroundColor: displayRole.color,
                boxShadow: `0 0 6px ${displayRole.color}`,
              }}
            />
            {isLiveRole && !isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto w-auto"
                title={t("role.edit")}
                onClick={startEdit}
              >
                <Edit2 size={13} />
              </Button>
            )}
            {isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto w-auto text-success hover:text-success"
                  title={t("common.save")}
                  onClick={saveEdit}
                >
                  <Check size={13} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto w-auto text-error hover:text-error"
                  title={t("common.cancel")}
                  onClick={cancelEdit}
                >
                  <X size={13} />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* ── Rows ───────────────────────────────────────────────── */}
        <div>
          {/* Summary */}
          <Row icon={<Info size={15} />} label={t("roleCard.summary")}>
            {isEditing ? (
              <Textarea
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
                rows={3}
                className="resize-none text-sm"
              />
            ) : (
              <p className="text-sm text-fg-secondary leading-relaxed">
                {displayRole.summary || (
                  <span className="text-fg-disabled italic">
                    {t("role.summary.placeholder")}
                  </span>
                )}
              </p>
            )}
          </Row>

          {/* Techniques */}
          {showTechs && (
            <Row icon={<Zap size={15} />} label={t("roleCard.techniques")}>
              <div className="flex flex-wrap gap-1.5 items-center">
                {displayTechs.map((tech) => (
                  <TechChip
                    key={tech.id}
                    tech={tech}
                    isEditing={isEditing}
                    onDelete={() =>
                      setEditTechniques((prev) =>
                        prev.filter((id) => id !== tech.id),
                      )
                    }
                  />
                ))}
                {isEditing && (
                  <AddSelect
                    options={techOptions}
                    onAdd={(id) => setEditTechniques((prev) => [...prev, id])}
                    placeholder={t("roleCard.addTechnique")}
                  />
                )}
                {!isEditing && displayTechs.length === 0 && (
                  <span className="text-xs text-fg-disabled italic">—</span>
                )}
              </div>
            </Row>
          )}

          {/* Builds from */}
          {showFrom && (
            <Row icon={<Footprints size={15} />} label={t("roleCard.origins")}>
              <div className="flex flex-wrap gap-1.5 items-center">
                {displayBuildsFrom.map((id) => (
                  <RolePill
                    key={id}
                    roleId={id}
                    isEditing={isEditing}
                    onDelete={() =>
                      setEditBuildsFrom((prev) => prev.filter((r) => r !== id))
                    }
                    onOpen={handleOpenRelated}
                  />
                ))}
                {isEditing && (
                  <AddSelect
                    options={buildsFromOptions}
                    onAdd={(id) => setEditBuildsFrom((prev) => [...prev, id])}
                    placeholder={t("roleCard.addRole")}
                  />
                )}
                {!isEditing && displayBuildsFrom.length === 0 && (
                  <span className="text-xs text-fg-disabled italic">—</span>
                )}
              </div>
            </Row>
          )}

          {/* Builds into */}
          {showInto && (
            <Row icon={<GitFork size={15} />} label={t("roleCard.paths")}>
              <div className="flex flex-wrap gap-1.5 items-center">
                {displayBuildsInto.map((id) => (
                  <RolePill
                    key={id}
                    roleId={id}
                    isEditing={isEditing}
                    onDelete={() =>
                      setEditBuildsInto((prev) => prev.filter((r) => r !== id))
                    }
                    onOpen={handleOpenRelated}
                  />
                ))}
                {isEditing && (
                  <AddSelect
                    options={buildsIntoOptions}
                    onAdd={(id) => setEditBuildsInto((prev) => [...prev, id])}
                    placeholder={t("roleCard.addRole")}
                  />
                )}
                {!isEditing && displayBuildsInto.length === 0 && (
                  <span className="text-xs text-fg-disabled italic">—</span>
                )}
              </div>
            </Row>
          )}
        </div>

        {/* Footer Save/Cancel when editing */}
        {isEditing && (
          <div className="flex gap-2 mt-4 pt-3 border-t border-border">
            <Button
              variant="primary"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={saveEdit}
            >
              <Check size={14} /> {t("common.save")}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={cancelEdit}
            >
              {t("common.cancel")}
            </Button>
          </div>
        )}
      </Modal.Content>
    </Modal>
  );
}
