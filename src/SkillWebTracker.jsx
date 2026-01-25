import { useState, useEffect } from "react";
import { SettingsPanel } from "./panels/SettingsPanel";
import { WebCanvas } from "./panels/WebCanvas";
import { RolesPanel } from "./panels/RolesPanel";
import { ProgressionPanel } from "./panels/ProgressionPanel";
import { Settings } from "lucide-react";
import { DEFAULT_ROLES } from "./data/roles";

const STORAGE_KEY = "skill-web-state";

const loadFromLocalStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveToLocalStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota / serialization errors
  }
};

const SkillWebTracker = () => {
  const stored = loadFromLocalStorage();
  const [roles, setRoles] = useState(stored?.roles ?? DEFAULT_ROLES);
  const [points, setPoints] = useState(stored?.points ?? []);
  const [connections, setConnections] = useState(stored?.connections ?? []);
  const [offset, setOffset] = useState(stored?.offset ?? { x: 0, y: 0 });
  const [settings, setSettings] = useState(
    stored?.settings ?? {
      connectionRange: 150,
      pointDriftRadius: 2,
      pointDriftSpeed: 1,
      maxProximityConnections: 3,
    },
  );

  const [activeRole, setActiveRole] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    saveToLocalStorage({
      roles,
      points,
      connections,
      offset,
      settings,
    });
  }, [roles, points, connections, offset, settings]);

  const handleCanvasClick = (e) => {
    if (!activeRole || isDragging) return;
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left - offset.x;
    const y = e.clientY - rect.top - offset.y;
    const role = roles.find((r) => r.id === activeRole);
    const newPoint = {
      id: Date.now(),
      x,
      y,
      roleId: activeRole,
      color: role.color,
    };
    const newPointIdx = points.length;
    const newConnections = [...connections];

    if (points.length > 0) {
      newConnections.push({
        fromIdx: points.length - 1,
        toIdx: newPointIdx,
        color: role.color,
      });
    }

    const nearbyPoints = [];
    points.forEach((p, idx) => {
      if (p.roleId === activeRole) {
        const dist = Math.hypot(p.x - x, p.y - y);
        if (dist < settings.connectionRange) nearbyPoints.push({ idx, dist });
      }
    });

    nearbyPoints
      .sort((a, b) => a.dist - b.dist)
      .slice(0, settings.maxProximityConnections)
      .forEach(({ idx }) => {
        newConnections.push({
          fromIdx: idx,
          toIdx: newPointIdx,
          color: role.color,
        });
      });

    setPoints([...points, newPoint]);
    setConnections(newConnections);
  };

  const dragHandlers = {
    onMouseDown: (e) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    },
    onMouseMove: (e) => {
      if (!isDragging) return;
      setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    },
    onMouseUp: () => setIsDragging(false),
  };

  const resetState = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRoles(DEFAULT_ROLES);
    setPoints([]);
    setConnections([]);
    setOffset({ x: 0, y: 0 });
    setSettings({
      connectionRange: 150,
      pointDriftRadius: 2,
      pointDriftSpeed: 1,
      maxProximityConnections: 3,
    });
  };

  return (
    <div className="flex h-screen bg-black text-gray-300">
      <div className="flex-1 relative border-r border-gray-900">
        <WebCanvas
          points={points}
          connections={connections}
          offset={offset}
          activeRole={activeRole}
          settings={settings}
          onCanvasClick={handleCanvasClick}
          onDragHandlers={dragHandlers}
        />
        {activeRole && (
          <div className="absolute top-4 left-4 bg-zinc-950 px-4 py-2 rounded border border-gray-800 shadow-lg">
            <span className="text-gray-500 text-sm">Active:</span>
            <span className="ml-2 text-gray-300">
              {roles.find((r) => r.id === activeRole)?.name}
            </span>
          </div>
        )}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="absolute top-4 right-4 bg-zinc-950 p-2 rounded border border-gray-800 hover:border-gray-700 text-gray-400"
        >
          <Settings size={20} />
        </button>
        {showSettings && (
          <SettingsPanel settings={settings} onSettingsChange={setSettings} />
        )}
      </div>
      <RolesPanel
        roles={roles}
        points={points}
        activeRole={activeRole}
        onRoleSelect={setActiveRole}
        onAddRole={(name) => {
          const colors = [
            "#6b8cce",
            "#b57bb8",
            "#5fb58a",
            "#d4a574",
            "#8b7bc8",
          ];
          setRoles([
            ...roles,
            {
              id: Date.now(),
              name,
              description: "",
              color: colors[roles.length % colors.length],
            },
          ]);
        }}
        onDeleteRole={(id) => {
          const deletedIndices = new Set();
          points.forEach((p, idx) => {
            if (p.roleId === id) deletedIndices.add(idx);
          });
          const newPoints = points.filter((p) => p.roleId !== id);
          const indexMap = new Map();
          let newIdx = 0;
          points.forEach((p, oldIdx) => {
            if (!deletedIndices.has(oldIdx)) {
              indexMap.set(oldIdx, newIdx);
              newIdx++;
            }
          });
          const newConnections = connections
            .filter(
              (c) =>
                !deletedIndices.has(c.fromIdx) && !deletedIndices.has(c.toIdx),
            )
            .map((c) => ({
              ...c,
              fromIdx: indexMap.get(c.fromIdx),
              toIdx: indexMap.get(c.toIdx),
            }));
          setRoles(roles.filter((r) => r.id !== id));
          setPoints(newPoints);
          setConnections(newConnections);
          if (activeRole === id) setActiveRole(null);
        }}
        onUpdateRole={(id, updates) =>
          setRoles(roles.map((r) => (r.id === id ? { ...r, ...updates } : r)))
        }
        onUpdateRoleColor={(id, color) => {
          setRoles(roles.map((r) => (r.id === id ? { ...r, color } : r)));
          setPoints(points.map((p) => (p.roleId === id ? { ...p, color } : p)));
          setConnections(
            connections.map((c) => {
              const point = points[c.fromIdx];
              return point && point.roleId === id ? { ...c, color } : c;
            }),
          );
        }}
        onSave={() => {
          const data = { roles, points, connections, offset, settings };
          const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "skill-web.json";
          a.click();
        }}
        onLoad={(e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const data = JSON.parse(event.target.result);
              setRoles(data.roles || []);
              setPoints(data.points || []);
              setConnections(data.connections || []);
              setOffset(data.offset || { x: 0, y: 0 });
              setSettings(data.settings || settings);
            } catch {
              alert("Invalid file format");
            }
          };
          reader.readAsText(file);
        }}
        onReset={resetState}
      />
      <ProgressionPanel roles={roles} points={points} />
    </div>
  );
};

export default SkillWebTracker;
