const EMBED_BASE = "https://levkobe.github.io/diagravinci/embed.html";

export const EMBED_ORIGIN = "https://levkobe.github.io";

export const EMBED_URL = `${EMBED_BASE}?viewMode=timeline&theme=dark&classDiagram=off`;

const toId = (str) => str.replace(/[\s-]/g, "_");

const nodeIcon = (theme, id) => {
  const name = theme?.icons?.[id];
  return name ? `_${name}_` : null;
};

export function buildDiagramDsl(
  roles,
  pointCounts,
  activeRoleId,
  theme = null,
  unlockedNodes = null,
) {
  const unlockedSet = unlockedNodes ? new Set(unlockedNodes) : null;

  const getRoleStatus = (role) => {
    if (activeRoleId && role.id === activeRoleId) return "current";
    if (unlockedSet) return unlockedSet.has(role.id) ? "unlocked" : "locked";
    return (pointCounts.get(role.id) ?? 0) > 0 ? "unlocked" : "locked";
  };

  const getTechStatus = (techId) => {
    if (!unlockedSet) return "unlocked";
    return unlockedSet.has(techId) ? "unlocked" : "locked";
  };

  const lines = [
    "!selector name=unlocked  color=#4caf50  mode=color",
    "!selector name=current   color=#2196f3  mode=color",
    "!selector name=locked    color=#757575  mode=color",
    "",
  ];

  for (const role of roles) {
    const nodeId = toId(role.id);
    const status = getRoleStatus(role);
    const ic = nodeIcon(theme, role.id);
    const techniques = role.techniques ?? [];

    if (techniques.length > 0) {
      lines.push(`${nodeId}:${status}{${techniques.map(toId).join(" ")}}`);
    } else {
      const prefix = ic ? `${nodeId}:${status}(${ic})` : `${nodeId}:${status}`;
      lines.push(prefix);
    }
  }

  lines.push("");

  const placedTechs = new Set();
  const emittedEdges = new Set();
  const techNodeLines = [];
  const techEdgeLines = [];

  const addEdge = (from, to) => {
    const key = `${from}-->${to}`;
    if (!emittedEdges.has(key)) {
      emittedEdges.add(key);
      techEdgeLines.push(`${from} --> ${to}`);
    }
  };

  for (const role of roles) {
    const roleNodeId = toId(role.id);
    const techs = role.techniques ?? [];
    if (techs.length === 0) continue;

    addEdge(roleNodeId, toId(techs[0]));

    let prevNew = null;
    for (const tech of techs) {
      const techId = toId(tech);
      if (!placedTechs.has(tech)) {
        placedTechs.add(tech);
        const status = getTechStatus(tech);
        const ic = nodeIcon(theme, tech);
        techNodeLines.push(`${techId}:${status}(${ic ?? ""})`);
        if (prevNew !== null) addEdge(prevNew, techId);
        prevNew = techId;
      } else {
        prevNew = null;
      }
    }
  }

  lines.push(...techNodeLines);
  lines.push("");

  const roleEdgeSeen = new Set();
  for (const role of roles) {
    const fromId = toId(role.id);
    for (const target of role.buildsInto ?? []) {
      const key = `${fromId}-->${toId(target)}`;
      if (!roleEdgeSeen.has(key)) {
        roleEdgeSeen.add(key);
        lines.push(`${fromId} --> ${toId(target)}`);
      }
    }
  }

  lines.push("");
  lines.push(...techEdgeLines);
  console.log(lines.join("\n"));

  return lines.join("\n");
}
