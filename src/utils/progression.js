export function computeUnlocks(roles, pointsPerNode, currentUnlocked, threshold) {
  const unlocked = new Set(currentUnlocked);
  let changed = true;

  while (changed) {
    changed = false;

    for (const role of roles) {
      if (!unlocked.has(role.id)) continue;

      const roleCount = pointsPerNode[role.id] ?? 0;

      if (roleCount >= threshold) {
        for (const childId of role.buildsInto ?? []) {
          if (!unlocked.has(childId)) {
            unlocked.add(childId);
            const child = roles.find((r) => r.id === childId);
            const starter = child?.techniques?.[0];
            if (starter) unlocked.add(starter);
            changed = true;
          }
        }
      }

      const mechs = role.techniques ?? [];
      for (let i = 0; i < mechs.length - 1; i++) {
        if (!unlocked.has(mechs[i])) continue;
        const mechCount = pointsPerNode[mechs[i]] ?? 0;
        if (mechCount >= threshold && !unlocked.has(mechs[i + 1])) {
          unlocked.add(mechs[i + 1]);
          changed = true;
        }
      }
    }
  }

  return [...unlocked];
}

export function computePointsPerNode(points) {
  const map = {};
  for (const p of points) {
    if (p.roleId) map[p.roleId] = (map[p.roleId] ?? 0) + 1;
    if (p.mechanicId) map[p.mechanicId] = (map[p.mechanicId] ?? 0) + 1;
  }
  return map;
}

const STARTER_ROLE_IDS = [
  "myself",
  "executor",
  "observer",
  "survivor",
  "explorer",
  "present",
];

export function getInitialUnlocked(roles) {
  const initial = [];
  for (const id of STARTER_ROLE_IDS) {
    const role = roles.find((r) => r.id === id);
    if (!role) continue;
    initial.push(role.id);
    const starter = role.techniques?.[0];
    if (starter) initial.push(starter);
  }
  return initial;
}
