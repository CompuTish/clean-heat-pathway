# Clean Energy Delivery Board

An interactive, deterministic planning board for a fictional English neighbourhood. Visitors match clean-energy projects with site-specific equipment and approval records, assign capable crews and vehicles, plan Monday–Friday routes, then run the week and review the measurable outcome.

Three scenarios build in difficulty: a guided foundation week, a tight-connections week, and a supplier squeeze where five candidate sites compete for enough resources to deliver three. The same plan always produces the same outcome, so failed visits, route miles and clean-energy capacity can be traced to specific planning choices.

The public route remains `/projects/clean-heat-pathway/` for continuity; the visible project name is Clean Energy Delivery Board.

## Development

```sh
npm install
npm run dev
npm test
npm run test:e2e
npm run build
npm run test:sites
```

`npm run export:firebase` builds the app and copies only the static client into the parent `personal-sites` repository at `clean_heat_demo/public/`. That tracked export is deployed through the parent's named Firebase target.

## Interaction and accessibility

Resources and site cards can be dragged onto map or day destinations with pointer, touch, or keyboard controls. Every action also has a click/tap path: select an item, then choose a site or day. Mobile visitors switch between Queue, Map, Week, and Resources while a sticky tray preserves their current selection.

The app has no accounts, analytics, cookies, forms, network data, or persistent storage. It does not accept real addresses or customer details.

## Context and sources

- [London Community Energy Fund](https://www.london.gov.uk/programmes-strategies/environment-and-climate-change/climate-change/zero-carbon-london/london-community-energy-fund)
- [Energy Networks Association: distributed generation](https://www.energynetworks.org/industry/connecting-to-the-networks/distributed-generation)
- [GOV.UK: renewable and low-carbon energy planning guidance](https://www.gov.uk/guidance/renewable-and-low-carbon-energy)

Context was last reviewed on 1 September 2026. All site names, distances, capacities, resources, records, people, and operational results are fictional. This is an educational operations model, not engineering, connection, planning, procurement, regulatory, or safety advice.
