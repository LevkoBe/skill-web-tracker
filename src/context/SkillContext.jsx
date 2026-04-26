import { createContext, useContext, useRef } from "react";
import { DEFAULT_SETTINGS } from "../config";
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

  const defaultMechanicFor = (roleId) => {
    if (!roleId) return null;
    const role = skillWeb.roles.find((r) => r.id === roleId);
    const mechs = role?.techniques ?? [];
    if (!mechs.length) return null;
    const isGradual = (skillWeb.settings.gameMode ?? DEFAULT_SETTINGS.gameMode) === "gradual";
    if (!isGradual) return mechs[0];
    return mechs.find((m) => skillWeb.unlockedNodes.includes(m)) ?? null;
  };

  const handleRoleSelect = (id) => {
    skillWeb.setActiveRole(id);
    skillWeb.setActiveMechanic(defaultMechanicFor(id));
    timer.stop();
    if (id !== null && (skillWeb.settings.timerActiveByDefault ?? false))
      timer.start();
  };

  const handleMechanicSelect = (mechId) => {
    skillWeb.setActiveMechanic(
      mechId === skillWeb.activeMechanic ? null : mechId,
    );
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
    handleMechanicSelect,
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

// eslint-disable-next-line react-refresh/only-export-components
export const useSkillContext = () => useContext(SkillContext);
