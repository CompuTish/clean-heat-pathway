# Clean Heat Pathway design QA

- Source visual truth: `design/clean-heat-pathway-option-3.png`
- Final implementation screenshot: `design-qa/implementation-grid-desktop-final.png`
- Full comparison: `design-qa/comparison-final.png`
- Focused comparison: `design-qa/comparison-focused-final.png`
- Mobile evidence: `design-qa/implementation-mobile-initial.png`
- Desktop viewport: 1440 x 1024 CSS px at device scale factor 1
- Source pixels: 1487 x 1058, normalised to 1440 x 1024 for comparison
- Implementation pixels: 1440 x 1024
- Compared state: Survey and Planning complete; Grid current with missing service evidence; live London grid data loaded

## Findings

No actionable P0, P1, or P2 findings remain.

- Fonts and typography: The implementation uses the same heavy, compact system/Inter-like hierarchy as the selected mock. Headline scale, wrapping, small uppercase labels, and decision typography are visibly aligned after the second pass.
- Spacing and layout rhythm: Header, split hero, expanded central stage, six-stage ribbon, feedback line, and live grid band reproduce the mock's information hierarchy. The functional evidence rows make the current stage slightly denser, but remain within the same proportion and do not crowd or clip controls.
- Colors and visual tokens: White, dark ink, blue outlines, pale-ocean completed states, gold current state, orange primary action, and ruby warning accents match the source direction. The mock's faint atmospheric glow was intentionally omitted to honour the no-gradient constraint and the parent site's flat color system.
- Image and icon fidelity: The visual contains interface icons rather than raster artwork. The implementation uses a single rounded Phosphor icon family throughout; no emoji, custom SVG, CSS illustration, or placeholder imagery is present.
- Copy and content: The hero, six stages, missing-evidence decision, actions, live grid context, and educational disclaimer preserve the selected concept. Fake navigation and non-existent report/home actions from the mock were replaced with working About, Sources, and Restart controls.

## Comparison history

### Pass 1 - blocked

- P2: the active-stage flex transition was captured before it settled, making Planning appear expanded while Grid contained the active content.
- P2: the hero and pathway were too tall, pushing most of the live grid band below the 1024 px viewport.
- P2: the initial render logged a missing-favicon resource error.

Fixes: waited for the 180 ms state transition before capture; reduced hero/ribbon vertical density; removed the extra hero pill; added an explicit empty favicon; recaptured with zero console or page errors.

### Pass 2 - passed

Post-fix evidence shows the expanded Grid stage centred in the six-stage ribbon, the live grid band fully visible, the disclaimer present, and no clipping or overflow. Focused comparison confirms the active-stage anatomy, actions, completed/future states, and grid band remain faithful at readable scale.

## Responsive and interaction evidence

- Desktop and 390 x 844 mobile screenshots render without horizontal overflow.
- The mobile design preserves the visual hierarchy, makes the active stage first, and keeps actions at touch-friendly sizes.
- Complete pointer and keyboard pathway journeys are covered by Playwright.
- Loading, API failure, warning, resolved, complete, hover, focus, and reduced-motion behavior are implemented.
- Browser console and page errors checked: none in the final desktop and mobile captures.

## Follow-up polish

- P3: the mock uses chevron-shaped stage boundaries; the implementation uses simpler straight separators to avoid decorative CSS drawing and maintain more predictable responsive behavior.

final result: passed
