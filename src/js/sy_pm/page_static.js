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
import {
  bindModalDismiss,
  buildContextHeading,
  closeModal,
  confirmAction,
  formatDateTime,
  openModal,
  renderEmptyState,
  showToast
} from "./ui.js";

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
        "Use the Add Row action"
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
    tr.innerHTML = `
      <td class="sy-col-index">${index + 1}</td>
      <td>${row.item}</td>
      <td>${row.action || "-"}</td>
      <td>${row.referenceValue || "-"}</td>
      <td class="sy-col-actions">
        <button class="sy-btn sy-btn-ghost" data-action="edit" data-id="${row.id}">Edit</button>
        <button class="sy-btn sy-btn-danger" data-action="delete" data-id="${row.id}">Delete</button>
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
      showToast("Static record added.", "info");
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
    showToast("Instruction updated.", "info");
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
    if (!confirmAction("Delete this static record?")) return;

    try {
      deleteStaticRow(state.context, rowId);
      renderRows();
      showToast("Static record deleted.", "warn");
    } catch (error) {
      showToast(error.message || "Unable to delete static record.", "error");
    }
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
