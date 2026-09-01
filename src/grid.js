export const regions = [
  [1, "North Scotland"], [2, "South Scotland"], [3, "North West England"],
  [4, "North East England"], [5, "South Yorkshire"], [6, "North Wales, Merseyside and Cheshire"],
  [7, "South Wales"], [8, "West Midlands"], [9, "East Midlands"],
  [10, "East England"], [11, "South West England"], [12, "South England"],
  [13, "London"], [14, "South East England"],
].map(([id, name]) => ({ id, name }));

const allowedIndexes = new Set(["very low", "low", "moderate", "high", "very high"]);

export function parseGridResponse(payload) {
  const region = payload?.data?.[0];
  const interval = region?.data?.[0];
  const intensity = interval?.intensity;
  if (
    !Number.isInteger(region?.regionid) ||
    typeof region?.shortname !== "string" ||
    typeof interval?.from !== "string" ||
    typeof interval?.to !== "string" ||
    !Number.isFinite(intensity?.forecast) ||
    !allowedIndexes.has(intensity?.index) ||
    !Array.isArray(interval?.generationmix)
  ) {
    throw new Error("Unexpected NESO response");
  }

  const mix = interval.generationmix
    .filter((item) => typeof item?.fuel === "string" && Number.isFinite(item?.perc) && item.perc >= 0)
    .map((item) => ({ fuel: item.fuel, percent: item.perc }))
    .sort((a, b) => b.percent - a.percent);
  if (!mix.length) throw new Error("Generation mix missing");

  return {
    regionId: region.regionid,
    regionName: region.shortname,
    from: interval.from,
    to: interval.to,
    forecast: intensity.forecast,
    index: intensity.index,
    mix,
  };
}

export async function fetchGridSnapshot(regionId, signal) {
  const response = await fetch(`https://api.carbonintensity.org.uk/regional/regionid/${regionId}`, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) throw new Error(`NESO request failed: ${response.status}`);
  return parseGridResponse(await response.json());
}
