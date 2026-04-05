import { useState, useRef, useEffect } from "react";
import { useI18n } from "@levkobe/c7one";
import { loadState, saveState, clearState } from "../utils/storage";
import { nextRoleColor } from "../utils/colors";
import { removeRoleFromGraph } from "../utils/connections";
import { migratePoints } from "../utils/time";
import {
  enrichRole,
  migrateRoles,
  getDefaultRoles,
  getDefaultTechniques,
} from "../utils/migrate";

const DEFAULT_SETTINGS = {
  connectionRange: 150,
  pointDriftRadius: 2,
  pointDriftSpeed: 1,
  maxProximityConnections: 3,
  timerActiveByDefault: false,
  durationScaleFactor: 1,
  showClusterLabels: true,
  showNoteLabels: true,
  breathingStrength: 0.3,
};

const MAX_HISTORY = 50;

// Plain function — receives locale as an argument so it has no hook dependency.
const getInitialState = (locale) => {
  const saved = loadState();
  if (!saved) {
    return {
      roles: getDefaultRoles(locale),
      points: [],
      connections: [],
      offset: { x: 0, y: 0 },
      settings: DEFAULT_SETTINGS,
      techniques: getDefaultTechniques(locale),
    };
  }

  const migratedPoints = migratePoints(saved.points ?? []);
  const { roles, points } = saved.roles?.length
    ? migrateRoles(saved.roles, migratedPoints)
    : { roles: getDefaultRoles(locale), points: migratedPoints };

  return {
    roles,
    points,
    connections: saved.connections ?? [],
    offset: saved.offset ?? { x: 0, y: 0 },
    settings: { ...DEFAULT_SETTINGS, ...(saved.settings ?? {}) },
    techniques: saved.techniques ?? getDefaultTechniques(locale),
  };
};

export const useSkillWeb = () => {
  const { locale } = useI18n();

  // useState initializer runs once — capture locale at that moment.
  const [init] = useState(() => getInitialState(locale));

  const [roles, setRoles] = useState(() => init.roles);
  const [points, setPoints] = useState(() => init.points);
  const [connections, setConnections] = useState(() => init.connections);
  const [offset, setOffset] = useState(() => init.offset);
  const [settings, setSettings] = useState(() => init.settings);
  const [techniques, setTechniques] = useState(() => init.techniques);
  const [activeRole, setActiveRole] = useState(null);

  const past = useRef([]);
  const future = useRef([]);

  useEffect(() => {
    saveState({ roles, points, connections, offset, settings, techniques });
  }, [roles, points, connections, offset, settings, techniques]);

  const snapshot = (r = roles, p = points, c = connections) => {
    past.current = [
      ...past.current.slice(-MAX_HISTORY + 1),
      { roles: r, points: p, connections: c },
    ];
    future.current = [];
  };

  const undo = () => {
    if (!past.current.length) return;
    const prev = past.current[past.current.length - 1];
    past.current = past.current.slice(0, -1);
    future.current = [{ roles, points, connections }, ...future.current];
    setRoles(prev.roles);
    setPoints(prev.points);
    setConnections(prev.connections);
  };

  const redo = () => {
    if (!future.current.length) return;
    const next = future.current[0];
    future.current = future.current.slice(1);
    past.current = [...past.current, { roles, points, connections }];
    setRoles(next.roles);
    setPoints(next.points);
    setConnections(next.connections);
  };

  const addPoint = (x, y) => {
    const role = roles.find((r) => r.id === activeRole);
    if (!role) return;

    snapshot();

    const now = Date.now();
    const newIdx = points.length;
    let closedPoints = points;
    for (let i = points.length - 1; i >= 0; i--) {
      if (points[i].roleId === activeRole && points[i].endedAt === null) {
        closedPoints = points.map((p, idx) =>
          idx === i ? { ...p, endedAt: now } : p,
        );
        break;
      }
    }

    const newPoint = {
      id: now,
      x,
      y,
      roleId: activeRole,
      color: role.color,
      startedAt: now,
      endedAt: null,
    };

    const proximityConnections = closedPoints
      .map((p, idx) => ({
        idx,
        dist: Math.hypot(p.x - x, p.y - y),
        roleId: p.roleId,
      }))
      .filter(
        ({ roleId, dist }) =>
          roleId === activeRole && dist < settings.connectionRange,
      )
      .sort((a, b) => a.dist - b.dist)
      .slice(0, settings.maxProximityConnections)
      .map(({ idx }) => ({ fromIdx: idx, toIdx: newIdx, color: role.color }));

    const sequentialConnection =
      closedPoints.length > 0
        ? [{ fromIdx: closedPoints.length - 1, toIdx: newIdx, color: role.color }]
        : [];

    setPoints([...closedPoints, newPoint]);
    setConnections((prev) => [
      ...prev,
      ...sequentialConnection,
      ...proximityConnections,
    ]);
  };

  const finalizeLastOpenPoint = () => {
    if (!activeRole) return;
    const now = Date.now();
    for (let i = points.length - 1; i >= 0; i--) {
      if (points[i].roleId === activeRole && points[i].endedAt === null) {
        setPoints((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, endedAt: now } : p)),
        );
        return;
      }
    }
  };

  const updatePointNote = (id, note) =>
    setPoints((prev) => prev.map((p) => (p.id === id ? { ...p, note } : p)));

  const addRole = (name) => {
    setRoles((prev) => [
      ...prev,
      enrichRole({
        id: `custom-${Date.now()}`,
        name,
        complexity: 1,
        type: "positive",
        summary: "",
        techniques: [],
        buildsFrom: [],
        buildsInto: [],
        color: nextRoleColor(prev.length),
      }),
    ]);
  };

  const deleteRole = (id) => {
    snapshot();
    const { newPoints, newConnections } = removeRoleFromGraph(
      points,
      connections,
      id,
    );
    setRoles((prev) => prev.filter((r) => r.id !== id));
    setPoints(newPoints);
    setConnections(newConnections);
    if (activeRole === id) setActiveRole(null);
  };

  const updateRole = (id, updates) =>
    setRoles((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    );

  const updateRoleColor = (id, color) => {
    snapshot();
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, color } : r)));
    setPoints((prev) =>
      prev.map((p) => (p.roleId === id ? { ...p, color } : p)),
    );
    const updatedPoints = points.map((p) =>
      p.roleId === id ? { ...p, color } : p,
    );
    setConnections((prev) =>
      prev.map((c) =>
        updatedPoints[c.fromIdx]?.roleId === id ? { ...c, color } : c,
      ),
    );
  };

  // ── Techniques CRUD ────────────────────────────────────────────────────────

  const addTechnique = (name, description = "") => {
    setTechniques((prev) => [
      ...prev,
      { id: `custom-tech-${Date.now()}`, name, description },
    ]);
  };

  const updateTechnique = (id, updates) =>
    setTechniques((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    );

  const deleteTechnique = (id) =>
    setTechniques((prev) => prev.filter((t) => t.id !== id));

  // ── File I/O ───────────────────────────────────────────────────────────────

  const save = () => {
    const blob = new Blob(
      [JSON.stringify({ roles, points, connections, offset, settings, techniques }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "skill-web.json";
    a.click();
  };

  const load = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      try {
        const data = JSON.parse(target.result);
        snapshot();
        const { roles: migratedRoles, points: migratedPoints } = migrateRoles(
          data.roles ?? [],
          migratePoints(data.points ?? []),
        );
        setRoles(migratedRoles);
        setPoints(migratedPoints);
        setConnections(data.connections ?? []);
        setOffset(data.offset ?? { x: 0, y: 0 });
        setSettings({ ...DEFAULT_SETTINGS, ...(data.settings ?? {}) });
        // Loaded files use whatever techniques were saved; no locale defaulting here.
        setTechniques(data.techniques ?? getDefaultTechniques(locale));
      } catch {
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
  };

  const reset = () => {
    clearState();
    setRoles(getDefaultRoles(locale));
    setPoints([]);
    setConnections([]);
    setOffset({ x: 0, y: 0 });
    setSettings(DEFAULT_SETTINGS);
    setTechniques(getDefaultTechniques(locale));
    past.current = [];
    future.current = [];
  };

  return {
    roles,
    points,
    connections,
    offset,
    settings,
    techniques,
    activeRole,
    setOffset,
    setSettings,
    setActiveRole,
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
  };
};
