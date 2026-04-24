import rolesEnRaw from "../data/roles.json";
import rolesUkRaw from "../data/roles.uk.json";
import techniquesEn from "../data/techniques.json";
import techniquesUk from "../data/techniques.uk.json";
import { colorForRole } from "./colors";

export const enrichRole = (role) =>
  role.color ? role : { ...role, color: colorForRole(role) };

const shadowIds = new Set(
  rolesEnRaw.filter((r) => r.type === "shadow").map((r) => r.id),
);
const stripShadowDeps = (role) => ({
  ...role,
  buildsFrom: (role.buildsFrom ?? []).filter((id) => !shadowIds.has(id)),
  buildsInto: (role.buildsInto ?? []).filter((id) => !shadowIds.has(id)),
});

const rolesEn = rolesEnRaw.filter((r) => r.type !== "shadow").map(stripShadowDeps);
const rolesUk = rolesUkRaw.filter((r) => r.type !== "shadow").map(stripShadowDeps);

const rolesDataByLocale = { en: rolesEn, uk: rolesUk };
const techniquesDataByLocale = { en: techniquesEn, uk: techniquesUk };

export const getDefaultRoles = (locale = "en") => {
  const data = rolesDataByLocale[locale] ?? rolesEn;
  return data.filter((r) => r.type === "positive").map(enrichRole);
};

export const getDefaultTechniques = (locale = "en") => [
  ...(techniquesDataByLocale[locale] ?? techniquesEn),
];

export const ALL_ROLES_ENRICHED = rolesEn.map(enrichRole);
export const DEFAULT_ROLES_ENRICHED = ALL_ROLES_ENRICHED.filter(
  (r) => r.type === "positive",
);

const isOldFormat = (role) =>
  typeof role.id === "number" ||
  (role.description !== undefined && role.summary === undefined);

export const migrateRoles = (savedRoles, savedPoints = []) => {
  if (!savedRoles?.length) {
    return { roles: [], points: savedPoints };
  }

  if (!isOldFormat(savedRoles[0])) {
    return {
      roles: savedRoles
        .filter((r) => r.type !== "shadow")
        .map(stripShadowDeps)
        .map(enrichRole),
      points: savedPoints,
    };
  }

  const idMap = new Map();

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

export const migrateMechanicIds = (roles, points) => {
  const roleMap = new Map(roles.map((r) => [r.id, r]));
  return points.map((p) => {
    if (p.mechanicId !== undefined) return p;
    const role = roleMap.get(p.roleId);
    return { ...p, mechanicId: role?.techniques?.[0] ?? null };
  });
};
