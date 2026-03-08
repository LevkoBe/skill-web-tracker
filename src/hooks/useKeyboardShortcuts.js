import { useEffect } from "react";

/**
 *   Ctrl+Z          - undo
 *   Ctrl+Shift+Z    - redo
 *   Ctrl+Y          - redo (alternate)
 *   Ctrl+S          - save to file
 *   Ctrl+O          - open file picker
 *   Ctrl+= / Ctrl++ - zoom in
 *   Ctrl+-          - zoom out
 *   Escape          - deselect active role
 */
export const useKeyboardShortcuts = ({
  undo,
  redo,
  save,
  fileInputRef,
  setActiveRole,
  onTimerToggle,
  onZoom,
}) => {
  useEffect(() => {
    const onKeyDown = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;

      if (!ctrl) {
        const inTextField = ["INPUT", "TEXTAREA"].includes(e.target.tagName);
        if (e.code === "Enter" && !inTextField) {
          e.preventDefault();
          onTimerToggle?.();
        }
        return;
      }

      switch (e.code) {
        case "KeyZ":
          e.preventDefault();
          if (e.shiftKey) redo();
          else undo();
          break;

        case "KeyY":
          e.preventDefault();
          redo();
          break;

        case "KeyS":
          e.preventDefault();
          save();
          break;

        case "KeyO":
          e.preventDefault();
          fileInputRef.current?.click();
          break;

        case "Equal":
        case "NumpadAdd":
          e.preventDefault();
          onZoom?.(1.2);
          break;

        case "Minus":
        case "NumpadSubtract":
          e.preventDefault();
          onZoom?.(1 / 1.2);
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo, save, fileInputRef, setActiveRole, onTimerToggle, onZoom]);
};
