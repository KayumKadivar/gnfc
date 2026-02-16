import {
  SY_PM_NOTICES,
  SY_PM_ROUTES,
  SY_PM_SYSTEMS,
  buildRouteWithContext,
  getFrequencyLabel
} from "./constants.js";
import {
  createStaticRow,
  deleteStaticRow,
  getContextFromUrl,
  getInstruction,
  listStaticRows,
  updateInstruction,
  updateStaticRow
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

  let baseClasses = "pointer-events-auto min-w-[300px] max-w-md px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 font-medium text-sm border backdrop-blur-md";

  if (tone === "error") {
    baseClasses += " bg-rose-950/90 text-rose-100 border-rose-800 shadow-rose-900/20";
  } else if (tone === "warn") {
    baseClasses += " bg-amber-950/90 text-amber-100 border-amber-800 shadow-amber-900/20";
  } else if (tone === "success") {
    baseClasses += " bg-emerald-950/90 text-emerald-100 border-emerald-800 shadow-emerald-900/20";
  } else {
    baseClasses += " bg-dark-panel/95 text-white border-dark-border shadow-black/50";
  }

  toast.className = baseClasses + " translate-y-4 opacity-0";

  let icon = "";
  if (tone === "error") icon = '<i class="ph-bold ph-warning-circle text-lg shrink-0"></i>';
  else if (tone === "warn") icon = '<i class="ph-bold ph-warning text-lg shrink-0"></i>';
  else if (tone === "success") icon = '<i class="ph-bold ph-check-circle text-lg shrink-0"></i>';
  else icon = '<i class="ph-bold ph-info text-lg shrink-0 text-gnfc-orange"></i>';

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
      <div class="w-16 h-16 rounded-full bg-dark-panel border border-dark-border flex items-center justify-center mb-4 text-dark-muted">
        <i class="ph-duotone ph-folder-open text-3xl"></i>
      </div>
      <h3 class="text-white font-bold text-lg mb-1">${safeTitle}</h3>
      <p class="text-dark-muted text-sm max-w-[280px] leading-relaxed">${safeDescription}</p>
      ${safeAction ? `<span class="inline-block mt-5 px-3 py-1.5 rounded-full bg-gnfc-orange/10 text-gnfc-orange text-[10px] font-bold uppercase tracking-wider border border-gnfc-orange/20 animate-pulse">${safeAction}</span>` : ""}
    </div>
  `;
}

// --- End Utilities ---

const state = {
  context: null,
  rows: [],
  instruction: null,
  editMode: "create"
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

function renderHeader() {
  if (typeof window.renderHeader === "function") {
    window.renderHeader({
      title: "SY_PM Static Data",
      breadcrumbs: [
        { label: "Technician Log", href: "/src/pages/technician_logbook.html" },
        {
          label: "System Performance",
          href: buildRouteWithContext(SY_PM_ROUTES.selection, state.context)
        },
        { label: "Static Data" }
      ],
      backLink: buildRouteWithContext(SY_PM_ROUTES.selection, state.context)
    });
  }
}

function renderContext() {
  const heading = document.getElementById("sy-context-heading");
  const chipSystem = document.getElementById("sy-chip-system");
  const chipFrequency = document.getElementById("sy-chip-frequency");

  if (heading) heading.textContent = buildContextHeading(state.context);
  if (chipSystem) chipSystem.textContent = state.context.systemCode;
  if (chipFrequency) chipFrequency.textContent = getFrequencyLabel(state.context.frequencyCode);
}

function renderInstruction() {
  const instructionText = document.getElementById("instruction-preview");
  const instructionStamp = document.getElementById("instruction-updated-at");

  if (instructionText) {
    instructionText.textContent = state.instruction?.text || "No instruction found.";
  }

  if (instructionStamp) {
    instructionStamp.textContent = `Updated: ${formatDateTime(state.instruction?.updatedAt || new Date())}`;
  }
}

function renderRows() {
  const tbody = document.getElementById("static-table-body");
  const empty = document.getElementById("static-empty");
  const count = document.getElementById("static-record-count");

  if (!tbody) return;

  tbody.innerHTML = "";
  state.rows = listStaticRows(state.context);

  if (count) {
    count.textContent = `${state.rows.length} records`;
  }

  if (!state.rows.length) {
    if (empty) {
      empty.innerHTML = renderEmptyState(
        "No static records",
        "Add static rows before generating or filling reports.",
        "Add Row"
      );
      empty.classList.remove("hidden");
    }
    return;
  }

  if (empty) {
    empty.classList.add("hidden");
  }

  state.rows.forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-dark-header/50 transition-colors group";
    tr.innerHTML = `
      <td class="px-4 py-3 text-center font-mono  text-[10px] border-r border-dark-border/10">${index + 1}</td>
      <td class="px-4 py-3 font-medium text-dark-text text-[13px]">${row.item}</td>
      <td class="px-4 py-3  text-xs leading-relaxed">${row.action || "-"}</td>
      <td class="px-4 py-3 text-dark-text font-mono text-[11px] bg-dark-bg/30">${row.referenceValue || "-"}</td>
      <td class="px-4 py-3 text-center space-x-2 flex ">
        <button class="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold rounded-md  hover:text-white hover:bg-dark-header border border-transparent hover:border-dark-border transition-all active:scale-95" data-action="edit" data-id="${row.id}">
          <i class="ph-bold ph-pencil-simple text-sm"></i>
        </button>
        <button class="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold rounded-md bg-rose-900/20 text-rose-400 border border-rose-900/30 hover:bg-rose-900/40 hover:text-rose-200 transition-all active:scale-95" data-action="delete" data-id="${row.id}">
          <i class="ph-bold ph-trash text-sm"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openRowModal(mode, row = null) {
  state.editMode = mode;
  const title = document.getElementById("static-row-modal-title");
  const idInput = document.getElementById("static-row-id");
  const itemInput = document.getElementById("static-item");
  const actionInput = document.getElementById("static-action");
  const referenceInput = document.getElementById("static-reference");

  if (title) title.textContent = mode === "edit" ? "Edit Static Record" : "Add Static Record";
  if (idInput) idInput.value = row?.id || "";
  if (itemInput) itemInput.value = row?.item || "";
  if (actionInput) actionInput.value = row?.action || "";
  if (referenceInput) referenceInput.value = row?.referenceValue || "";

  openModal("static-row-modal");
}

function openInstructionModal() {
  const textArea = document.getElementById("instruction-input");
  if (textArea) {
    textArea.value = state.instruction?.text || "";
  }
  openModal("instruction-modal");
}

function handleRowSubmit(event) {
  event.preventDefault();

  const id = String(document.getElementById("static-row-id")?.value || "").trim();
  const item = String(document.getElementById("static-item")?.value || "").trim();
  const action = String(document.getElementById("static-action")?.value || "").trim();
  const referenceValue = String(document.getElementById("static-reference")?.value || "").trim();

  if (!item) {
    showToast("Item is mandatory.", "error");
    return;
  }

  try {
    if (state.editMode === "edit" && id) {
      updateStaticRow(state.context, id, { item, action, referenceValue });
      showToast("Static record updated.", "info");
    } else {
      createStaticRow(state.context, { item, action, referenceValue });
      showToast("Static record added.", "success");
    }

    closeModal("static-row-modal");
    renderRows();
  } catch (error) {
    showToast(error.message || "Unable to save record.", "error");
  }
}

function handleInstructionSave(event) {
  event.preventDefault();

  const nextText = String(document.getElementById("instruction-input")?.value || "").trim();
  if (!nextText) {
    showToast("Instruction text is required.", "error");
    return;
  }

  try {
    state.instruction = updateInstruction(state.context, nextText);
    renderInstruction();
    closeModal("instruction-modal");
    showToast("Instruction updated.", "success");
  } catch (error) {
    showToast(error.message || "Unable to update instruction.", "error");
  }
}

function handleTableActions(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const button = target.closest("button[data-action]");
  if (!(button instanceof HTMLButtonElement)) return;

  const action = button.dataset.action;
  const rowId = button.dataset.id;
  if (!rowId) return;

  const row = state.rows.find((entry) => entry.id === rowId);
  if (!row) return;

  if (action === "edit") {
    openRowModal("edit", row);
    return;
  }

  if (action === "delete") {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      width: 300,
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
          deleteStaticRow(state.context, rowId);
          renderRows();
          Swal.fire({
            title: "Deleted!",
            text: "Your record has been deleted.",
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
          showToast(error.message || "Unable to delete static record.", "error");
        }
      }
    });
  }
}

function bindEvents() {
  const addBtn = document.getElementById("btn-add-record");
  const editInstructionBtn = document.getElementById("btn-edit-instruction");
  const gotoReportBtn = document.getElementById("btn-go-report");
  const rowForm = document.getElementById("static-row-form");
  const instructionForm = document.getElementById("instruction-form");
  const tableBody = document.getElementById("static-table-body");

  if (addBtn) addBtn.addEventListener("click", () => openRowModal("create"));
  if (editInstructionBtn) editInstructionBtn.addEventListener("click", openInstructionModal);

  if (gotoReportBtn) {
    gotoReportBtn.addEventListener("click", () => {
      window.location.href = buildRouteWithContext(SY_PM_ROUTES.reports, state.context);
    });
  }

  if (rowForm) rowForm.addEventListener("submit", handleRowSubmit);
  if (instructionForm) instructionForm.addEventListener("submit", handleInstructionSave);
  if (tableBody) tableBody.addEventListener("click", handleTableActions);

  bindModalDismiss("static-row-modal");
  bindModalDismiss("instruction-modal");
}

function bootstrap() {
  const context = getValidContextOrRedirect();
  if (!context) return;

  state.context = context;
  state.instruction = getInstruction(state.context);

  renderHeader();
  renderContext();
  renderRows();
  renderInstruction();
  bindEvents();
}

document.addEventListener("DOMContentLoaded", bootstrap);
