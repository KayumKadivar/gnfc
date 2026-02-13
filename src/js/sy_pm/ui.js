import { getFrequencyLabel } from "./constants.js";

const TOAST_ROOT_ID = "sy-pm-toast-root";

function getToastRoot() {
  let root = document.getElementById(TOAST_ROOT_ID);
  if (root) return root;

  root = document.createElement("div");
  root.id = TOAST_ROOT_ID;
  // Container for toasts
  root.className = "fixed bottom-0 right-0 p-6 flex flex-col items-end gap-2 pointer-events-none z-[9999]";
  document.body.appendChild(root);
  return root;
}

export function showToast(message, tone = "info") {
  const text = String(message || "").trim();
  if (!text) return;

  const root = getToastRoot();
  const toast = document.createElement("div");
  
  // Base classes for toast
  let baseClasses = "pointer-events-auto min-w-[300px] max-w-md px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 font-medium text-sm border backdrop-blur-md";
  
  // Tone specific classes
  if (tone === "error") {
    baseClasses += " bg-rose-950/90 text-rose-100 border-rose-800 shadow-rose-900/20";
  } else if (tone === "warn") {
    baseClasses += " bg-amber-950/90 text-amber-100 border-amber-800 shadow-amber-900/20";
  } else if (tone === "success") {
    baseClasses += " bg-emerald-950/90 text-emerald-100 border-emerald-800 shadow-emerald-900/20";
  } else {
    // Info / Default
    baseClasses += " bg-dark-panel/95 text-white border-dark-border shadow-black/50";
  }

  toast.className = baseClasses + " translate-y-4 opacity-0"; // Initial state for animation
  
  // Icon based on tone
  let icon = "";
  if (tone === "error") icon = '<i class="ph-bold ph-warning-circle text-lg shrink-0"></i>';
  else if (tone === "warn") icon = '<i class="ph-bold ph-warning text-lg shrink-0"></i>';
  else if (tone === "success") icon = '<i class="ph-bold ph-check-circle text-lg shrink-0"></i>';
  else icon = '<i class="ph-bold ph-info text-lg shrink-0 text-gnfc-orange"></i>';

  toast.innerHTML = `${icon}<span>${text}</span>`;
  root.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.className = baseClasses;
  });

  setTimeout(() => {
    // Hide animation
    toast.className = baseClasses + " translate-y-2 opacity-0 pointer-events-none";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
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
  modal.classList.remove("hidden");
  // Small delay to allow display:block to apply before opacity transition if needed
  requestAnimationFrame(() => {
    modal.classList.add("opacity-100");
  });
  modal.setAttribute("aria-hidden", "false");
}

export function closeModal(target) {
  const modal = typeof target === "string" ? document.getElementById(target) : target;
  if (!modal) return;
  modal.classList.remove("opacity-100");
  modal.classList.add("hidden");
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
    if (modal.classList.contains("hidden")) return;
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
  // Keeping print styles simple and robust for printing
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
