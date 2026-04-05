import { useState, useRef } from "react";
import { Edit2, Trash2, Palette } from "lucide-react";
import { Card, Button, Input, Textarea, useI18n } from "@levkobe/c7one";
import { randomBrightColor } from "../utils/colors";

export const RoleItem = ({
  role,
  isActive,
  level,
  onSelect,
  onDelete,
  onColorChange,
  onUpdateRole,
}) => {
  const { t } = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempName, setTempName] = useState(role.name);
  const [tempDescription, setTempDescription] = useState(role.description);
  const formRef = useRef(null);

  const commitEdits = () => {
    const updates = {};
    if (tempName !== role.name) updates.name = tempName;
    if (tempDescription !== role.description)
      updates.description = tempDescription;
    if (Object.keys(updates).length > 0) onUpdateRole(updates);
    setIsEditing(false);
  };

  const handleBlur = (e) => {
    if (formRef.current && !formRef.current.contains(e.relatedTarget))
      commitEdits();
  };

  const startEditing = (e) => {
    e.stopPropagation();
    setTempName(role.name);
    setTempDescription(role.description);
    setIsEditing(true);
  };

  return (
    <Card
      variant={isActive ? "elevated" : "outlined"}
      className={`cursor-pointer transition-colors select-none ${
        isActive ? "" : "hover:bg-bg-elevated"
      }`}
      onClick={onSelect}
      onDoubleClick={startEditing}
      title={role.description || ""}
    >
      {isEditing ? (
        <div
          ref={formRef}
          className="p-3 space-y-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Input
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === "Enter" && commitEdits()}
            autoFocus
          />
          <Textarea
            value={tempDescription}
            onChange={(e) => setTempDescription(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                commitEdits();
              }
            }}
            placeholder={t("role.description.placeholder")}
            rows={3}
            className="resize-none"
          />
        </div>
      ) : (
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative shrink-0">
              <div
                className="w-3 h-3 rounded-full cursor-pointer"
                style={{
                  backgroundColor: role.color,
                  boxShadow: `0 0 4px ${role.color}`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColorPicker((v) => !v);
                }}
              />
              {showColorPicker && (
                <input
                  type="color"
                  value={role.color}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="absolute top-0 left-0 opacity-0 w-3 h-3 cursor-pointer"
                />
              )}
            </div>
            <span className="text-fg-primary text-sm truncate">{role.name}</span>
            <span className="text-xs text-fg-disabled shrink-0">
              {t("role.level", { n: level })}
            </span>
          </div>

          <div className="flex gap-0.5 shrink-0 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onColorChange(randomBrightColor());
              }}
              title={t("role.color.randomize")}
              className="p-1 h-auto w-auto"
            >
              <Palette size={13} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={startEditing}
              title={t("role.edit")}
              className="p-1 h-auto w-auto"
            >
              <Edit2 size={13} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title={t("role.delete")}
              className="p-1 h-auto w-auto text-error hover:text-error"
            >
              <Trash2 size={13} />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
