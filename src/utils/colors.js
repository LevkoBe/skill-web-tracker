const ROLE_COLORS = ["#6b8cce", "#b57bb8", "#5fb58a", "#d4a574", "#8b7bc8"];

export const nextRoleColor = (existingCount) =>
  ROLE_COLORS[existingCount % ROLE_COLORS.length];

export const randomBrightColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const s = (90 + Math.random() * 10).toFixed(1);
  const l = (55 + Math.random() * 10).toFixed(1);
  return `hsl(${hue}, ${s}%, ${l}%)`;
};

/** Deterministic color derived from role id/name, tinted by type and complexity. */
export const colorForRole = (role) => {
  const str = String(role.id ?? role.name ?? "");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  const hue = Math.abs(hash) % 360;
  const s = role.type === "negative" ? 45 : 65;
  const l = Math.min(58, 48 + ((role.complexity ?? 1) - 1) * 2);
  return `hsl(${hue}, ${s}%, ${l}%)`;
};
