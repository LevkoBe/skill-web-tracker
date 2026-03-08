export const formatElapsed = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

const isValidTimestamp = (v) =>
  typeof v === "number" && Number.isFinite(v) && v > 0;

export const migratePoints = (points) =>
  points.map((p) => {
    const now = Date.now();
    const startedAt = isValidTimestamp(p.startedAt) ? p.startedAt : now;
    const endedAt =
      p.endedAt === null
        ? null
        : isValidTimestamp(p.endedAt)
          ? p.endedAt
          : startedAt;
    return { ...p, startedAt, endedAt };
  });
