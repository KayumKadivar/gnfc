import { getFrequencyLabel } from "./constants.js";

const TOAST_ROOT_ID = "sy-pm-toast-root";

function getToastRoot() {
  let root = document.getElementById(TOAST_ROOT_ID);
  if (root) return root;

  root = document.createElement("div");
  root.id = TOAST_ROOT_ID;
  root.className = "sy-toast-root";
  document.body.appendChild(root);
  return root;
}

export function showToast(message, tone = "info") {
  const text = String(message || "").trim();
  if (!text) return;

  const root = getToastRoot();
  const toast = document.createElement("div");
  toast.className = `sy-toast sy-toast-${tone}`;
  toast.textContent = text;
  root.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("sy-toast-hide");
    setTimeout(() => toast.remove(), 220);
  }, 2200);
}

export function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function openModal(target) {
  const modal = typeof target === "string" ? document.getElementById(target) : target;
  if (!modal) return;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

export function closeModal(target) {
  const modal = typeof target === "string" ? document.getElementById(target) : target;
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

export function bindModalDismiss(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal || modal.dataset.bound === "true") return;

  modal.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.closeModal === "true" || target === modal) {
      closeModal(modal);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!modal.classList.contains("is-open")) return;
    closeModal(modal);
  });

  modal.dataset.bound = "true";
}

export function confirmAction(message) {
  return window.confirm(String(message || "Are you sure?"));
}

export function renderEmptyState(title, description, actionLabel = "") {
  const safeTitle = escapeHtml(title || "No data available");
  const safeDescription = escapeHtml(description || "Please create a record to continue.");
  const safeAction = escapeHtml(actionLabel || "");

  return `
    <div class="sy-empty-state">
      <h3>${safeTitle}</h3>
      <p>${safeDescription}</p>
      ${safeAction ? `<span class="sy-empty-hint">${safeAction}</span>` : ""}
    </div>
  `;
}

export function formatDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("en-GB");
}

export function formatDateTime(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export function buildContextHeading(context) {
  return `${context.systemCode} - ${getFrequencyLabel(context.frequencyCode)}`;
}

export function printBlankFormat(payload) {
  const title = String(payload?.title || "SY_PM Blank Format");
  const contextLabel = String(payload?.contextLabel || "");
  const instruction = String(payload?.instruction || "");
  const rows = Array.isArray(payload?.rows) ? payload.rows : [];

  const contentRows = rows.map((row, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(row.item)}</td>
        <td>${escapeHtml(row.action)}</td>
        <td>${escapeHtml(row.referenceValue)}</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
    `).join("");

  const popup = window.open("", "_blank", "noopener,noreferrer,width=1080,height=760");
  if (!popup) {
    showToast("Unable to open print window. Check popup settings.", "error");
    return;
  }

  popup.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>${escapeHtml(title)}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
        h1 { font-size: 20px; margin: 0; }
        .meta { margin-top: 4px; color: #4b5563; font-size: 12px; }
        .instruction { margin-top: 14px; font-size: 12px; padding: 10px; border: 1px solid #d1d5db; }
        table { border-collapse: collapse; width: 100%; margin-top: 16px; }
        th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 12px; vertical-align: top; }
        th { background: #f3f4f6; text-align: left; }
        td:nth-child(1) { width: 44px; text-align: center; }
        td:nth-child(5), td:nth-child(6) { min-height: 24px; }
        @media print { body { margin: 0.4in; } }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(title)}</h1>
      <div class="meta">${escapeHtml(contextLabel)}</div>
      <div class="meta">Generated: ${escapeHtml(formatDateTime(new Date()))}</div>
      <div class="instruction"><strong>Instruction:</strong> ${escapeHtml(instruction)}</div>
      <table>
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
        <tbody>
          ${contentRows}
        </tbody>
      </table>
    </body>
    </html>
  `);

  popup.document.close();
  popup.focus();
  popup.print();
}
