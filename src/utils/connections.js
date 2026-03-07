export const removeRoleFromGraph = (points, connections, deletedRoleId) => {
  const deletedIndices = new Set(
    points.reduce((acc, p, i) => {
      if (p.roleId === deletedRoleId) acc.push(i);
      return acc;
    }, []),
  );

  const indexMap = new Map();
  let next = 0;
  points.forEach((_, oldIdx) => {
    if (!deletedIndices.has(oldIdx)) indexMap.set(oldIdx, next++);
  });

  const newPoints = points.filter((p) => p.roleId !== deletedRoleId);

  const newConnections = connections
    .filter(
      (c) => !deletedIndices.has(c.fromIdx) && !deletedIndices.has(c.toIdx),
    )
    .map((c) => ({
      ...c,
      fromIdx: indexMap.get(c.fromIdx),
      toIdx: indexMap.get(c.toIdx),
    }));

  return { newPoints, newConnections };
};
