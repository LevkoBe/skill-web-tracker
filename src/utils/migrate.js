import rolesData from "../data/roles.json";
import { colorForRole } from "./colors";

/** Ensure every role has a color (generated if missing). */
export const enrichRole = (role) =>
  role.color ? role : { ...role, color: colorForRole(role) };

/** All roles with generated colors, including shadow ones (for reference/navigation). */
export const ALL_ROLES_ENRICHED = rolesData.map(enrichRole);

/**
 * Default set loaded on first run / reset — shadow roles are excluded so they
 * don't appear to general users unless they were explicitly saved.
 */
export const DEFAULT_ROLES_ENRICHED = ALL_ROLES_ENRICHED.filter(
  (r) => r.type !== "shadow",
);

const isOldFormat = (role) =>
  typeof role.id === "number" ||
  (role.description !== undefined && role.summary === undefined);

/**
 * Migrate saved roles (and their associated points) from the old
 * `{ id: number, name, description, color }` format to the new
 * `{ id: string, name, complexity, type, summary, techniques, buildsFrom, buildsInto }` format.
 *
 * Returns `{ roles, points }` — always in new format.
 * Caller is responsible for deciding the default when savedRoles is empty.
 */
export const migrateRoles = (savedRoles, savedPoints = []) => {
  if (!savedRoles?.length) {
    return { roles: [], points: savedPoints };
  }

  // Already new format — just make sure color is present
  if (!isOldFormat(savedRoles[0])) {
    return { roles: savedRoles.map(enrichRole), points: savedPoints };
  }

  // Old format: map each role to a new-format counterpart by name
  const idMap = new Map(); // old numeric/string id → new string id

  const roles = savedRoles.map((oldRole) => {
    const match = rolesData.find(
      (r) => r.name.toLowerCase() === oldRole.name.toLowerCase(),
    );

    if (match) {
      idMap.set(oldRole.id, match.id);
      // Preserve the user's color if they had one
      return enrichRole({ ...match, color: oldRole.color ?? undefined });
    }

    // Unknown custom role — keep it as a minimal new-format entry
    const newId = `custom-${oldRole.id}`;
    idMap.set(oldRole.id, newId);
    return {
      id: newId,
      name: oldRole.name,
      complexity: 1,
      type: "positive",
      summary: oldRole.description ?? "",
      techniques: [],
      buildsFrom: [],
      buildsInto: [],
      color:
        oldRole.color ??
        colorForRole({ id: newId, type: "positive", complexity: 1 }),
    };
  });

  // Re-map point roleIds
  const points = savedPoints.map((p) => ({
    ...p,
    roleId: idMap.has(p.roleId) ? idMap.get(p.roleId) : p.roleId,
  }));

  return { roles, points };
};
