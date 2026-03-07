const ROLE_COLORS = ["#6b8cce", "#b57bb8", "#5fb58a", "#d4a574", "#8b7bc8"];

export const nextRoleColor = (existingCount) =>
  ROLE_COLORS[existingCount % ROLE_COLORS.length];

export const randomBrightColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const s = (90 + Math.random() * 10).toFixed(1);
  const l = (55 + Math.random() * 10).toFixed(1);
  return `hsl(${hue}, ${s}%, ${l}%)`;
};
