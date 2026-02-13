import {
  SY_PM_NOTICES,
  SY_PM_ROUTES,
  SY_PM_SYSTEMS,
  buildRouteWithContext,
  getFrequencyLabel
} from "./constants.js";
import {
  createReport,
  deleteReport,
  getBlankFormat,
  getContextFromUrl,
  getInstruction,
  listReports,
  listStaticRows,
  updateReport
} from "./store.js";
import {
  bindModalDismiss,
  buildContextHeading,
  closeModal,
  confirmAction,
  formatDate,
  formatDateTime,
  openModal,
  printBlankFormat,
  renderEmptyState,
  showToast
} from "./ui.js";

const state = {
  context: null,
  staticRows: [],
  instruction: null,
  reports: [],
  activeReportId: ""
};

function getValidContextOrRedirect() {
  const fromUrl = getContextFromUrl(window.location.search);
  if (fromUrl.hasValidSystem && fromUrl.hasValidFrequency) {
    return {
      plantCode: fromUrl.plantCode,
      systemCode: fromUrl.systemCode,
      frequencyCode: fromUrl.frequencyCode
    };
  }

  const fallbackContext = {
    plantCode: fromUrl.plantCode,
    systemCode: fromUrl.hasValidSystem ? fromUrl.systemCode : SY_PM_SYSTEMS[0].code,
    frequencyCode: fromUrl.hasValidFrequency ? fromUrl.frequencyCode : "daily",
    notice: SY_PM_NOTICES.missingContext
  };

  window.location.replace(buildRouteWithContext(SY_PM_ROUTES.selection, fallbackContext));
  return null;
}

function getActiveReport() {
  return state.reports.find((report) => report.id === state.activeReportId) || null;
}

function renderHeader() {
  if (typeof window.renderHeader === "function") {
    window.renderHeader({
      title: "SY_PM Report Workspace",
      breadcrumbs: [
        { label: "Technician Log", href: "/src/pages/technician_logbook.html" },
        {
          label: "System Performance",
          href: buildRouteWithContext(SY_PM_ROUTES.selection, state.context)
        },
        { label: "Report" }
      ],
      backLink: buildRouteWithContext(SY_PM_ROUTES.selection, state.context)
    });
  }
}

function renderContext() {
  const heading = document.getElementById("report-context-heading");
  const chipSystem = document.getElementById("report-chip-system");
  const chipFrequency = document.getElementById("report-chip-frequency");
  const reportCount = document.getElementById("report-count");
  const staticCount = document.getElementById("report-static-count");

  if (heading) heading.textContent = buildContextHeading(state.context);
  if (chipSystem) chipSystem.textContent = state.context.systemCode;
  if (chipFrequency) chipFrequency.textContent = getFrequencyLabel(state.context.frequencyCode);
  if (reportCount) reportCount.textContent = `${state.reports.length} reports`;
  if (staticCount) staticCount.textContent = `${state.staticRows.length} static rows`;

  const generateButton = document.getElementById("btn-generate-report");
  if (generateButton) {
    generateButton.disabled = state.staticRows.length === 0;
    generateButton.title = state.staticRows.length === 0
      ? "Add static data first"
      : "Generate a new report instance";
  }
}

function renderReportList() {
  const list = document.getElementById("report-list");
  if (!list) return;

  list.innerHTML = "";

  if (!state.reports.length) {
    list.innerHTML = renderEmptyState(
      "No reports generated",
      "Generate a report after static data is available.",
      "Use Generate Report"
    );
    return;
  }

  state.reports.forEach((report) => {
    const item = document.createElement("button");
    const isActive = report.id === state.activeReportId;
    item.type = "button";
    item.className = `sy-list-item ${isActive ? "is-active" : ""}`;
    item.dataset.reportId = report.id;
    item.innerHTML = `
      <span class="sy-list-title">${formatDate(report.reportDate)}</span>
      <span class="sy-list-subtitle">Updated ${formatDateTime(report.updatedAt)}</span>
    `;
    list.appendChild(item);
  });
}

function renderEditor() {
  const wrapper = document.getElementById("report-editor-container");
  const editorMeta = document.getElementById("report-editor-meta");

  if (!wrapper) return;

  const activeReport = getActiveReport();
  if (!activeReport) {
    wrapper.innerHTML = renderEmptyState(
      "No report selected",
      "Generate a report or pick one from the list to edit.",
      "Report editor will appear here"
    );
    if (editorMeta) editorMeta.textContent = "-";
    return;
  }

  if (editorMeta) {
    editorMeta.textContent = `Report Date: ${formatDate(activeReport.reportDate)} | Updated: ${formatDateTime(activeReport.updatedAt)}`;
  }

  const bodyRows = activeReport.rows.map((row, index) => `
      <tr data-static-row-id="${row.staticRowId}">
        <td class="sy-col-index">${index + 1}</td>
        <td>${row.item}</td>
        <td>${row.action || "-"}</td>
        <td>${row.referenceValue || "-"}</td>
        <td>
          <textarea class="sy-input sy-input-area" data-field="observation" placeholder="Observation">${row.observation || ""}</textarea>
        </td>
        <td>
          <textarea class="sy-input sy-input-area" data-field="remark" placeholder="Remark">${row.remark || ""}</textarea>
        </td>
      </tr>
    `).join("");

  wrapper.innerHTML = `
    <div class="sy-table-shell">
      <table class="sy-table">
        <thead>
          <tr>
            <th>Sr</th>
            <th>Item</th>
            <th>Action</th>
            <th>Reference</th>
            <th>Observation</th>
            <th>Remark</th>
          </tr>
        </thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </div>
  `;
}

function collectEditedRows() {
  const wrapper = document.getElementById("report-editor-container");
  if (!wrapper) return [];

  const rows = [];
  wrapper.querySelectorAll("tbody tr").forEach((tr) => {
    const staticRowId = tr.getAttribute("data-static-row-id") || "";
    const observation = String((tr.querySelector('[data-field="observation"]')?.value || "")).trim();
    const remark = String((tr.querySelector('[data-field="remark"]')?.value || "")).trim();

    rows.push({ staticRowId, observation, remark });
  });

  return rows;
}

function reloadData() {
  state.staticRows = listStaticRows(state.context);
  state.instruction = getInstruction(state.context);
  state.reports = listReports(state.context);

  if (!state.reports.find((report) => report.id === state.activeReportId)) {
    state.activeReportId = state.reports[0]?.id || "";
  }

  renderContext();
  renderReportList();
  renderEditor();
}

function handleGenerate() {
  if (!state.staticRows.length) {
    showToast("Static data is required before report generation.", "error");
    return;
  }

  try {
    const newReport = createReport(state.context, { createdBy: "Demo User" });
    state.activeReportId = newReport.id;
    reloadData();
    showToast("New report generated.", "info");
  } catch (error) {
    showToast(error.message || "Unable to generate report.", "error");
  }
}

function handleSave() {
  const activeReport = getActiveReport();
  if (!activeReport) {
    showToast("Select a report first.", "warn");
    return;
  }

  const rows = collectEditedRows();
  if (!rows.length) {
    showToast("No rows to save.", "warn");
    return;
  }

  const invalidRow = rows.find((row) => !row.observation);
  if (invalidRow) {
    showToast("Observation is required for all rows before save.", "error");
    return;
  }

  try {
    updateReport(state.context, activeReport.id, rows);
    reloadData();
    showToast("Report updated successfully.", "info");
  } catch (error) {
    showToast(error.message || "Unable to update report.", "error");
  }
}

function handleDelete() {
  const activeReport = getActiveReport();
  if (!activeReport) {
    showToast("No report selected.", "warn");
    return;
  }

  if (!confirmAction("Delete selected report?")) {
    return;
  }

  try {
    deleteReport(state.context, activeReport.id);
    state.activeReportId = "";
    reloadData();
    showToast("Report deleted.", "warn");
  } catch (error) {
    showToast(error.message || "Unable to delete report.", "error");
  }
}

function handleBlankFormatPrint() {
  if (!state.staticRows.length) {
    showToast("No static rows available for blank format.", "warn");
    return;
  }

  const rows = getBlankFormat(state.context);
  printBlankFormat({
    title: "SY_PM Blank Format",
    contextLabel: buildContextHeading(state.context),
    rows,
    instruction: state.instruction?.text || ""
  });
}

function openInstructionModal() {
  const text = document.getElementById("report-instruction-text");
  const stamp = document.getElementById("report-instruction-updated");

  if (text) text.textContent = state.instruction?.text || "No instruction available.";
  if (stamp) stamp.textContent = `Updated: ${formatDateTime(state.instruction?.updatedAt || new Date())}`;

  openModal("report-instruction-modal");
}

function bindEvents() {
  const generateBtn = document.getElementById("btn-generate-report");
  const saveBtn = document.getElementById("btn-save-report");
  const deleteBtn = document.getElementById("btn-delete-report");
  const instructionBtn = document.getElementById("btn-view-instruction");
  const blankBtn = document.getElementById("btn-blank-format");
  const gotoStaticBtn = document.getElementById("btn-go-static");
  const reportList = document.getElementById("report-list");

  if (generateBtn) generateBtn.addEventListener("click", handleGenerate);
  if (saveBtn) saveBtn.addEventListener("click", handleSave);
  if (deleteBtn) deleteBtn.addEventListener("click", handleDelete);
  if (instructionBtn) instructionBtn.addEventListener("click", openInstructionModal);
  if (blankBtn) blankBtn.addEventListener("click", handleBlankFormatPrint);

  if (gotoStaticBtn) {
    gotoStaticBtn.addEventListener("click", () => {
      window.location.href = buildRouteWithContext(SY_PM_ROUTES.staticData, state.context);
    });
  }

  if (reportList) {
    reportList.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const button = target.closest("button[data-report-id]");
      if (!(button instanceof HTMLButtonElement)) return;

      state.activeReportId = button.dataset.reportId || "";
      renderReportList();
      renderEditor();
    });
  }

  bindModalDismiss("report-instruction-modal");
}

function bootstrap() {
  const context = getValidContextOrRedirect();
  if (!context) return;

  state.context = context;

  renderHeader();
  reloadData();
  bindEvents();
}

document.addEventListener("DOMContentLoaded", bootstrap);
