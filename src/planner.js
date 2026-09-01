import { crews, days, distances, resources, sites, vans } from "./scenarios.js";

export function createPlan() {
  return {
    allocations: {},
    routes: Object.fromEntries(days.map((day) => [day, { sites: [], crewId: null, vanId: null }])),
  };
}

export function assignResource(plan, resourceId, siteId) {
  const next = structuredClone(plan);
  for (const ids of Object.values(next.allocations)) {
    const index = ids.indexOf(resourceId);
    if (index >= 0) ids.splice(index, 1);
  }
  next.allocations[siteId] = [...(next.allocations[siteId] ?? []), resourceId];
  return next;
}

export function scheduleSite(plan, siteId, day, position) {
  const next = structuredClone(plan);
  for (const route of Object.values(next.routes)) route.sites = route.sites.filter((id) => id !== siteId);
  const list = next.routes[day].sites;
  list.splice(position == null ? list.length : position, 0, siteId);
  return next;
}

export function assignCrew(plan, crewId, day) {
  const next = structuredClone(plan);
  next.routes[day].crewId = crewId;
  return next;
}

export function assignVan(plan, vanId, day) {
  const next = structuredClone(plan);
  next.routes[day].vanId = vanId;
  return next;
}

export function unscheduleSite(plan, siteId) {
  const next = structuredClone(plan);
  for (const route of Object.values(next.routes)) route.sites = route.sites.filter((id) => id !== siteId);
  return next;
}

export function unassignResource(plan, resourceId) {
  const next = structuredClone(plan);
  for (const ids of Object.values(next.allocations)) {
    const index = ids.indexOf(resourceId);
    if (index >= 0) ids.splice(index, 1);
  }
  return next;
}

function distanceBetween(from, to) {
  if (from === to) return 0;
  return distances[from]?.[to] ?? distances[to]?.[from] ?? 0;
}

export function routeMiles(routeSites) {
  if (!routeSites.length) return 0;
  let total = distanceBetween("depot", routeSites[0]);
  for (let index = 1; index < routeSites.length; index += 1) total += distanceBetween(routeSites[index - 1], routeSites[index]);
  return total + distanceBetween("depot", routeSites.at(-1));
}

export function inspectSite(plan, siteId) {
  const site = sites[siteId];
  const allocated = plan.allocations[siteId] ?? [];
  const day = days.find((candidate) => plan.routes[candidate].sites.includes(siteId));
  const route = day ? plan.routes[day] : null;
  const blockers = [];
  if (!allocated.includes(site.equipment)) blockers.push(`Needs ${resources[site.equipment].name}`);
  if (!allocated.includes(site.approval)) blockers.push(`Needs ${resources[site.approval].name}`);
  if (!day) blockers.push("Not scheduled");
  if (route && (!route.crewId || crews[route.crewId].skill !== site.skill)) blockers.push(`Needs a ${site.skill} crew`);
  if (route && (!route.vanId || vans[route.vanId].kind !== site.van)) blockers.push(`Needs a ${site.van} van`);
  return { ready: blockers.length === 0, blockers, day };
}

export function evaluatePlan(plan, scenario) {
  const siteResults = scenario.siteIds.map((siteId) => ({ siteId, ...inspectSite(plan, siteId) }));
  const completed = siteResults.filter((result) => result.ready).map((result) => result.siteId);
  const failed = siteResults.filter((result) => result.day && !result.ready).map((result) => result.siteId);
  const miles = days.reduce((sum, day) => sum + routeMiles(plan.routes[day].sites), 0);
  const capacity = completed.reduce((sum, siteId) => sum + sites[siteId].capacity, 0);
  const objectiveMet = completed.length >= scenario.targetSites
    && failed.length === 0
    && miles <= scenario.maxMiles
    && capacity >= scenario.targetCapacity;
  return {
    objectiveMet,
    completed,
    failed,
    siteResults,
    sitesReady: completed.length,
    unresolved: siteResults.reduce((sum, result) => sum + result.blockers.length, 0),
    routeMiles: miles,
    capacity,
  };
}
