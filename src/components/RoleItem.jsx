import { useState } from "react";
import { Trash2, Palette, Maximize2 } from "lucide-react";
import { Card, Button, useI18n } from "@levkobe/c7one";
import { randomBrightColor } from "../utils/colors";
import { RoleCardModal } from "./RoleCardModal";

export const RoleItem = ({
  role,
  isActive,
  level,
  onSelect,
  onDelete,
  onColorChange,
}) => {
  const { t } = useI18n();
  const [showCard, setShowCard] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const openCard = (e) => {
    e?.stopPropagation();
    setShowCard(true);
  };

  return (
    <>
      <Card
        variant={isActive ? "elevated" : "outlined"}
        className={`p-0 cursor-pointer transition-colors select-none ${
          isActive ? "" : "hover:bg-bg-elevated"
        }`}
        onClick={onSelect}
        onDoubleClick={openCard}
        title={role.summary || ""}
      >
        <div className="flex items-center justify-between px-2.5 py-2">
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
              onClick={openCard}
              title={t("role.open")}
              className="p-1 h-auto w-auto"
            >
              <Maximize2 size={13} />
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
      </Card>

      <RoleCardModal
        role={role}
        usageLevel={level}
        open={showCard}
        onOpenChange={setShowCard}
      />
    </>
  );
};
