import { useState, useMemo } from "react";
import { Input, Textarea, Button, useI18n } from "@levkobe/c7one";
import { Search, Plus, Edit2, Check, X, Trash2 } from "lucide-react";
import { useSkillContext } from "../context/SkillContext";

function TechniqueCard({ tech, roles, onUpdate, onDelete }) {
  const { t } = useI18n();
  const usedByRoles = roles.filter((r) => (r.techniques ?? []).includes(tech.id));
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(tech.name);
  const [editDesc, setEditDesc] = useState(tech.description);

  const startEdit = () => {
    setEditName(tech.name);
    setEditDesc(tech.description);
    setIsEditing(true);
  };

  const save = () => {
    const name = editName.trim();
    const description = editDesc.trim();
    if (name) onUpdate({ name, description });
    setIsEditing(false);
  };

  const cancel = () => setIsEditing(false);

  if (isEditing) {
    return (
      <div className="rounded-lg border border-border bg-bg-elevated px-4 py-3 space-y-2">
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && cancel()}
          placeholder={t("techniques.name.placeholder")}
          autoFocus
          className="font-semibold"
        />
        <Textarea
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          rows={3}
          className="resize-none text-xs"
          placeholder={t("techniques.description.placeholder")}
        />
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            className="flex-1 gap-1"
            onClick={save}
          >
            <Check size={13} /> {t("common.save")}
          </Button>
          <Button variant="secondary" size="sm" className="flex-1" onClick={cancel}>
            {t("common.cancel")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative rounded-lg border border-border bg-bg-elevated px-4 py-3">
      <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="p-1 h-auto w-auto"
          title={t("techniques.edit")}
          onClick={startEdit}
        >
          <Edit2 size={12} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="p-1 h-auto w-auto text-error hover:text-error"
          title={t("techniques.delete")}
          onClick={onDelete}
        >
          <Trash2 size={12} />
        </Button>
      </div>
      <p className="text-sm font-semibold text-fg-primary mb-1 pr-12">
        {tech.name}
      </p>
      <p className="text-xs text-fg-secondary leading-relaxed">
        {tech.description}
      </p>
      {usedByRoles.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {usedByRoles.map((r) => (
            <span key={r.id} className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-bg-base border border-border text-fg-muted">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
              {r.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function NewTechniqueForm({ onAdd, onCancel }) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), desc.trim());
  };

  return (
    <div className="rounded-lg border border-border bg-bg-elevated px-4 py-3 space-y-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && onCancel()}
        placeholder={t("techniques.name.placeholder")}
        autoFocus
        className="text-sm font-semibold"
      />
      <Textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        rows={3}
        className="resize-none text-xs"
        placeholder={t("techniques.description.placeholder")}
      />
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          className="flex-1 gap-1"
          onClick={handleAdd}
          disabled={!name.trim()}
        >
          <Plus size={13} /> {t("techniques.add")}
        </Button>
        <Button variant="secondary" size="sm" className="flex-1" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
      </div>
    </div>
  );
}

export function TechniquesWindow() {
  const { t } = useI18n();
  const { techniques, roles, addTechnique, updateTechnique, deleteTechnique } =
    useSkillContext();

  const [query, setQuery] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return techniques;
    return techniques.filter(
      (tech) =>
        tech.name.toLowerCase().includes(q) ||
        tech.description.toLowerCase().includes(q),
    );
  }, [techniques, query]);

  return (
    <div className="flex flex-col h-full bg-bg-base overflow-hidden">
      <div className="px-4 py-3 border-b border-border shrink-0 flex gap-2">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-disabled pointer-events-none"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("techniques.search")}
            className="pl-8"
          />
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowNewForm(true)}
          title={t("techniques.new")}
          disabled={showNewForm}
        >
          <Plus size={16} />
        </Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {showNewForm && (
          <NewTechniqueForm
            onAdd={(name, desc) => {
              addTechnique(name, desc);
              setShowNewForm(false);
            }}
            onCancel={() => setShowNewForm(false)}
          />
        )}

        {filtered.length === 0 && !showNewForm && (
          <p className="text-sm text-fg-disabled text-center py-8">
            {t("techniques.empty")}
          </p>
        )}

        {filtered.map((tech) => (
          <TechniqueCard
            key={tech.id}
            tech={tech}
            roles={roles}
            onUpdate={(updates) => updateTechnique(tech.id, updates)}
            onDelete={() => deleteTechnique(tech.id)}
          />
        ))}
      </div>
    </div>
  );
}
