# Clean Heat Pathway

An interactive educational model following one fictional English home through the operational pathway from heat-pump survey to customer handover.

The project focuses on the work that makes clean technology scalable: complete evidence, accurate records, grid coordination, parts confirmation, exception handling, and a complete handover pack. It is not an installation, planning, electrical, MCS, DNO, or regulatory compliance tool.

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

## Data and sources

- Live regional electricity data: [NESO Carbon Intensity API](https://api.carbonintensity.org.uk/), licensed CC BY 4.0.
- Planning noise evidence: [MCS 020 a, Issue 1.1](https://mcscertified.com/wp-content/uploads/2025/07/MCS-020-a-Issue-1.1-Final.pdf).
- Performance estimate context: [MCS 031: 2025](https://mcscertified.com/wp-content/uploads/2025/01/MCS-031-2025-V1.0.pdf).
- Grid connection context: [Energy Networks Association guidance](https://www.energynetworks.org/industry/connecting-to-the-networks/connecting-electric-vehicles-and-heat-pumps).

Regulatory summaries were last reviewed on 1 September 2026. They intentionally represent selected operational checkpoints rather than the full requirements for any real property or system.

## Privacy and resilience

The app has no accounts, analytics, cookies, forms, or persistent storage and does not accept real property or customer details. NESO data is fetched directly in the browser. If the live API is unavailable or returns an unexpected schema, the pathway remains functional and the grid panel shows an explicit unavailable state.
