import { useState, useRef } from "react";
import { Edit2, Trash2, Palette } from "lucide-react";
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
    <div
      className={`p-3 rounded cursor-pointer border transition ${
        isActive
          ? "border-gray-700 bg-black shadow-inner"
          : "border-gray-900 hover:bg-black hover:border-gray-800"
      }`}
      onClick={onSelect}
      onDoubleClick={startEditing}
      title={role.description || "No description"}
    >
      {isEditing ? (
        <div
          ref={formRef}
          className="space-y-2"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === "Enter" && commitEdits()}
            className="bg-black border border-gray-800 px-2 py-1 rounded outline-none w-full text-gray-300"
            autoFocus
          />
          <textarea
            value={tempDescription}
            onChange={(e) => setTempDescription(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                commitEdits();
              }
            }}
            placeholder="Description..."
            className="bg-black border border-gray-800 px-2 py-1 rounded outline-none w-full text-gray-300 text-xs resize-none"
            rows={3}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div
                className="w-3 h-3 rounded-full shadow-sm cursor-pointer"
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
            <span className="text-gray-300">{role.name}</span>
            <span className="text-xs text-gray-600 ml-1">Lv.{level}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onColorChange(randomBrightColor());
              }}
              className="text-gray-600 hover:text-gray-400 transition-colors"
              title="Randomize color"
            >
              <Palette size={14} />
            </button>
            <button
              onClick={startEditing}
              className="text-gray-600 hover:text-gray-400 transition-colors"
              title="Edit role"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-gray-600 hover:text-red-900 transition-colors"
              title="Delete role"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
