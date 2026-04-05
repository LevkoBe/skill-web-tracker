import rolesEn from "../data/roles.json";
import rolesUk from "../data/roles.uk.json";
import techniquesEn from "../data/techniques.json";
import techniquesUk from "../data/techniques.uk.json";
import { colorForRole } from "./colors";

/** Ensure every role has a color (generated if missing). */
export const enrichRole = (role) =>
  role.color ? role : { ...role, color: colorForRole(role) };

const rolesDataByLocale = { en: rolesEn, uk: rolesUk };
const techniquesDataByLocale = { en: techniquesEn, uk: techniquesUk };

/**
 * Default roles for a given locale — shadow types excluded.
 * Called once during initialization; afterwards the user's saved list is used as-is.
 */
export const getDefaultRoles = (locale = "en") => {
  const data = rolesDataByLocale[locale] ?? rolesEn;
  return data.filter((r) => r.type === "positive").map(enrichRole);
};

/** Default techniques for a given locale. */
export const getDefaultTechniques = (locale = "en") => [
  ...(techniquesDataByLocale[locale] ?? techniquesEn),
];

// Keep these exports so existing imports (e.g. RoleCardModal) still resolve.
// They always use English — the static fallback used for navigation/reference only.
export const ALL_ROLES_ENRICHED = rolesEn.map(enrichRole);
export const DEFAULT_ROLES_ENRICHED = ALL_ROLES_ENRICHED.filter(
  (r) => r.type === "positive",
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
    const match = rolesEn.find(
      (r) => r.name.toLowerCase() === oldRole.name.toLowerCase(),
    );

    if (match) {
      idMap.set(oldRole.id, match.id);
      return enrichRole({ ...match, color: oldRole.color ?? undefined });
    }

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

  const points = savedPoints.map((p) => ({
    ...p,
    roleId: idMap.has(p.roleId) ? idMap.get(p.roleId) : p.roleId,
  }));

  return { roles, points };
};
