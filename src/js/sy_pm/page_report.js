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

// --- UI Utilities Inlined ---

const TOAST_ROOT_ID = "sy-pm-toast-root";

function getToastRoot() {
  let root = document.getElementById(TOAST_ROOT_ID);
  if (root) return root;

  root = document.createElement("div");
  root.id = TOAST_ROOT_ID;
  root.className = "fixed bottom-0 right-0 p-6 flex flex-col items-end gap-2 pointer-events-none z-[9999]";
  document.body.appendChild(root);
  return root;
}

function showToast(message, tone = "info") {
  const text = String(message || "").trim();
  if (!text) return;

  const root = getToastRoot();
  const toast = document.createElement("div");

  let baseClasses = "pointer-events-auto min-w-[300px] max-w-md px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 fw-medium font-14px border backdrop-blur-md";

  if (tone === "error") {
    baseClasses += " bg-rose-950/90 text-rose-100 border-rose-800 shadow-rose-900/20";
  } else if (tone === "warn") {
    baseClasses += " bg-amber-950/90 text-amber-100 border-amber-800 shadow-amber-900/20";
  } else if (tone === "success") {
    baseClasses += " bg-emerald-950/90 text-emerald-100 border-emerald-800 shadow-emerald-900/20";
  } else {
    baseClasses += " bg-dark-panel/95 color-primary border-dark-border shadow-black/50";
  }

  toast.className = baseClasses + " translate-y-4 opacity-0";

  let icon = "";
  if (tone === "error") icon = '<i class="ph-bold ph-warning-circle font-18px shrink-0"></i>';
  else if (tone === "warn") icon = '<i class="ph-bold ph-warning font-18px shrink-0"></i>';
  else if (tone === "success") icon = '<i class="ph-bold ph-check-circle font-18px shrink-0"></i>';
  else icon = '<i class="ph-bold ph-info font-18px shrink-0 color-orange"></i>';

  toast.innerHTML = `${icon}<span>${text}</span>`;
  root.appendChild(toast);

  requestAnimationFrame(() => {
    toast.className = baseClasses;
  });

  setTimeout(() => {
    toast.className = baseClasses + " translate-y-2 opacity-0 pointer-events-none";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function openModal(target) {
  const modal = typeof target === "string" ? document.getElementById(target) : target;
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.classList.remove("pointer-events-none");
  requestAnimationFrame(() => {
    modal.classList.add("opacity-100");
  });
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(target) {
  const modal = typeof target === "string" ? document.getElementById(target) : target;
  if (!modal) return;
  modal.classList.remove("opacity-100");
  modal.classList.add("pointer-events-none");
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function bindModalDismiss(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  if (modal._dismissBound) return;

  modal.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (target === modal) {
      closeModal(modal);
      return;
    }

    const closeTrigger = target.closest('[data-close-modal="true"]');
    if (closeTrigger) {
      closeModal(modal);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (modal.classList.contains("hidden")) return;
    closeModal(modal);
  });

  modal._dismissBound = true;
  modal.dataset.bound = "true";
}

// function confirmAction(message) {
//   return window.confirm(String(message || "Are you sure?"));
// }

function formatDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("en-GB");
}

function formatDateTime(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function buildContextHeading(context) {
  return `${context.systemCode} - ${getFrequencyLabel(context.frequencyCode)}`;
}

function renderEmptyState(title, description, actionLabel = "") {
  const safeTitle = escapeHtml(title || "No data available");
  const safeDescription = escapeHtml(description || "Please create a record to continue.");
  const safeAction = escapeHtml(actionLabel || "");

  return `
    <div class="flex flex-col items-center justify-center p-12 text-center rounded-xl border-2 border-dashed border-dark-border/50 bg-dark-bg/30">
      <div class="w-16 h-16 rounded-full bg-dark-panel border border-dark-border flex items-center justify-center mb-4 color-label">
        <i class="ph-duotone ph-folder-open text-3xl"></i>
      </div>
      <h3 class="color-primary fw-bold font-18px mb-1">${safeTitle}</h3>
      <p class="color-label font-14px max-w-[280px] leading-relaxed">${safeDescription}</p>
      ${safeAction ? `<span class="inline-block mt-5 px-3 py-1.5 rounded-full bg-gnfc-orange/10 color-orange font-10px fw-bold text-upper ls-wider border border-gnfc-orange/20 animate-pulse">${safeAction}</span>` : ""}
    </div>
  `;
}

// --- End Utilities ---

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
    generateButton.classList.toggle("opacity-50", state.staticRows.length === 0);
    generateButton.classList.toggle("cursor-not-allowed", state.staticRows.length === 0);
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
      "Generate Report"
    );
    return;
  }

  state.reports.forEach((report) => {
    const item = document.createElement("button");
    const isActive = report.id === state.activeReportId;
    item.type = "button";

    let baseClasses = "w-full text-left p-3 rounded-lg border transition-all mb-2 flex flex-col gap-1 group relative overflow-hidden";
    if (isActive) {
      baseClasses += " border-gnfc-orange ring-1 ring-gnfc-orange/50 bg-dark-header shadow-lg shadow-gnfc-orange/5";
    } else {
      baseClasses += " border-dark-border bg-dark-panel hover:bg-dark-header hover:border-dark-muted";
    }

    item.className = baseClasses;
    item.dataset.reportId = report.id;
    item.innerHTML = `
      <div class="flex justify-between items-center w-full">
        <span class="font-14px fw-bold ${isActive ? 'color-primary' : 'color-primary group-hover:color-white'}">${formatDate(report.reportDate)}</span>
        ${isActive ? '<i class="ph-bold ph-check-circle color-orange font-12px"></i>' : ''}
      </div>
      <span class="font-10px color-label typo-mono text-upper ls-wide">Updated ${formatDateTime(report.updatedAt)}</span>
      ${isActive ? '<div class="absolute inset-y-0 left-0 w-1 bg-gnfc-orange"></div>' : ''}
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

  const checked1Input = document.getElementById("report-checked-1");
  const checked2Input = document.getElementById("report-checked-2");

  if (activeReport) {
    if (editorMeta) {
      editorMeta.textContent = `Report Date: ${formatDate(activeReport.reportDate)} | Updated: ${formatDateTime(activeReport.updatedAt)}`;
    }
    if (checked1Input) checked1Input.value = activeReport.checkedBy1 || "PBS";
    if (checked2Input) checked2Input.value = activeReport.checkedBy2 || "PNV";
  } else {
    if (editorMeta) editorMeta.textContent = "-";
    if (checked1Input) checked1Input.value = "";
    if (checked2Input) checked2Input.value = "";
  }

  const bodyRows = activeReport.rows.map((row, index) => `
      <tr data-static-row-id="${row.staticRowId}" class="hover:bg-dark-header/30 transition-colors group">
        <td class="px-3 py-2 text-center typo-mono color-label font-10px border-r border-dark-border/10 w-10">${index + 1}</td>
        <td class="px-3 py-2 fw-medium color-primary font-12px border-r border-dark-border/10">${row.item}</td>
        <td class="px-3 py-2 color-label font-12px leading-relaxed border-r border-dark-border/10">${row.action || "-"}</td>
        <td class="px-3 py-2 color-primary typo-mono font-10px bg-dark-bg/20 border-r border-dark-border/10">${row.referenceValue || "-"}</td>
        <td class="p-2 border-r border-dark-border/10">
          <textarea class="w-full bg-dark-bg border border-dark-border rounded px-2 py-1.5 font-12px color-primary focus:border-gnfc-orange focus:ring-1 focus:ring-gnfc-orange/50 outline-none transition-all placeholder:text-dark-muted resize-y min-h-[60px]" data-field="observation" placeholder="Observation">${row.observation || ""}</textarea>
        </td>
        <td class="p-2">
          <textarea class="w-full bg-dark-bg border border-dark-border rounded px-2 py-1.5 font-12px color-primary focus:border-gnfc-orange focus:ring-1 focus:ring-gnfc-orange/50 outline-none transition-all placeholder:text-dark-muted resize-y min-h-[60px]" data-field="remark" placeholder="Remark">${row.remark || ""}</textarea>
        </td>
      </tr>
    `).join("");

  wrapper.innerHTML = `
    <div class="rounded-lg border border-dark-border overflow-hidden bg-dark-panel">
      <table class="w-full text-left font-12px border-collapse">
        <thead>
          <tr>
            <th class="px-3 py-2 bg-dark-header color-label fw-bold border-b border-dark-border text-center">Sr</th>
            <th class="px-3 py-2 bg-dark-header color-label fw-bold border-b border-dark-border w-1/4">Item</th>
            <th class="px-3 py-2 bg-dark-header color-label fw-bold border-b border-dark-border w-1/5">Action</th>
            <th class="px-3 py-2 bg-dark-header color-label fw-bold border-b border-dark-border">Reference Value</th>
            <th class="px-3 py-2 bg-dark-header color-label fw-bold border-b border-dark-border w-1/5">Observation</th>
            <th class="px-3 py-2 bg-dark-header color-label fw-bold border-b border-dark-border w-1/6">Remark</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-dark-border/30">${bodyRows}</tbody>
      </table>
    </div>
  `;
}

function collectEditedRequest() {
  const wrapper = document.getElementById("report-editor-container");
  if (!wrapper) return { rows: [], checkedBy1: "", checkedBy2: "" };

  const rows = [];
  wrapper.querySelectorAll("tbody tr").forEach((tr) => {
    const staticRowId = tr.getAttribute("data-static-row-id") || "";
    const observation = String((tr.querySelector('[data-field="observation"]')?.value || "")).trim();
    const remark = String((tr.querySelector('[data-field="remark"]')?.value || "")).trim();

    rows.push({ staticRowId, observation, remark });
  });

  const checkedBy1 = document.getElementById("report-checked-1")?.value || "";
  const checkedBy2 = document.getElementById("report-checked-2")?.value || "";

  // Return augmented array for payload compatibility
  rows.checkedBy1 = checkedBy1;
  rows.checkedBy2 = checkedBy2;
  return rows;
}

function reloadData() {
  state.staticRows = listStaticRows(state.context);
  state.instruction = getInstruction(state.context);
  state.reports = listReports(state.context);

  if (state.activeReportId && !state.reports.find((report) => report.id === state.activeReportId)) {
    state.activeReportId = "";
  }

  renderContext();
  renderReportList();
  renderEditor();
}

function handleGenerate() {
  if (!state.staticRows.length) {
    showToast("Static data is required.", "error");
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

  const rows = collectEditedRequest();
  if (!rows.length) {
    showToast("No rows to save.", "warn");
    return;
  }

  const invalidRow = rows.find((row) => !row.observation);
  if (invalidRow) {
    showToast("Observation is required for all rows.", "error");
    return;
  }

  try {
    updateReport(state.context, activeReport.id, rows);
    reloadData();
    showToast("Report updated successfully.", "success");
  } catch (error) {
    showToast(error.message || "Unable to update report.", "error");
  }
}

function handleCancel() {
  if (!state.activeReportId) return;

  Swal.fire({
    title: "Discard changes?",
    text: "Are you sure you want to discard changes and close the editor?",
    icon: "warning",
    width: 400,
    padding: "1em",
    customClass: {
      title: "text-lg",
      htmlContainer: "text-sm",
      popup: "text-xs"
    },
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, discard changes!"
  }).then((result) => {
    if (result.isConfirmed) {
      state.activeReportId = "";
      renderReportList();
      renderEditor();
    }
  });
}

function handleDelete() {
  const activeReport = getActiveReport();
  if (!activeReport) {
    showToast("No report selected.", "warn");
    return;
  }

  Swal.fire({
    title: "Are you sure?",
    text: "Do you want to delete this report?",
    icon: "warning",
    width: 400,
    padding: "1em",
    customClass: {
      title: "text-lg",
      htmlContainer: "text-sm",
      popup: "text-xs"
    },
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!"
  }).then((result) => {
    if (result.isConfirmed) {
      try {
        deleteReport(state.context, activeReport.id);
        state.activeReportId = "";
        reloadData();
        Swal.fire({
          title: "Deleted!",
          text: "The report has been deleted.",
          icon: "success",
          width: 400,
          padding: "1em",
          customClass: {
            title: "text-lg",
            htmlContainer: "text-sm",
            popup: "text-xs"
          }
        });
      } catch (error) {
        showToast(error.message || "Unable to delete report.", "error");
      }
    }
  });
}

function printBlankFormat(payload) {
  const modal = document.getElementById("print-preview-modal");
  const contentContainer = document.getElementById("print-preview-content");
  const printBtn = document.getElementById("btn-print-modal");

  if (!modal || !contentContainer) {
    showToast("Print modal not found.", "error");
    return;
  }

  const systemName = String(payload?.contextLabel || "SYSTEM PERFORMANCE MONITORING DATA").toUpperCase();
  const instruction = String(payload?.instruction || "");
  const rows = Array.isArray(payload?.rows) ? payload.rows : [];

  const contentRows = rows.map((row, index) => `
      <tr>
        <td style="text-align:center;">${index + 1}</td>
        <td>${escapeHtml(row.item)}</td>
        <td>${escapeHtml(row.action)}</td>
        <td></td> <!-- Observation is blank -->
        <td>${escapeHtml(row.referenceValue)}</td>
        <td></td> <!-- Remark is blank -->
      </tr>
    `).join("");

  contentContainer.innerHTML = `
      <div class="print-container font-serif text-black p-4 bg-white min-h-[1056px] shadow-sm max-w-[800px] mx-auto print:shadow-none print:m-0 print:p-0 print:w-full print:max-w-none">
        
        <div class="header mb-5 border-b-2 border-red-900 pb-1">
          <div class="title text-red-900 text-lg font-bold uppercase mb-2">SYSTEM PERFORMANCE MONITORING DATA</div>
        </div>
        
        <div class="sub-header flex justify-between font-bold text-blue-900 mb-4 text-sm">
          <span>${escapeHtml(systemName.split(' - ')[0] || "ACETIC ACID")}</span>
          <span>${escapeHtml(systemName.split(' - ')[1] || "DCS DAILY")}</span>
        </div>

        ${instruction ? `<div class="instruction-box bg-gray-100 p-2 border border-gray-300 text-xs mb-4 print:bg-transparent"><strong>Instructions:</strong> ${escapeHtml(instruction)}</div>` : ''}

        <table class="w-full border-collapse text-[11px]">
          <thead>
            <tr>
              <th class="border border-gray-400 p-1.5 bg-gray-200 font-bold text-left uppercase text-black text-center w-[30px] print:bg-gray-200">Sr</th>
              <th class="border border-gray-400 p-1.5 bg-gray-200 font-bold text-left uppercase text-black w-[25%] print:bg-gray-200">ITEM</th>
              <th class="border border-gray-400 p-1.5 bg-gray-200 font-bold text-left uppercase text-black w-[20%] print:bg-gray-200">ACTION</th>
              <th class="border border-gray-400 p-1.5 bg-gray-200 font-bold text-left uppercase text-black w-[20%] print:bg-gray-200">OBSERVATION</th>
              <th class="border border-gray-400 p-1.5 bg-gray-200 font-bold text-left uppercase text-black w-[15%] print:bg-gray-200">REFERENCE VALUE</th>
              <th class="border border-gray-400 p-1.5 bg-gray-200 font-bold text-left uppercase text-black w-[15%] print:bg-gray-200">REMARK</th>
            </tr>
          </thead>
          <tbody>
            ${contentRows}
          </tbody>
        </table>
      </div>
  `;

  if (printBtn) {
    printBtn.onclick = () => window.print();
  }

  openModal(modal);
}

function handleBlankFormatPrint() {
  if (!state.staticRows.length) {
    showToast("No static rows available.", "warn");
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
  const cancelBtn = document.getElementById("btn-cancel-report");
  const deleteBtn = document.getElementById("btn-delete-report");
  const instructionBtn = document.getElementById("btn-view-instruction");
  const blankBtn = document.getElementById("btn-blank-format");
  const gotoStaticBtn = document.getElementById("btn-go-static");
  const reportList = document.getElementById("report-list");

  if (generateBtn) generateBtn.addEventListener("click", handleGenerate);
  if (saveBtn) saveBtn.addEventListener("click", handleSave);
  if (cancelBtn) cancelBtn.addEventListener("click", handleCancel);
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
  bindModalDismiss("print-preview-modal");
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
