import { useState, useRef, useEffect } from "react";
import { DEFAULT_ROLES } from "../data/roles";
import { loadState, saveState, clearState } from "../utils/storage";
import { nextRoleColor } from "../utils/colors";
import { removeRoleFromGraph } from "../utils/connections";
import { migratePoints } from "../utils/time";

const DEFAULT_SETTINGS = {
  connectionRange: 150,
  pointDriftRadius: 2,
  pointDriftSpeed: 1,
  maxProximityConnections: 3,
  timerActiveByDefault: false,
  durationScaleFactor: 1,
};

const MAX_HISTORY = 50;

export const useSkillWeb = () => {
  const [roles, setRoles] = useState(() => loadState()?.roles ?? DEFAULT_ROLES);
  const [points, setPoints] = useState(() =>
    migratePoints(loadState()?.points ?? []),
  );
  const [connections, setConnections] = useState(
    () => loadState()?.connections ?? [],
  );
  const [offset, setOffset] = useState(
    () => loadState()?.offset ?? { x: 0, y: 0 },
  );
  const [settings, setSettings] = useState(
    () => loadState()?.settings ?? DEFAULT_SETTINGS,
  );
  const [activeRole, setActiveRole] = useState(null);

  const past = useRef([]);
  const future = useRef([]);

  useEffect(() => {
    saveState({ roles, points, connections, offset, settings });
  }, [roles, points, connections, offset, settings]);

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
        ? [
            {
              fromIdx: closedPoints.length - 1,
              toIdx: newIdx,
              color: role.color,
            },
          ]
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

  const addRole = (name) => {
    setRoles((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        description: "",
        color: nextRoleColor(prev.length),
      },
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

  const save = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          { roles, points, connections, offset, settings },
          null,
          2,
        ),
      ],
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
        setRoles(data.roles ?? []);
        setPoints(migratePoints(data.points ?? []));
        setConnections(data.connections ?? []);
        setOffset(data.offset ?? { x: 0, y: 0 });
        setSettings(data.settings ?? DEFAULT_SETTINGS);
      } catch {
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
  };

  const reset = () => {
    clearState();
    setRoles(DEFAULT_ROLES);
    setPoints([]);
    setConnections([]);
    setOffset({ x: 0, y: 0 });
    setSettings(DEFAULT_SETTINGS);
    past.current = [];
    future.current = [];
  };

  return {
    roles,
    points,
    connections,
    offset,
    settings,
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
    save,
    load,
    reset,
    undo,
    redo,
  };
};
