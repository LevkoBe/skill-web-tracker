const EMBED_BASE = "https://levkobe.github.io/diagravinci/embed.html";

export const EMBED_ORIGIN = "https://levkobe.github.io";

export const getEmbedUrl = (colors, mode = "dark") =>
  `${EMBED_BASE}?viewMode=timeline&theme=${mode}&classDiagram=off&relLineStyle=curved&colors=${encodeURIComponent(JSON.stringify(colors))}`;

const toId = (str) => str.replace(/[\s-]/g, "_");

const hashId = (str) =>
  [...str].reduce((h, c) => (h * 31 + c.charCodeAt(0)) & 0xffff, 0);

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
    `!selector name=unlocked  color=${colors["--color-success"]}  mode=color`,
    `!selector name=current   color=${colors["--color-accent"]}  mode=color`,
    `!selector name=locked    color=${colors["--color-fg-disabled"]}  mode=color`,
    "",
  ];

  const roleDefLines = [];
  const techDefLines = [];
  const placedTechs = new Set();
  const emittedEdges = new Set();
  const techEdgeLines = [];

  const addEdge = (from, to) => {
    const key = `${from}-->${to}`;
    if (!emittedEdges.has(key)) {
      emittedEdges.add(key);
      techEdgeLines.push(`${from} --> ${to}`);
    }
  };

  for (const role of roles) {
    const nodeId = toId(role.id);
    const status = getRoleStatus(role);
    const ic = nodeIcon(theme, role.id);
    const roleTechs = role.techniques ?? [];

    if (roleTechs.length > 0) {
      roleDefLines.push(
        `${nodeId}:${status}{${roleTechs.map(toId).join(" ")}}`,
      );
      addEdge(nodeId, toId(roleTechs[0]));
      let prevNew = null;
      for (const tech of roleTechs) {
        const techId = toId(tech);
        if (!placedTechs.has(tech)) {
          placedTechs.add(tech);
          const techStatus = getTechStatus(tech);
          const techIc = nodeIcon(theme, tech);
          techDefLines.push(`${techId}:${techStatus}(${techIc ?? ""})`);
          if (prevNew !== null) addEdge(prevNew, techId);
          prevNew = techId;
        } else {
          prevNew = null;
        }
      }
    } else {
      const prefix = ic ? `${nodeId}:${status}(${ic})` : `${nodeId}:${status}`;
      roleDefLines.push(prefix);
    }
  }

  const allDefLines = [...roleDefLines, ...techDefLines];
  allDefLines.sort((a, b) => hashId(a) - hashId(b));
  lines.push(...allDefLines);

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

  lines.push(...techEdgeLines);
  console.log(lines.join("\n"));

  return lines.join("\n");
}
