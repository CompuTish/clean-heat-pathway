# Clean Energy Delivery Board design QA

- Source visual truth: `design/clean-energy-delivery-board-option-2-neighbourhood-map.png`
- Final desktop screenshot: `design-qa/implementation-neighbourhood-map-desktop-final.png`
- Final mobile screenshot: `design-qa/implementation-neighbourhood-map-mobile-final.png`
- Side-by-side comparison: `design-qa/comparison-neighbourhood-map-final.png`
- Desktop viewport and source: 1487 x 1058 CSS/image px at device scale factor 1
- Mobile viewport: 390 x 844 CSS px at device scale factor 1
- Compared state: Week 2 · Tight connections, initial planning board

## Findings

No actionable P0, P1, or P2 findings remain.

- Layout and hierarchy: the implementation preserves the selected map-first operations-board composition: compact command header, candidate queue, dominant neighbourhood map, Monday–Friday route rail, site inspector and wide resource dock. A concise mission/objective band was added above the board to make the goal understandable without relying on the wrapper page.
- Typography and density: heavy Inter headings, compact uppercase labels and small operational metadata closely match the reference. All controls and labels remain readable at the target desktop viewport without clipping.
- Colour and states: cobalt outlines, warm-white panels, pale-ocean geography, gold selection, ruby blockers and green readiness states match the approved direction. Status is never communicated by colour alone.
- Image fidelity: the background map, five civic buildings, three fictional crew portraits and equipment/vehicle records are purpose-made raster assets. They remain identifiable at their rendered sizes and contain no brands, real people, addresses or embedded UI text.
- Interaction fidelity: site cards, reusable crews, vehicles and route stops are draggable; resources drop onto map sites; routes accept and reorder site stops. Every drag action has a select-then-place click/tap equivalent. Undo, reset, explicit removal, readiness inspection and the deterministic run/review flow all work.
- Content integrity: all scenarios, people, geography, distances, capacities, documents and outcomes are explicitly fictional. Public-source links provide context without presenting the model as regulatory, engineering, planning or procurement advice.

## Responsive and implementation evidence

- Desktop and 390 px mobile captures have no horizontal overflow and no broken images.
- Mobile uses visible Queue, Map, Week and Resources tabs plus a sticky selected-item tray, preserving the complete planning workflow without shrinking the desktop board.
- Pointer drag and the non-drag click/tap workflow are covered in Playwright, alongside successful and failed week outcomes.
- Unit coverage verifies exact resource matching, scheduled-failure consequences, route mileage, resource uniqueness and solvable Week 1 and Week 3 objectives.
- Reduced-motion mode skips the day-by-day animation and presents results immediately.
- Final desktop and mobile captures produced zero console errors and zero page errors.
- The final source-to-implementation comparison was judged from the combined side-by-side image at the same desktop dimensions.

## Deliberate differences from the mock

- The mock contains generic job packs and repeated vans; the implementation uses named fictional community sites and identifiable generated assets so planning choices are legible and outcome-led.
- The implementation adds a site inspector, explicit remove controls and a deterministic result sheet because they are required to make the concept fully operable rather than visual-only.
- The compact mission band surfaces the scenario objective, route cap and Week 3 capacity target in the standalone app.

final result: passed
