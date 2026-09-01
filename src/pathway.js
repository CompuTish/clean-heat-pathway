export const stages = [
  {
    id: "survey",
    number: 1,
    name: "Survey",
    short: "Home assessment",
    title: "The survey pack is ready",
    description: "Room-by-room heat-loss figures, emitter notes and site photographs are present and internally consistent.",
    evidence: ["Room-by-room heat-loss survey", "Emitter and flow-temperature notes", "Site photographs"],
    primaryLabel: "Confirm survey evidence",
    primaryFeedback: "Survey evidence confirmed. The design can move to its planning checks.",
  },
  {
    id: "planning",
    number: 2,
    name: "Planning",
    short: "Design and eligibility",
    title: "The planning evidence is complete",
    description: "For this fictional English home, the design pack includes the relevant MCS 020 noise assessment and records the intended planning route.",
    evidence: ["Proposed equipment and location", "MCS 020 noise assessment", "Planning route recorded"],
    primaryLabel: "Confirm planning evidence",
    primaryFeedback: "Planning evidence confirmed. The grid connection route is next.",
  },
  {
    id: "grid",
    number: 3,
    name: "Grid",
    short: "Connection and service",
    title: "Service rating evidence is missing",
    description: "The job cannot confirm the connection route until the incoming electrical service evidence has been checked.",
    evidence: ["Heat-pump model identified", "Connection application drafted", "Incoming service evidence"],
    missing: "Incoming service evidence",
    resolveLabel: "Request evidence",
    resolveFeedback: "Evidence requested and received. The service information is now recorded in the job pack.",
    escalateLabel: "Escalate",
    escalateFeedback: "The uncertainty was escalated and resolved before submission. The service information is now recorded.",
    overrideLabel: "Continue anyway",
    blockedFeedback: "The job stays at Grid: submitting without the missing service evidence could create delay or rework.",
    continueLabel: "Continue to parts",
  },
  {
    id: "parts",
    number: 4,
    name: "Parts",
    short: "Order and delivery",
    title: "One delivered item does not match",
    description: "The cylinder reference on the merchant confirmation differs from the approved design schedule.",
    evidence: ["Heat-pump unit confirmed", "Ancillaries confirmed", "Cylinder matches design"],
    missing: "Cylinder matches design",
    resolveLabel: "Hold and correct order",
    resolveFeedback: "The mismatch was caught before dispatch. The merchant confirmed the correct cylinder reference.",
    escalateLabel: "Escalate to planner",
    escalateFeedback: "The planner and supplier resolved the mismatch before the installation date.",
    overrideLabel: "Accept delivery",
    blockedFeedback: "The job stays at Parts: accepting a known mismatch risks an installation-day failure.",
    continueLabel: "Continue to install",
  },
  {
    id: "install",
    number: 5,
    name: "Install",
    short: "Readiness and delivery",
    title: "The job is ready for installation",
    description: "The evidence is complete, the connection route is recorded, and the correct equipment is confirmed for delivery.",
    evidence: ["Compliance blockers cleared", "Parts confirmed", "Installer pack issued"],
    primaryLabel: "Release to install",
    primaryFeedback: "Installation released with a complete and current job pack.",
  },
  {
    id: "handover",
    number: 6,
    name: "Handover",
    short: "Completion and sign-off",
    title: "The MCS certificate is not yet filed",
    description: "Commissioning is complete, but the handover pack should not be closed until the certificate is recorded for the customer.",
    evidence: ["Commissioning checklist", "Warranty information", "MCS certificate"],
    missing: "MCS certificate",
    resolveLabel: "Chase certificate",
    resolveFeedback: "The certificate was generated and added to the customer handover pack.",
    escalateLabel: "Escalate to compliance",
    escalateFeedback: "Compliance resolved the missing certificate and updated the handover pack.",
    overrideLabel: "Close anyway",
    blockedFeedback: "The pathway stays open: the customer handover pack is not yet complete.",
    continueLabel: "Complete handover",
  },
];

export function createInitialPathway() {
  return {
    currentIndex: 0,
    completed: [],
    resolved: {},
    blockersCaught: 0,
    overridesPrevented: 0,
    feedback: "Review the evidence at each stage and choose the next operational action.",
    feedbackKind: "info",
  };
}

function advance(state, stage, feedback) {
  return {
    ...state,
    currentIndex: state.currentIndex + 1,
    completed: [...state.completed, stage.id],
    feedback,
    feedbackKind: "success",
  };
}

export function transitionPathway(state, action) {
  const stage = stages[state.currentIndex];
  if (!stage) return state;

  if (!stage.missing && action === "primary") {
    return advance(state, stage, stage.primaryFeedback);
  }

  if (stage.missing && ["resolve", "escalate"].includes(action) && !state.resolved[stage.id]) {
    return {
      ...state,
      resolved: { ...state.resolved, [stage.id]: true },
      blockersCaught: state.blockersCaught + 1,
      feedback: action === "resolve" ? stage.resolveFeedback : stage.escalateFeedback,
      feedbackKind: "success",
    };
  }

  if (stage.missing && action === "override" && !state.resolved[stage.id]) {
    return {
      ...state,
      overridesPrevented: state.overridesPrevented + 1,
      feedback: stage.blockedFeedback,
      feedbackKind: "warning",
    };
  }

  if (stage.missing && action === "continue" && state.resolved[stage.id]) {
    return advance(state, stage, `${stage.name} cleared. The pathway can move on.`);
  }

  return state;
}
