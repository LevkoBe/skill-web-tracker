import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { DEFAULT_SETTINGS } from "../config";
import { useSkillWeb } from "../hooks/useSkillWeb";
import { useTimer } from "../hooks/useTimer";

const TimerContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useSkillTimer = () => useContext(TimerContext);

function TimerProviderLayer({ timerRef, children }) {
  const timer = useTimer();
  useLayoutEffect(() => {
    timerRef.current = timer;
  });
  return (
    <TimerContext.Provider value={timer}>{children}</TimerContext.Provider>
  );
}

const SkillContext = createContext(null);

export function SkillWebProvider({ children }) {
  const skillWeb = useSkillWeb();

  const {
    roles,
    points,
    connections,
    offset,
    settings,
    techniques,
    pointsPerNode,
    unlockedNodes,
    activeRole,
    activeMechanic,
    setOffset,
    setSettings,
    setActiveRole,
    setActiveMechanic,
    addPoint,
    addRole,
    deleteRole,
    updateRole,
    updateRoleColor,
    finalizeLastOpenPoint,
    updatePointNote,
    addTechnique,
    updateTechnique,
    deleteTechnique,
    save,
    load,
    reset,
    undo,
    redo,
  } = skillWeb;

  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  const settingsRef = useRef(settings);
  const activeMechanicRef = useRef(activeMechanic);
  const activeRoleRef = useRef(activeRole);
  const rolesRef = useRef(roles);
  const unlockedNodesRef = useRef(unlockedNodes);
  useLayoutEffect(() => {
    settingsRef.current = settings;
    activeMechanicRef.current = activeMechanic;
    activeRoleRef.current = activeRole;
    rolesRef.current = roles;
    unlockedNodesRef.current = unlockedNodes;
  });

  const triggerLoad = useCallback(() => fileInputRef.current?.click(), []);

  const handleTimerStop = useCallback(() => {
    finalizeLastOpenPoint();
    timerRef.current?.stop();
  }, [finalizeLastOpenPoint]);

  const handleTimerToggle = useCallback(() => {
    if (timerRef.current?.isRunning) {
      handleTimerStop();
    } else {
      timerRef.current?.start();
    }
  }, [handleTimerStop]);

  const defaultMechanicFor = useCallback((roleId) => {
    if (!roleId) return null;
    const role = rolesRef.current.find((r) => r.id === roleId);
    const mechs = role?.techniques ?? [];
    if (!mechs.length) return null;
    const isGradual =
      (settingsRef.current.gameMode ?? DEFAULT_SETTINGS.gameMode) === "gradual";
    if (!isGradual) return mechs[0];
    return mechs.find((m) => unlockedNodesRef.current.includes(m)) ?? null;
  }, []);

  const handleRoleSelect = useCallback(
    (id) => {
      setActiveRole(id);
      setActiveMechanic(defaultMechanicFor(id));
      timerRef.current?.stop();
      if (id !== null && (settingsRef.current.timerActiveByDefault ?? false))
        timerRef.current?.start();
    },
    [setActiveRole, setActiveMechanic, defaultMechanicFor],
  );

  const handleMechanicSelect = useCallback(
    (mechId) => {
      setActiveMechanic(mechId === activeMechanicRef.current ? null : mechId);
    },
    [setActiveMechanic],
  );

  const handleSettingsChange = useCallback(
    (next) => {
      const justEnabled =
        !settingsRef.current.timerActiveByDefault && next.timerActiveByDefault;
      setSettings(next);
      if (
        justEnabled &&
        activeRoleRef.current !== null &&
        !timerRef.current?.isRunning
      )
        timerRef.current?.start();
    },
    [setSettings],
  );

  const handlePointAdded = useCallback(() => {
    if (settingsRef.current.timerActiveByDefault ?? false) {
      timerRef.current?.start();
    } else {
      handleTimerStop();
    }
  }, [handleTimerStop]);

  const value = useMemo(
    () => ({
      roles,
      points,
      connections,
      offset,
      settings,
      techniques,
      pointsPerNode,
      unlockedNodes,
      activeRole,
      activeMechanic,
      setOffset,
      setSettings,
      setActiveRole,
      setActiveMechanic,
      addPoint,
      addRole,
      deleteRole,
      updateRole,
      updateRoleColor,
      finalizeLastOpenPoint,
      updatePointNote,
      addTechnique,
      updateTechnique,
      deleteTechnique,
      save,
      load,
      reset,
      undo,
      redo,
      fileInputRef,
      triggerLoad,
      handleTimerStop,
      handleTimerToggle,
      handleRoleSelect,
      handleMechanicSelect,
      handleSettingsChange,
      handlePointAdded,
    }),
    [
      roles,
      points,
      connections,
      offset,
      settings,
      techniques,
      pointsPerNode,
      unlockedNodes,
      activeRole,
      activeMechanic,
      setOffset,
      setSettings,
      setActiveRole,
      setActiveMechanic,
      addPoint,
      addRole,
      deleteRole,
      updateRole,
      updateRoleColor,
      finalizeLastOpenPoint,
      updatePointNote,
      addTechnique,
      updateTechnique,
      deleteTechnique,
      save,
      load,
      reset,
      undo,
      redo,
      triggerLoad,
      handleTimerStop,
      handleTimerToggle,
      handleRoleSelect,
      handleMechanicSelect,
      handleSettingsChange,
      handlePointAdded,
    ],
  );

  return (
    <SkillContext.Provider value={value}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={load}
        className="hidden"
      />
      <TimerProviderLayer timerRef={timerRef}>{children}</TimerProviderLayer>
    </SkillContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSkillContext = () => useContext(SkillContext);
