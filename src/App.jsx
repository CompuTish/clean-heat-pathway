import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowClockwise, ArrowRight, Check, CheckCircle, ClipboardText, FileText,
  Gauge, Handshake, HouseLine, Lightning, MapPin, Plug, ShieldCheck,
  Truck, Warning, Wrench,
} from "@phosphor-icons/react";
import { createInitialPathway, stages, transitionPathway } from "./pathway.js";
import { fetchGridSnapshot, regions } from "./grid.js";

const stageIcons = {
  survey: ClipboardText,
  planning: FileText,
  grid: Plug,
  parts: Truck,
  install: Wrench,
  handover: HouseLine,
};

const mixColors = ["#005bb3", "#51bfc5", "#f6c84f", "#f86a38", "#d8226c", "#9db1bd"];

function formatInterval(from, to) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
  return `${formatter.format(new Date(from))}–${formatter.format(new Date(to))}`;
}

function EvidenceList({ stage, resolved }) {
  return (
    <ul className="evidence-list" aria-label={`${stage.name} evidence`}>
      {stage.evidence.map((item) => {
        const missing = item === stage.missing && !resolved;
        return (
          <li key={item} className={missing ? "is-missing" : "is-ready"}>
            {missing ? <Warning aria-hidden="true" weight="fill" /> : <CheckCircle aria-hidden="true" weight="fill" />}
            <span>{item}</span>
            <strong>{missing ? "Missing" : "Ready"}</strong>
          </li>
        );
      })}
    </ul>
  );
}

function DecisionActions({ stage, resolved, onAction }) {
  if (!stage.missing) {
    return (
      <button className="action action-primary" type="button" onClick={() => onAction("primary")}>
        <Check aria-hidden="true" weight="bold" />
        {stage.primaryLabel}
      </button>
    );
  }

  if (resolved) {
    return (
      <button className="action action-primary" type="button" onClick={() => onAction("continue")}>
        {stage.continueLabel}
        <ArrowRight aria-hidden="true" weight="bold" />
      </button>
    );
  }

  return (
    <div className="action-group">
      <button className="action action-primary" type="button" onClick={() => onAction("resolve")}>
        <ShieldCheck aria-hidden="true" weight="bold" />
        {stage.resolveLabel}
      </button>
      <button className="action action-secondary" type="button" onClick={() => onAction("escalate")}>
        <Handshake aria-hidden="true" weight="bold" />
        {stage.escalateLabel}
      </button>
      <button className="action-link" type="button" onClick={() => onAction("override")}>
        {stage.overrideLabel}
      </button>
    </div>
  );
}

function StageCard({ stage, status, resolved, onAction }) {
  const Icon = stageIcons[stage.id];
  const current = status === "current";
  return (
    <li className={`stage-card is-${status}`} aria-current={current ? "step" : undefined}>
      <div className="stage-heading">
        <span className="stage-number">{stage.number}</span>
        <Icon className="stage-icon" aria-hidden="true" weight="regular" />
        <div>
          <h2>{stage.name}</h2>
          <p>{stage.short}</p>
        </div>
        {status === "complete" && <CheckCircle className="complete-mark" aria-label="Complete" weight="fill" />}
      </div>

      {current && (
        <div className="decision">
          <div className="decision-label">
            <span>{stage.missing && !resolved ? "Needs action" : "Ready to progress"}</span>
          </div>
          <h3>{stage.title}</h3>
          <p>{stage.description}</p>
          <EvidenceList stage={stage} resolved={resolved} />
          <DecisionActions stage={stage} resolved={resolved} onAction={onAction} />
        </div>
      )}
    </li>
  );
}

function GridPulse() {
  const [regionId, setRegionId] = useState(13);
  const [snapshot, setSnapshot] = useState(null);
  const [status, setStatus] = useState("loading");

  const load = useCallback(async (id, externalSignal) => {
    const timeout = new AbortController();
    const timer = window.setTimeout(() => timeout.abort(), 6500);
    const abort = () => timeout.abort();
    externalSignal?.addEventListener("abort", abort);
    setStatus("loading");
    try {
      const result = await fetchGridSnapshot(id, timeout.signal);
      setSnapshot(result);
      setStatus("ready");
    } catch {
      if (!externalSignal?.aborted) setStatus("error");
    } finally {
      window.clearTimeout(timer);
      externalSignal?.removeEventListener("abort", abort);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(regionId, controller.signal);
    return () => controller.abort();
  }, [load, regionId]);

  const topMix = useMemo(() => snapshot?.mix.slice(0, 6) ?? [], [snapshot]);

  return (
    <section className="grid-pulse" aria-labelledby="grid-pulse-title">
      <div className="pulse-intro">
        <span className={`live-dot ${status === "ready" ? "is-live" : ""}`} aria-hidden="true" />
        <div>
          <p className="eyebrow" id="grid-pulse-title">Grid right now</p>
          <p className="pulse-note">Live regional context from NESO</p>
        </div>
      </div>

      <label className="region-select">
        <MapPin aria-hidden="true" weight="bold" />
        <span>Region</span>
        <select value={regionId} onChange={(event) => setRegionId(Number(event.target.value))}>
          {regions.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}
        </select>
      </label>

      {status === "ready" && snapshot ? (
        <>
          <div className="pulse-metric">
            <Lightning aria-hidden="true" weight="bold" />
            <span><strong>{snapshot.forecast}</strong> gCO₂/kWh</span>
            <small>{formatInterval(snapshot.from, snapshot.to)}</small>
          </div>
          <div className="pulse-metric">
            <Gauge aria-hidden="true" weight="bold" />
            <span className={`intensity is-${snapshot.index.replace(" ", "-")}`}>{snapshot.index}</span>
            <small>Forecast intensity</small>
          </div>
          <div className="generation-mix">
            <div className="mix-heading"><strong>Generation mix</strong><span>% of regional electricity</span></div>
            <div className="mix-bar" aria-hidden="true">
              {topMix.map((item, index) => (
                <span key={item.fuel} style={{ width: `${item.percent}%`, backgroundColor: mixColors[index] }} />
              ))}
            </div>
            <ul>
              {topMix.slice(0, 4).map((item, index) => (
                <li key={item.fuel}><i style={{ backgroundColor: mixColors[index] }} />{item.fuel} {item.percent}%</li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div className={`pulse-state is-${status}`} role="status">
          {status === "loading" ? "Loading live grid data…" : (
            <><span>Live signal unavailable.</span><button type="button" onClick={() => load(regionId)}>Try again</button></>
          )}
        </div>
      )}
    </section>
  );
}

export function App() {
  const [pathway, setPathway] = useState(createInitialPathway);
  const complete = pathway.currentIndex >= stages.length;
  const currentStage = complete ? null : stages[pathway.currentIndex];

  const act = (action) => setPathway((state) => transitionPathway(state, action));
  const restart = () => setPathway(createInitialPathway());

  useEffect(() => {
    const sendState = () => {
      const shell = document.querySelector(".app-shell");
      const contentHeight = shell?.getBoundingClientRect().height ?? document.body.scrollHeight;
      window.parent?.postMessage({
        type: "clean-heat-pathway",
        version: 1,
        status: complete ? "complete" : pathway.currentIndex === 0 ? "not-started" : "active",
        stage: complete ? stages.length : pathway.currentIndex,
        blockersCaught: pathway.blockersCaught,
        unresolved: currentStage?.missing && !pathway.resolved[currentStage.id] ? 1 : 0,
        height: Math.min(3600, Math.max(640, Math.ceil(contentHeight))),
      }, "*");
    };
    sendState();
    const observer = new ResizeObserver(sendState);
    const shell = document.querySelector(".app-shell");
    observer.observe(shell ?? document.body);
    return () => observer.disconnect();
  }, [complete, currentStage, pathway]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#pathway" aria-label="Clean Heat Pathway home">
          <span className="brand-mark">IS</span>
          <span>Clean Heat Pathway</span>
        </a>
        <nav aria-label="Project navigation">
          <a href="#about">About the model</a>
          <a href="#sources">Sources</a>
          <button type="button" onClick={restart}><ArrowClockwise aria-hidden="true" weight="bold" />Restart</button>
        </nav>
      </header>

      <section className="hero" id="pathway">
        <div>
          <h1>One heat-pump installation, from survey to handover.</h1>
        </div>
        <p>Follow the operational pathway behind one fictional home. Check the evidence, notice exceptions and keep a clean-heat installation moving without skipping the details.</p>
      </section>

      <section aria-label="Installation pathway">
        <ol className="pathway-ribbon">
          {stages.map((stage, index) => {
            const status = complete || pathway.completed.includes(stage.id)
              ? "complete"
              : index === pathway.currentIndex ? "current" : "upcoming";
            return <StageCard key={stage.id} stage={stage} status={status} resolved={Boolean(pathway.resolved[stage.id])} onAction={act} />;
          })}
        </ol>

        <div className={`feedback is-${pathway.feedbackKind}`} role="status" aria-live="polite">
          {pathway.feedbackKind === "warning" ? <Warning aria-hidden="true" weight="fill" /> : <CheckCircle aria-hidden="true" weight="fill" />}
          <span>{pathway.feedback}</span>
        </div>

        {complete && (
          <div className="completion" role="region" aria-labelledby="completion-title">
            <div><ShieldCheck aria-hidden="true" weight="duotone" /></div>
            <div>
              <span className="eyebrow">Pathway ready</span>
              <h2 id="completion-title">The handover pack is complete.</h2>
              <p>You caught {pathway.blockersCaught} operational blockers before they became installation or handover failures{pathway.overridesPrevented ? `, and prevented ${pathway.overridesPrevented} premature ${pathway.overridesPrevented === 1 ? "step" : "steps"}` : ""}.</p>
            </div>
            <button className="action action-primary" type="button" onClick={restart}><ArrowClockwise aria-hidden="true" weight="bold" />Run it again</button>
          </div>
        )}
      </section>

      <GridPulse />
      <p className="stage-disclaimer">Fictional home · Educational model · Reviewed 1 September 2026</p>

      <section className="model-notes" id="about">
        <div>
          <span className="eyebrow">Why this pathway exists</span>
          <h2>Clean technology depends on ordinary work done well.</h2>
        </div>
        <p>Decarbonising home heating is not only a technology question. It also relies on accurate evidence, clear ownership, timely parts and people recognising when a job has left the happy path.</p>
      </section>

      <section className="sources" id="sources" aria-labelledby="sources-title">
        <div>
          <span className="eyebrow">Sources and limits</span>
          <h2 id="sources-title">Selected checkpoints, not a compliance tool.</h2>
          <p>This model simplifies a real installation workflow. Rules can change and differ by nation, property and system. Always use current official guidance for real work.</p>
        </div>
        <ul>
          <li><a href="https://mcscertified.com/wp-content/uploads/2025/07/MCS-020-a-Issue-1.1-Final.pdf" target="_blank" rel="noreferrer">MCS 020 planning standard</a></li>
          <li><a href="https://mcscertified.com/wp-content/uploads/2025/01/MCS-031-2025-V1.0.pdf" target="_blank" rel="noreferrer">MCS 031 performance estimate</a></li>
          <li><a href="https://www.energynetworks.org/industry/connecting-to-the-networks/connecting-electric-vehicles-and-heat-pumps" target="_blank" rel="noreferrer">ENA connection guidance</a></li>
          <li><a href="https://api.carbonintensity.org.uk/" target="_blank" rel="noreferrer">NESO Carbon Intensity API</a></li>
        </ul>
      </section>

      <footer>
        <span>Fictional home · Educational model · Reviewed 1 September 2026</span>
        <a href="https://isabelsmith.me/" target="_top">Isabel Smith</a>
      </footer>
    </main>
  );
}
