import { useEffect } from "react";

/**
 *   Ctrl+Z - undo
 *   Ctrl+Shift+Z - redo
 *   Ctrl+Y - redo (alternate)
 *   Ctrl+S - save to file
 *   Ctrl+O - open file picker
 *   Escape - deselect active role
 */
export const useKeyboardShortcuts = ({
  undo,
  redo,
  save,
  fileInputRef,
  setActiveRole,
  onTimerToggle,
}) => {
  useEffect(() => {
    const onKeyDown = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;

      if (!ctrl) {
        const inTextField = ["INPUT", "TEXTAREA"].includes(e.target.tagName);

        switch (true) {
          case e.code === "Enter" && !inTextField:
            console.log("Enter");
            e.preventDefault();
            onTimerToggle?.();
            break;
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

        default:
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo, save, fileInputRef, setActiveRole, onTimerToggle]);
};
