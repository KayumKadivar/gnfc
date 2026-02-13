/**
 * Shared UI utilities for SY PM pages.
 */

const TOAST_ROOT_ID = "sy-pm-toast-root";

function getToastRoot() {
    let root = document.getElementById(TOAST_ROOT_ID);
    if (root) return root;

    root = document.createElement("div");
    root.id = TOAST_ROOT_ID;
    root.className =
        "fixed bottom-0 right-0 p-6 flex flex-col items-end gap-2 pointer-events-none z-[9999]";
    document.body.appendChild(root);
    return root;
}

/**
 * Display a brief toast notification.
 * @param {string} message
 * @param {"info"|"warn"|"error"|"success"} tone
 */
export function showToast(message, tone = "info") {
    const text = String(message || "").trim();
    if (!text) return;

    const root = getToastRoot();
    const toast = document.createElement("div");

    let baseClasses =
        "pointer-events-auto min-w-[300px] max-w-md px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 font-medium text-sm border backdrop-blur-md";

    if (tone === "error") {
        baseClasses +=
            " bg-rose-950/90 text-rose-100 border-rose-800 shadow-rose-900/20";
    } else if (tone === "warn") {
        baseClasses +=
            " bg-amber-950/90 text-amber-100 border-amber-800 shadow-amber-900/20";
    } else if (tone === "success") {
        baseClasses +=
            " bg-emerald-950/90 text-emerald-100 border-emerald-800 shadow-emerald-900/20";
    } else {
        baseClasses +=
            " bg-dark-panel/95 text-white border-dark-border shadow-black/50";
    }

    toast.className = baseClasses + " translate-y-4 opacity-0";

    let icon = "";
    if (tone === "error")
        icon = '<i class="ph-bold ph-warning-circle text-lg shrink-0"></i>';
    else if (tone === "warn")
        icon = '<i class="ph-bold ph-warning text-lg shrink-0"></i>';
    else if (tone === "success")
        icon = '<i class="ph-bold ph-check-circle text-lg shrink-0"></i>';
    else
        icon =
            '<i class="ph-bold ph-info text-lg shrink-0 text-gnfc-orange"></i>';

    toast.innerHTML = `${icon}<span>${text}</span>`;
    root.appendChild(toast);

    requestAnimationFrame(() => {
        toast.className = baseClasses;
    });

    setTimeout(() => {
        toast.className =
            baseClasses + " translate-y-2 opacity-0 pointer-events-none";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
