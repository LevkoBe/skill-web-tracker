const EMBED_BASE = "https://levkobe.github.io/diagravinci/embed.html";

export const EMBED_ORIGIN = "https://levkobe.github.io";

export const getEmbedUrl = (colors, mode = "dark") =>
  `${EMBED_BASE}?viewMode=timeline&theme=${mode}&classDiagram=off&relLineStyle=curved&colors=${encodeURIComponent(JSON.stringify(colors))}`;

const toId = (str) => str.replace(/[\s-]/g, "_");

const hashId = (str) =>
  [...str].reduce((h, c) => ((h * 31 + c.charCodeAt(0)) & 0xffff), 0);

const nodeIcon = (theme, nodeId) => {
  if (!theme?.icons?.length) return null;
  const name = theme.icons[hashId(nodeId) % theme.icons.length];
  return name ? `_${name}_` : null;
};

export function buildDiagramDsl(
  roles,
  pointCounts,
  activeRoleId,
  theme = null,
  unlockedNodes = null,
  colors = null,
  techniques = [],
) {
  const techMap = new Map(techniques.map((t) => [t.id, t]));
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
    `!selector name=unlocked  color=${colors["--color-success"]}  mode=color`,
    `!selector name=current   color=${colors["--color-accent"]}  mode=color`,
    `!selector name=locked    color=${colors["--color-fg-disabled"]}  mode=color`,
    "",
  ];

  for (const role of roles) {
    const nodeId = toId(role.id);
    const status = getRoleStatus(role);
    const ic = nodeIcon(theme, role.id);
    const roleTechs = role.techniques ?? [];

    if (roleTechs.length > 0) {
      lines.push(`${nodeId}:${status}{${roleTechs.map(toId).join(" ")}}`);
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
