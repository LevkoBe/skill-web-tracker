import { useState, useMemo } from "react";
import { Plus, Save, Upload, RotateCcw, Lock, Maximize2, Edit2, X, Check } from "lucide-react";
import { Button, Input, Textarea, Modal, useI18n } from "@levkobe/c7one";
import { RoleItem } from "../components/RoleItem";
import { useRoleStats } from "../hooks/useRoleStats";
import { useSkillContext } from "../context/SkillContext";
import { DEFAULT_SETTINGS } from "../config";

function TechniqueModal({ tech, open, onOpenChange, onUpdate }) {
  const { t } = useI18n();
  const { roles } = useSkillContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(tech.name);
  const [editDesc, setEditDesc] = useState(tech.description);
  const usedByRoles = roles.filter((r) => (r.techniques ?? []).includes(tech.id));

  const startEdit = () => {
    setEditName(tech.name);
    setEditDesc(tech.description);
    setIsEditing(true);
  };

  const save = () => {
    const name = editName.trim();
    const desc = editDesc.trim();
    if (name) onUpdate({ name, description: desc });
    setIsEditing(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <Modal.Content className="max-w-sm w-full">
        <div className="space-y-3">
          {isEditing ? (
            <>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setIsEditing(false)}
                placeholder={t("techniques.name.placeholder")}
                autoFocus
                className="font-semibold"
              />
              <Textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={4}
                className="resize-none text-sm"
                placeholder={t("techniques.description.placeholder")}
              />
              <div className="flex gap-2">
                <Button variant="primary" size="sm" className="flex-1 gap-1" onClick={save}>
                  <Check size={13} /> {t("common.save")}
                </Button>
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => setIsEditing(false)}>
                  {t("common.cancel")}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-base font-semibold text-fg-primary">{tech.name}</h2>
                <Button variant="ghost" size="sm" className="p-1 h-auto w-auto shrink-0" onClick={startEdit} title={t("techniques.edit")}>
                  <Edit2 size={13} />
                </Button>
              </div>
              {tech.description && (
                <p className="text-sm text-fg-secondary leading-relaxed">{tech.description}</p>
              )}
              {usedByRoles.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {usedByRoles.map((r) => (
                    <span key={r.id} className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-bg-base border border-border text-fg-muted">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                      {r.name}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Modal.Content>
    </Modal>
  );
}

function TechniqueRow({ techId, techMap, isActive, isUnlocked, onSelect, onRemove, onUpdate }) {
  const { t } = useI18n();
  const [showModal, setShowModal] = useState(false);
  const tech = techMap.get(techId);
  const name = tech?.name ?? techId;

  if (!isUnlocked) {
    return (
      <div className="flex items-center gap-2 pl-5 pr-2 py-1.5 rounded-(--radius) border border-border/40 opacity-40 select-none">
        <Lock size={11} className="text-fg-disabled shrink-0" />
        <span className="text-xs text-fg-disabled italic flex-1">{t("techniques.locked")}</span>
      </div>
    );
  }

  return (
    <>
      <div
        title={name}
        className={[
          "group flex items-center gap-2 pl-5 pr-1 py-1 rounded-(--radius) cursor-pointer transition-colors select-none",
          isActive ? "bg-accent/15 text-fg-primary" : "hover:bg-bg-elevated text-fg-secondary",
        ].join(" ")}
        onClick={onSelect}
        onDoubleClick={() => setShowModal(true)}
      >
        <span className="text-sm flex-1 truncate">{name}</span>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-auto w-auto"
            title={t("techniques.edit")}
            onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
          >
            <Maximize2 size={12} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-auto w-auto text-error hover:text-error"
            title={t("roleCard.removeTechnique")}
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
          >
            <X size={12} />
          </Button>
        </div>
      </div>

      {tech && (
        <TechniqueModal
          tech={tech}
          open={showModal}
          onOpenChange={setShowModal}
          onUpdate={(updates) => onUpdate(techId, updates)}
        />
      )}
    </>
  );
}

export function RolesWindow() {
  const { t } = useI18n();
  const {
    roles,
    points,
    techniques,
    settings,
    activeRole,
    activeMechanic,
    unlockedNodes,
    handleRoleSelect,
    handleMechanicSelect,
    addRole,
    deleteRole,
    updateRole,
    updateRoleColor,
    updateTechnique,
    save,
    triggerLoad,
    reset,
  } = useSkillContext();

  const [newRoleName, setNewRoleName] = useState("");
  const isGradual = (settings?.gameMode ?? DEFAULT_SETTINGS.gameMode) === "gradual";
  const { levels, sortedRoles } = useRoleStats(roles, points);
  const unlockedSet = useMemo(() => new Set(unlockedNodes), [unlockedNodes]);

  const visibleRoles = isGradual
    ? sortedRoles.filter((r) => unlockedSet.has(r.id))
    : sortedRoles;

  const techMap = useMemo(
    () => new Map(techniques.map((t) => [t.id, t])),
    [techniques],
  );

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;
    addRole(newRoleName.trim());
    setNewRoleName("");
  };

  const handleReset = () => {
    if (confirm(t("roles.reset.confirm"))) reset();
  };

  const handleRoleClick = (roleId) => {
    handleRoleSelect(activeRole === roleId ? null : roleId);
  };

  const removeTechFromRole = (role, techId) => {
    updateRole(role.id, { techniques: (role.techniques ?? []).filter((id) => id !== techId) });
  };

  return (
    <div
      className="flex flex-col h-full bg-bg-base overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleRoleSelect(null);
      }}
    >
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="flex gap-2 mb-3">
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

        {visibleRoles.map((role) => {
          const isActive = activeRole === role.id;
          const techs = role.techniques ?? [];

          return (
            <div key={role.id}>
              <RoleItem
                role={role}
                isActive={isActive}
                level={levels.get(role.id) ?? 0}
                onSelect={() => handleRoleClick(role.id)}
                onDelete={() => deleteRole(role.id)}
                onColorChange={(color) => updateRoleColor(role.id, color)}
                onUpdateRole={(updates) => updateRole(role.id, updates)}
              />

              {isActive && techs.length > 0 && (
                <div className="mt-0.5 mb-1 space-y-0.5 pl-1">
                  {techs.map((techId) => (
                    <TechniqueRow
                      key={techId}
                      techId={techId}
                      techMap={techMap}
                      isActive={activeMechanic === techId}
                      isUnlocked={!isGradual || unlockedSet.has(techId)}
                      onSelect={() => handleMechanicSelect(techId)}
                      onRemove={() => removeTechFromRole(role, techId)}
                      onUpdate={(id, updates) => updateTechnique(id, updates)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="shrink-0 px-3 py-2 border-t border-border space-y-1.5">
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
