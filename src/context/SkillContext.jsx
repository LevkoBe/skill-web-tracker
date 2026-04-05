import { createContext, useContext, useRef } from "react";
import { useSkillWeb } from "../hooks/useSkillWeb";
import { useTimer } from "../hooks/useTimer";

const SkillContext = createContext(null);

export function SkillWebProvider({ children }) {
  const skillWeb = useSkillWeb();
  const timer = useTimer();
  const fileInputRef = useRef(null);

  const triggerLoad = () => fileInputRef.current?.click();

  const handleTimerStop = () => {
    skillWeb.finalizeLastOpenPoint();
    timer.stop();
  };

  const handleTimerToggle = () =>
    timer.isRunning ? handleTimerStop() : timer.start();

  const handleRoleSelect = (id) => {
    skillWeb.setActiveRole(id);
    timer.stop();
    if (id !== null && (skillWeb.settings.timerActiveByDefault ?? false))
      timer.start();
  };

  const handleSettingsChange = (next) => {
    const justEnabled =
      !skillWeb.settings.timerActiveByDefault && next.timerActiveByDefault;
    skillWeb.setSettings(next);
    if (justEnabled && skillWeb.activeRole !== null && !timer.isRunning)
      timer.start();
  };

  const value = {
    ...skillWeb,
    timer,
    fileInputRef,
    triggerLoad,
    handleTimerStop,
    handleTimerToggle,
    handleRoleSelect,
    handleSettingsChange,
  };

  return (
    <SkillContext.Provider value={value}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={skillWeb.load}
        className="hidden"
      />
      {children}
    </SkillContext.Provider>
  );
}

export const useSkillContext = () => useContext(SkillContext);
