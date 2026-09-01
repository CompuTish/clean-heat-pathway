import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { ArrowCounterClockwise, ArrowRight, CheckCircle, ClipboardText, FlagCheckered, Info, MapTrifold, Package, Play, Truck, UsersThree, Warning, X } from "@phosphor-icons/react";
import { assignCrew, assignResource, assignVan, createPlan, evaluatePlan, inspectSite, scheduleSite, unassignResource, unscheduleSite } from "./planner.js";
import { crews, days, getScenario, resources, scenarios, sites, vans } from "./scenarios.js";
import mapImage from "./assets/neighbourhood-map.webp";
import schoolImage from "./assets/site-school.webp";
import libraryImage from "./assets/site-library.webp";
import leisureImage from "./assets/site-leisure.webp";
import hallImage from "./assets/site-hall.webp";
import civicImage from "./assets/site-civic.webp";
import northstarImage from "./assets/crew-northstar.webp";
import oakImage from "./assets/crew-oak.webp";
import skylineImage from "./assets/crew-skyline.webp";
import solarImage from "./assets/solar-pallet.webp";
import batteryImage from "./assets/battery-cabinet.webp";
import inverterImage from "./assets/inverter-case.webp";
import scaffoldImage from "./assets/scaffold-kit.webp";
import approvalImage from "./assets/approval-record.webp";
import cargoVanImage from "./assets/van-cargo.webp";
import serviceVanImage from "./assets/van-service.webp";
import liftVanImage from "./assets/van-lift.webp";

const assetImages = {
  "site-school.png": schoolImage, "site-library.png": libraryImage, "site-leisure.png": leisureImage,
  "site-hall.png": hallImage, "site-civic.png": civicImage,
  "crew-northstar.png": northstarImage, "crew-oak.png": oakImage, "crew-skyline.png": skylineImage,
  "solar-pallet.png": solarImage, "battery-cabinet.png": batteryImage, "inverter-case.png": inverterImage,
  "scaffold-kit.png": scaffoldImage, "approval-record.png": approvalImage,
  "van-cargo.png": cargoVanImage, "van-service.png": serviceVanImage, "van-lift.png": liftVanImage,
};

function DraggableCard({ dragId, data, className = "", children, label, onChoose }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: dragId, data });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  return <button ref={setNodeRef} style={style} className={`drag-card ${className} ${isDragging ? "is-dragging" : ""}`} type="button" onClick={onChoose} aria-label={`${label}. Drag or select to place.`} {...listeners} {...attributes}>{children}</button>;
}

function SitePin({ site, plan, active, selectedItem, onSiteClick, onInspect }) {
  const { setNodeRef, isOver } = useDroppable({ id: `site:${site.id}`, data: { type: "site-target", siteId: site.id } });
  const inspection = inspectSite(plan, site.id);
  return <div ref={setNodeRef} className={`site-pin ${active ? "is-active" : ""} ${isOver ? "is-over" : ""} ${inspection.ready ? "is-ready" : ""}`} style={{ left: `${site.x}%`, top: `${site.y}%` }}>
    <button type="button" onClick={() => selectedItem?.type === "resource" ? onSiteClick(site.id) : onInspect(site.id)} aria-label={`${site.name}. ${inspection.ready ? "Ready" : `${inspection.blockers.length} blockers`}.`}>
      <img src={assetImages[site.asset]} alt="" /><span><strong>{site.short}</strong><small>{site.capacity} kW · {inspection.ready ? "Ready" : `${inspection.blockers.length} to resolve`}</small></span>
      {inspection.ready ? <CheckCircle weight="fill" aria-hidden="true" /> : <span className="pin-count">{inspection.blockers.length}</span>}
    </button>
  </div>;
}

function DayLane({ day, route, activeDay, selectedItem, onPlace, onInspect }) {
  const { setNodeRef, isOver } = useDroppable({ id: `day:${day}`, data: { type: "day-target", day } });
  const crew = route.crewId ? crews[route.crewId] : null;
  const van = route.vanId ? vans[route.vanId] : null;
  return <div ref={setNodeRef} className={`day-lane ${isOver ? "is-over" : ""} ${activeDay === day ? "is-running" : ""}`} onClick={() => selectedItem && onPlace(day)}>
    <div className="day-head"><strong>{day.slice(0, 3)}</strong><span>{route.sites.length} stop{route.sites.length === 1 ? "" : "s"}</span></div>
    <div className="day-assignments"><span className={crew ? "is-set" : ""}><UsersThree aria-hidden="true" />{crew?.name ?? "Crew"}</span><span className={van ? "is-set" : ""}><Truck aria-hidden="true" />{van?.name ?? "Van"}</span></div>
    <div className="route-stops">{route.sites.map((siteId, index) => <DraggableStop key={siteId} siteId={siteId} index={index} onInspect={onInspect} />)}{!route.sites.length && <span className="drop-hint">Drop a site here</span>}</div>
  </div>;
}

function DraggableStop({ siteId, index, onInspect }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `route-site:${siteId}`, data: { type: "site", id: siteId } });
  return <button ref={setNodeRef} type="button" style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined} className={isDragging ? "is-dragging" : ""} onClick={(event) => { event.stopPropagation(); onInspect(siteId); }} {...listeners} {...attributes}><span>{index + 1}</span>{sites[siteId].short}</button>;
}

function ResultSheet({ result, scenario, onClose, onReset }) {
  return <div className="result-backdrop" role="presentation"><section className="result-sheet" role="dialog" aria-modal="true" aria-labelledby="result-title">
    <button className="icon-button close-result" type="button" onClick={onClose} aria-label="Close results"><X /></button>
    <span className={`result-seal ${result.objectiveMet ? "is-success" : "is-warning"}`}>{result.objectiveMet ? <CheckCircle weight="fill" /> : <Warning weight="fill" />}</span>
    <p className="eyebrow">Week {scenario.week} review</p><h2 id="result-title">{result.objectiveMet ? "Objective met" : "Plan needs another pass"}</h2>
    <p>{result.objectiveMet ? "The planned visits completed without a failed arrival." : "The run exposed gaps before this plan should leave the board."}</p>
    <dl className="result-metrics"><div><dt>Sites complete</dt><dd>{result.completed.length}/{scenario.targetSites}</dd></div><div><dt>Failed visits</dt><dd>{result.failed.length}</dd></div><div><dt>Route</dt><dd>{result.routeMiles}/{scenario.maxMiles} mi</dd></div><div><dt>Capacity unblocked</dt><dd>{result.capacity} kW</dd></div></dl>
    {result.failed.length > 0 && <ul className="result-blockers">{result.siteResults.filter((item) => item.day && !item.ready).map((item) => <li key={item.siteId}><strong>{sites[item.siteId].name}</strong> — {item.blockers.join("; ")}</li>)}</ul>}
    <div className="result-actions"><button className="button secondary" type="button" onClick={onReset}><ArrowCounterClockwise />Reset week</button><button className="button primary" type="button" onClick={onClose}>Return to board<ArrowRight /></button></div>
  </section></div>;
}

export function App() {
  const [scenarioId, setScenarioId] = useState("tight-connections");
  const scenario = useMemo(() => getScenario(scenarioId), [scenarioId]);
  const [plan, setPlan] = useState(createPlan);
  const [history, setHistory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSite, setSelectedSite] = useState(scenario.siteIds[0]);
  const [status, setStatus] = useState("planning");
  const [result, setResult] = useState(null);
  const [activeDay, setActiveDay] = useState(null);
  const [activeDrag, setActiveDrag] = useState(null);
  const [mobileView, setMobileView] = useState("map");
  const runTimer = useRef(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 160, tolerance: 6 } }), useSensor(KeyboardSensor));

  const updatePlan = useCallback((transform) => {
    setPlan((current) => { const next = transform(current); if (next !== current) setHistory((items) => [...items.slice(-19), current]); return next; });
    setResult(null); setStatus("planning");
  }, []);
  const reset = useCallback(() => { window.clearInterval(runTimer.current); setPlan(createPlan()); setHistory([]); setSelectedItem(null); setResult(null); setStatus("planning"); setActiveDay(null); }, []);
  useEffect(() => { reset(); setSelectedSite(scenario.siteIds[0]); }, [scenarioId, reset, scenario.siteIds]);
  const choose = (type, id) => setSelectedItem((current) => current?.type === type && current.id === id ? null : { type, id });
  const placeOnSite = (siteId) => { if (selectedItem?.type !== "resource") return; updatePlan((current) => assignResource(current, selectedItem.id, siteId)); setSelectedItem(null); setSelectedSite(siteId); };
  const placeOnDay = (day) => { if (!selectedItem) return; const actions = { site: scheduleSite, crew: assignCrew, van: assignVan }; updatePlan((current) => actions[selectedItem.type]?.(current, selectedItem.id, day) ?? current); setSelectedItem(null); };
  const removeResource = (resourceId) => updatePlan((current) => unassignResource(current, resourceId));
  const removeFromRoute = (siteId) => updatePlan((current) => unscheduleSite(current, siteId));
  const handleDragEnd = ({ active, over }) => {
    setActiveDrag(null); if (!over) return; const source = active.data.current; const target = over.data.current;
    if (source.type === "resource" && target.type === "site-target") updatePlan((current) => assignResource(current, source.id, target.siteId));
    if (target.type === "day-target" && source.type === "site") updatePlan((current) => scheduleSite(current, source.id, target.day));
    if (target.type === "day-target" && source.type === "crew") updatePlan((current) => assignCrew(current, source.id, target.day));
    if (target.type === "day-target" && source.type === "van") updatePlan((current) => assignVan(current, source.id, target.day));
  };
  const currentEvaluation = useMemo(() => evaluatePlan(plan, scenario), [plan, scenario]);
  const runWeek = () => {
    const occupiedDays = days.filter((day) => plan.routes[day].sites.length); setStatus("running"); setResult(null); setSelectedItem(null);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !occupiedDays.length) { setActiveDay(null); setResult(currentEvaluation); setStatus("complete"); return; }
    let index = 0; setActiveDay(occupiedDays[0]); runTimer.current = window.setInterval(() => { index += 1; if (index >= occupiedDays.length) { window.clearInterval(runTimer.current); setActiveDay(null); setResult(currentEvaluation); setStatus("complete"); } else setActiveDay(occupiedDays[index]); }, 650);
  };
  useEffect(() => () => window.clearInterval(runTimer.current), []);
  useEffect(() => {
    const sendState = () => { const shell = document.querySelector(".app-shell"); window.parent?.postMessage({ type: "clean-energy-delivery-board", version: 1, status, scenario: scenario.id, objectiveMet: Boolean(result?.objectiveMet), sitesReady: currentEvaluation.sitesReady, targetSites: scenario.targetSites, failedVisits: result?.failed.length ?? 0, unresolved: currentEvaluation.unresolved, routeMiles: currentEvaluation.routeMiles, height: Math.min(4200, Math.max(760, Math.ceil(shell?.getBoundingClientRect().height ?? document.body.scrollHeight))) }, "*"); };
    sendState(); const observer = new ResizeObserver(sendState); observer.observe(document.querySelector(".app-shell") ?? document.body); return () => observer.disconnect();
  }, [currentEvaluation, result, scenario, status]);
  const assignedResources = new Set(Object.values(plan.allocations).flat());
  const assignedCrews = new Set(days.map((day) => plan.routes[day].crewId).filter(Boolean));
  const assignedVans = new Set(days.map((day) => plan.routes[day].vanId).filter(Boolean));
  const selectedInspection = inspectSite(plan, selectedSite);

  return <DndContext sensors={sensors} onDragStart={({ active }) => setActiveDrag(active.data.current)} onDragCancel={() => setActiveDrag(null)} onDragEnd={handleDragEnd} accessibility={{ screenReaderInstructions: { draggable: "To pick up an item, press space. Move it to a highlighted destination, then press space again. You can also select an item and choose its destination." } }}>
    <main className="app-shell">
      <header className="topbar"><a className="brand" href="#board" aria-label="Clean Energy Delivery Board home"><span className="brand-mark">IS</span><span>Clean Energy <b>Delivery Board</b></span></a><label className="scenario-picker"><span>Scenario</span><select value={scenarioId} onChange={(event) => setScenarioId(event.target.value)}>{scenarios.map((item) => <option key={item.id} value={item.id}>Week {item.week} · {item.name}</option>)}</select></label><div className="top-actions"><button className="button quiet" type="button" disabled={!history.length} onClick={() => { const previous = history.at(-1); if (previous) { setPlan(previous); setHistory((items) => items.slice(0, -1)); } }}><ArrowCounterClockwise />Undo</button><button className="button secondary" type="button" onClick={reset}>Reset</button><button className="button primary" type="button" onClick={runWeek} disabled={status === "running"}><Play weight="fill" />Run week</button></div></header>

      <section className="mission-bar" aria-labelledby="mission-title"><div><p className="eyebrow">Week {scenario.week} · {scenario.name}</p><h1 id="mission-title">Plan the week. Protect every visit.</h1><p>{scenario.summary}</p></div><dl><div><dt>Objective</dt><dd>Activate {scenario.targetSites} sites · 0 failed visits</dd></div><div><dt>Route cap</dt><dd>{scenario.maxMiles} fictional miles</dd></div>{scenario.targetCapacity > 0 && <div><dt>Capacity</dt><dd>At least {scenario.targetCapacity} kW</dd></div>}</dl></section>
      <nav className="mobile-tabs" aria-label="Board views">{["queue", "map", "week", "resources"].map((view) => <button key={view} type="button" className={mobileView === view ? "is-active" : ""} onClick={() => setMobileView(view)}>{view}</button>)}</nav>
      <section className="board" id="board">
        <aside className={`queue-panel mobile-${mobileView}`} aria-labelledby="queue-title"><div className="panel-heading"><span><ClipboardText /></span><div><p className="eyebrow">Project queue</p><h2 id="queue-title">Candidate sites</h2></div></div><div className="queue-list">{scenario.siteIds.map((siteId) => { const site = sites[siteId]; const inspection = inspectSite(plan, siteId); return <DraggableCard key={siteId} dragId={`drag-site:${siteId}`} data={{ type: "site", id: siteId }} label={site.name} className={selectedItem?.type === "site" && selectedItem.id === siteId ? "is-selected" : ""} onChoose={() => choose("site", siteId)}><img src={assetImages[site.asset]} alt="" /><span><strong>{site.name}</strong><small>{site.type} · {site.capacity} kW</small></span><i className={inspection.ready ? "ready" : "blocked"}>{inspection.ready ? "ready" : inspection.blockers.length}</i></DraggableCard>; })}</div><p className="panel-tip"><Info />Drag a site into the week, or select it then choose a day.</p></aside>
        <section className={`map-panel mobile-${mobileView}`} aria-labelledby="map-title"><div className="map-toolbar"><div><p className="eyebrow">Neighbourhood map</p><h2 id="map-title">Fictional Eastborough</h2></div><button type="button" className="readiness" onClick={() => setSelectedSite(scenario.siteIds.find((id) => !inspectSite(plan, id).ready) ?? scenario.siteIds[0])}><FlagCheckered />Check readiness <strong>{currentEvaluation.sitesReady}/{scenario.targetSites}</strong></button></div><div className="map-canvas" style={{ backgroundImage: `url(${mapImage})` }}>{scenario.siteIds.map((siteId) => <SitePin key={siteId} site={sites[siteId]} plan={plan} active={selectedSite === siteId || Boolean(activeDay && plan.routes[activeDay].sites.includes(siteId))} selectedItem={selectedItem} onSiteClick={placeOnSite} onInspect={setSelectedSite} />)}<div className="map-key"><span><i className="key-dot ready" />Ready</span><span><i className="key-dot blocked" />Needs work</span><span><MapTrifold />Fictional geography</span></div></div><div className="site-inspector" aria-live="polite"><img src={assetImages[sites[selectedSite].asset]} alt="" /><div><p className="eyebrow">Site brief</p><h3>{sites[selectedSite].name}</h3><p>{sites[selectedSite].type} · {sites[selectedSite].capacity} kW fictional capacity</p><div className="placed-items">{(plan.allocations[selectedSite] ?? []).map((id) => <button type="button" key={id} onClick={() => removeResource(id)}>{resources[id].name}<X /></button>)}{selectedInspection.day && <button type="button" onClick={() => removeFromRoute(selectedSite)}>{selectedInspection.day}<X /></button>}</div></div><ul>{selectedInspection.blockers.length ? selectedInspection.blockers.map((blocker) => <li key={blocker}><Warning weight="fill" />{blocker}</li>) : <li className="is-ready"><CheckCircle weight="fill" />Ready to run</li>}</ul></div></section>
        <aside className={`week-panel mobile-${mobileView}`} aria-labelledby="week-title"><div className="panel-heading"><span><MapTrifold /></span><div><p className="eyebrow">Route board</p><h2 id="week-title">Monday–Friday</h2></div></div><div className="week-lanes">{days.map((day) => <DayLane key={day} day={day} route={plan.routes[day]} activeDay={activeDay} selectedItem={selectedItem} onPlace={placeOnDay} onInspect={setSelectedSite} />)}</div><div className="score-card"><span>Live plan</span><strong>{currentEvaluation.routeMiles} / {scenario.maxMiles} mi</strong><small>{currentEvaluation.unresolved} unresolved requirement{currentEvaluation.unresolved === 1 ? "" : "s"}</small></div></aside>
      </section>
      <section className={`resource-dock mobile-${mobileView}`} aria-labelledby="resources-title"><div className="dock-heading"><div><p className="eyebrow">Resource dock</p><h2 id="resources-title">People, kit and records</h2></div><p>Drag to a site or day. On touch, select an item first.</p></div><div className="resource-groups"><div className="resource-group"><h3><UsersThree />Crews</h3><div>{scenario.crewIds.map((id) => <DraggableCard key={id} dragId={`drag-crew:${id}`} data={{ type: "crew", id }} label={crews[id].name} className={`${assignedCrews.has(id) ? "is-assigned" : ""} ${selectedItem?.type === "crew" && selectedItem.id === id ? "is-selected" : ""}`} onChoose={() => choose("crew", id)}><img src={assetImages[crews[id].asset]} alt="" /><span><strong>{crews[id].name}</strong><small>{crews[id].skill} team</small></span></DraggableCard>)}</div></div><div className="resource-group kit"><h3><Package />Equipment & approvals</h3><div>{scenario.resourceIds.map((id) => <DraggableCard key={id} dragId={`drag-resource:${id}`} data={{ type: "resource", id }} label={resources[id].name} className={`${assignedResources.has(id) ? "is-assigned" : ""} ${selectedItem?.type === "resource" && selectedItem.id === id ? "is-selected" : ""}`} onChoose={() => choose("resource", id)}><img src={assetImages[resources[id].asset]} alt="" /><span><strong>{resources[id].name}</strong><small>{resources[id].kind}</small></span></DraggableCard>)}</div></div><div className="resource-group"><h3><Truck />Vehicles</h3><div>{scenario.vanIds.map((id) => <DraggableCard key={id} dragId={`drag-van:${id}`} data={{ type: "van", id }} label={vans[id].name} className={`${assignedVans.has(id) ? "is-assigned" : ""} ${selectedItem?.type === "van" && selectedItem.id === id ? "is-selected" : ""}`} onChoose={() => choose("van", id)}><img src={assetImages[vans[id].asset]} alt="" /><span><strong>{vans[id].name}</strong><small>{vans[id].kind} work</small></span></DraggableCard>)}</div></div></div></section>
      {selectedItem && <div className="selection-tray" role="status"><span>Selected: <strong>{sites[selectedItem.id]?.name ?? crews[selectedItem.id]?.name ?? vans[selectedItem.id]?.name ?? resources[selectedItem.id]?.name}</strong></span><span>Choose a {selectedItem.type === "resource" ? "map site" : "day"} to place it.</span><button type="button" onClick={() => setSelectedItem(null)}>Cancel</button></div>}
      <section className="about" id="about"><div><p className="eyebrow">About the model</p><h2>Delivery is a chain of small, checkable promises.</h2></div><p>This fictional planning board explores how site records, matching equipment, capable people and sensible routing turn clean-energy ambition into completed work. It is deliberately deterministic: the same plan always produces the same result, so every outcome can be traced back to a planning choice.</p></section>
      <section className="sources" id="sources"><div><p className="eyebrow">Context, not compliance</p><h2>Grounded in public guidance</h2><p>Reviewed 1 September 2026. The site names, distances, capacities, documents and outcomes in this model are fictional.</p></div><ul><li><a href="https://www.london.gov.uk/programmes-strategies/environment-and-climate-change/climate-change/zero-carbon-london/london-community-energy-fund" target="_blank" rel="noreferrer">London Community Energy Fund</a></li><li><a href="https://www.energynetworks.org/industry/connecting-to-the-networks/distributed-generation" target="_blank" rel="noreferrer">ENA distributed generation guidance</a></li><li><a href="https://www.gov.uk/guidance/renewable-and-low-carbon-energy" target="_blank" rel="noreferrer">GOV.UK planning guidance</a></li></ul></section>
      <footer><p>Fictional educational operations model — not engineering, connection, planning, procurement, regulatory or safety advice.</p><a href="https://isabelsmith.me" target="_top">Back to isabelsmith.me</a></footer>
    </main>
    <DragOverlay>{activeDrag && <div className="drag-overlay">{sites[activeDrag.id]?.name ?? crews[activeDrag.id]?.name ?? vans[activeDrag.id]?.name ?? resources[activeDrag.id]?.name}</div>}</DragOverlay>
    {result && <ResultSheet result={result} scenario={scenario} onClose={() => setResult(null)} onReset={reset} />}
  </DndContext>;
}
