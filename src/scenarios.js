export const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const sites = {
  riverside: {
    id: "riverside", name: "Riverside School", short: "School", x: 24, y: 63,
    type: "Solar canopy", capacity: 180, equipment: "solar-a", approval: "approval-riverside",
    skill: "solar", van: "cargo", asset: "site-school.png",
  },
  north: {
    id: "north", name: "North Library", short: "Library", x: 55, y: 25,
    type: "Battery retrofit", capacity: 140, equipment: "battery-a", approval: "approval-north",
    skill: "battery", van: "cargo", asset: "site-library.png",
  },
  beacon: {
    id: "beacon", name: "Beacon Leisure Centre", short: "Leisure", x: 77, y: 43,
    type: "Inverter upgrade", capacity: 220, equipment: "inverter-a", approval: "approval-beacon",
    skill: "electrical", van: "service", asset: "site-leisure.png",
  },
  meadow: {
    id: "meadow", name: "Meadow Hall", short: "Hall", x: 45, y: 73,
    type: "Rooftop solar", capacity: 190, equipment: "scaffold-a", approval: "approval-meadow",
    skill: "roofing", van: "lift", asset: "site-hall.png",
  },
  south: {
    id: "south", name: "South Civic Hub", short: "Civic hub", x: 72, y: 79,
    type: "Solar and storage", capacity: 260, equipment: "solar-b", approval: "approval-south",
    skill: "solar", van: "cargo", asset: "site-civic.png",
  },
};

export const crews = {
  northstar: { id: "northstar", name: "Northstar crew", skill: "solar", asset: "crew-northstar.png" },
  oak: { id: "oak", name: "Oak crew", skill: "battery", asset: "crew-oak.png" },
  skyline: { id: "skyline", name: "Skyline crew", skill: "roofing", asset: "crew-skyline.png" },
  circuit: { id: "circuit", name: "Circuit crew", skill: "electrical", asset: "crew-northstar.png" },
};

export const vans = {
  cargo: { id: "cargo", name: "Cargo van", kind: "cargo", asset: "van-cargo.png" },
  service: { id: "service", name: "Service van", kind: "service", asset: "van-service.png" },
  lift: { id: "lift", name: "Lift van", kind: "lift", asset: "van-lift.png" },
};

export const resources = {
  "solar-a": { id: "solar-a", name: "Solar pallet A", kind: "equipment", asset: "solar-pallet.png" },
  "solar-b": { id: "solar-b", name: "Solar pallet B", kind: "equipment", asset: "solar-pallet.png" },
  "battery-a": { id: "battery-a", name: "Battery cabinet", kind: "equipment", asset: "battery-cabinet.png" },
  "inverter-a": { id: "inverter-a", name: "Inverter case", kind: "equipment", asset: "inverter-case.png" },
  "scaffold-a": { id: "scaffold-a", name: "Scaffold kit", kind: "equipment", asset: "scaffold-kit.png" },
  "approval-riverside": { id: "approval-riverside", name: "Riverside approval", kind: "approval", asset: "approval-record.png" },
  "approval-north": { id: "approval-north", name: "North approval", kind: "approval", asset: "approval-record.png" },
  "approval-beacon": { id: "approval-beacon", name: "Beacon approval", kind: "approval", asset: "approval-record.png" },
  "approval-meadow": { id: "approval-meadow", name: "Meadow approval", kind: "approval", asset: "approval-record.png" },
  "approval-south": { id: "approval-south", name: "South approval", kind: "approval", asset: "approval-record.png" },
};

export const scenarios = [
  {
    id: "foundation", week: 1, name: "Foundation", summary: "A guided week with generous capacity.",
    siteIds: ["riverside", "north", "beacon"], targetSites: 3, targetCapacity: 0, maxMiles: 55,
    resourceIds: ["solar-a", "battery-a", "inverter-a", "approval-riverside", "approval-north", "approval-beacon"],
    crewIds: ["northstar", "oak", "circuit"], vanIds: ["cargo", "service"],
  },
  {
    id: "tight-connections", week: 2, name: "Tight connections", summary: "Four visits, exact records and no room for rework.",
    siteIds: ["riverside", "north", "beacon", "meadow"], targetSites: 4, targetCapacity: 0, maxMiles: 65,
    resourceIds: ["solar-a", "battery-a", "inverter-a", "scaffold-a", "approval-riverside", "approval-north", "approval-beacon", "approval-meadow"],
    crewIds: ["northstar", "oak", "circuit", "skyline"], vanIds: ["cargo", "service", "lift"],
  },
  {
    id: "supplier-squeeze", week: 3, name: "Supplier squeeze", summary: "Five candidates; choose the strongest deliverable three.",
    siteIds: ["riverside", "north", "beacon", "meadow", "south"], targetSites: 3, targetCapacity: 500, maxMiles: 60,
    resourceIds: ["solar-a", "solar-b", "inverter-a", "scaffold-a", "approval-riverside", "approval-beacon", "approval-meadow", "approval-south"],
    crewIds: ["northstar", "circuit", "skyline"], vanIds: ["cargo", "service", "lift"],
  },
];

export const distances = {
  depot: { riverside: 5, north: 6, beacon: 8, meadow: 7, south: 9 },
  riverside: { north: 5, beacon: 7, meadow: 3, south: 6 },
  north: { beacon: 4, meadow: 6, south: 8 },
  beacon: { meadow: 5, south: 4 },
  meadow: { south: 3 },
};

export function getScenario(id) {
  return scenarios.find((scenario) => scenario.id === id) ?? scenarios[1];
}
