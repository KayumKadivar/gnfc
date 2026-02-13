import {
  SY_PM_FREQUENCIES,
  SY_PM_NOTICES,
  SY_PM_ROUTES,
  SY_PM_SYSTEMS,
  buildRouteWithContext,
  getFrequencyLabel,
  getSystemMeta,
  normalizeFrequency
} from "./constants.js";
import { getContextFromUrl } from "./store.js";
import { showToast } from "./ui.js";

const state = {
  context: null,
  selectedFrequency: "daily"
};

function setActiveFrequency(frequencyCode) {
  state.selectedFrequency = normalizeFrequency(frequencyCode) || "daily";

  document.querySelectorAll("[data-frequency]").forEach((button) => {
    const code = button.getAttribute("data-frequency");
    const isActive = code === state.selectedFrequency;
    button.classList.toggle("is-active", isActive);
  });
}

function updateContextUi() {
  const systemMeta = getSystemMeta(state.context.systemCode);
  const systemTitle = document.getElementById("sy-system-title");
  const systemSubtitle = document.getElementById("sy-system-subtitle");
  const selectedFrequency = document.getElementById("sy-selected-frequency");

  if (systemTitle) {
    systemTitle.textContent = state.context.systemCode;
  }

  if (systemSubtitle) {
    systemSubtitle.textContent = `${systemMeta?.shortCode || "System"} control performance workflow`;
  }

  if (selectedFrequency) {
    selectedFrequency.textContent = getFrequencyLabel(state.selectedFrequency);
  }

  if (typeof window.renderHeader === "function") {
    window.renderHeader({
      title: "System Performance Monitoring",
      breadcrumbs: [
        { label: "Technician Log", href: "/src/pages/technician_logbook.html" },
        { label: "Plant Detail", href: `/src/pages/plant_detail.html?plant=${encodeURIComponent(state.context.plantCode)}` },
        { label: state.context.systemCode }
      ],
      backLink: `/src/pages/plant_detail.html?plant=${encodeURIComponent(state.context.plantCode)}`
    });
  }
}

function navigateTo(route) {
  const nextContext = {
    ...state.context,
    frequencyCode: state.selectedFrequency
  };
  window.location.href = buildRouteWithContext(route, nextContext);
}

function bindEvents() {
  document.querySelectorAll("[data-frequency]").forEach((button) => {
    button.addEventListener("click", () => {
      const frequencyCode = button.getAttribute("data-frequency") || "daily";
      setActiveFrequency(frequencyCode);
      const selectedFrequency = document.getElementById("sy-selected-frequency");
      if (selectedFrequency) {
        selectedFrequency.textContent = getFrequencyLabel(state.selectedFrequency);
      }
    });
  });

  const staticButton = document.getElementById("sy-action-static");
  const reportButton = document.getElementById("sy-action-report");

  if (staticButton) {
    staticButton.addEventListener("click", () => navigateTo(SY_PM_ROUTES.staticData));
  }

  if (reportButton) {
    reportButton.addEventListener("click", () => navigateTo(SY_PM_ROUTES.reports));
  }
}

function bootstrap() {
  const urlContext = getContextFromUrl(window.location.search);
  const fallbackSystem = SY_PM_SYSTEMS[0].code;
  const systemCode = urlContext.hasValidSystem ? urlContext.systemCode : fallbackSystem;

  state.context = {
    plantCode: urlContext.plantCode,
    systemCode,
    frequencyCode: urlContext.hasValidFrequency ? urlContext.frequencyCode : "daily"
  };

  state.selectedFrequency = state.context.frequencyCode;

  const notice = new URLSearchParams(window.location.search).get("notice") || "";
  if (notice === SY_PM_NOTICES.missingContext) {
    showToast("System or frequency was missing. Please select again.", "warn");
  }

  if (!urlContext.hasValidSystem) {
    showToast("Invalid system in URL. Default system loaded.", "warn");
  }

  updateContextUi();
  setActiveFrequency(state.selectedFrequency);
  bindEvents();
}

document.addEventListener("DOMContentLoaded", bootstrap);
