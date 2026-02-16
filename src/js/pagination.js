/**
 * GNFCPagination — Reusable, theme-aware pagination component
 * 
 * Usage:
 *   const pager = new GNFCPagination({
 *     containerId: '#my-pagination',   // selector for the container
 *     totalItems: 100,
 *     itemsPerPage: 10,
 *     currentPage: 1,
 *     onPageChange: (page) => { ... }  // callback when page changes
 *   });
 *   pager.render();
 *   pager.update({ totalItems: 50, currentPage: 1 }); // update and re-render
 */
class GNFCPagination {
    constructor(config = {}) {
        this.containerId = config.containerId || '#pagination';
        this.totalItems = config.totalItems || 0;
        this.itemsPerPage = config.itemsPerPage || 10;
        this.currentPage = config.currentPage || 1;
        this.onPageChange = config.onPageChange || null;
        this.maxVisiblePages = config.maxVisiblePages || 5;
        this._instanceId = 'gnfc_pg_' + Math.random().toString(36).slice(2, 8);
        // Store instance on window for onclick access
        window[this._instanceId] = this;
    }

    get totalPages() {
        return Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
    }

    goToPage(page) {
        if (page < 1 || page > this.totalPages || page === this.currentPage) return;
        this.currentPage = page;
        this.render();
        if (this.onPageChange) this.onPageChange(page);
    }

    update(opts = {}) {
        if (opts.totalItems !== undefined) this.totalItems = opts.totalItems;
        if (opts.currentPage !== undefined) this.currentPage = opts.currentPage;
        if (opts.itemsPerPage !== undefined) this.itemsPerPage = opts.itemsPerPage;
        // Clamp current page
        if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
        if (this.currentPage < 1) this.currentPage = 1;
        this.render();
    }

    _getVisiblePages() {
        const total = this.totalPages;
        const current = this.currentPage;
        const max = this.maxVisiblePages;

        if (total <= max) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        const pages = [];
        let start = Math.max(1, current - Math.floor(max / 2));
        let end = start + max - 1;

        if (end > total) {
            end = total;
            start = Math.max(1, end - max + 1);
        }

        if (start > 1) {
            pages.push(1);
            if (start > 2) pages.push('...');
        }

        for (let i = start; i <= end; i++) {
            if (!pages.includes(i)) pages.push(i);
        }

        if (end < total) {
            if (end < total - 1) pages.push('...');
            pages.push(total);
        }

        return pages;
    }

    render() {
        const container = document.querySelector(this.containerId);
        if (!container) return;

        if (this.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        const pages = this._getVisiblePages();
        const id = this._instanceId;

        let html = `<div class="gnfc-pagination">`;

        // Info text
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
        html += `<span class="pg-info">${startItem}–${endItem} of ${this.totalItems}</span>`;

        html += `<div class="pg-controls">`;

        // Prev button
        html += `<button class="pg-btn pg-nav ${this.currentPage === 1 ? 'pg-disabled' : ''}" 
      onclick="${id}.goToPage(${this.currentPage - 1})" 
      ${this.currentPage === 1 ? 'disabled' : ''} 
      aria-label="Previous page">
      <i class="ph-bold ph-caret-left"></i>
    </button>`;

        // Page numbers
        pages.forEach(p => {
            if (p === '...') {
                html += `<span class="pg-ellipsis">…</span>`;
            } else {
                const isActive = p === this.currentPage;
                html += `<button class="pg-btn pg-num ${isActive ? 'pg-active' : ''}" 
          onclick="${id}.goToPage(${p})"
          ${isActive ? 'aria-current="page"' : ''}>${p}</button>`;
            }
        });

        // Next button
        html += `<button class="pg-btn pg-nav ${this.currentPage === this.totalPages ? 'pg-disabled' : ''}" 
      onclick="${id}.goToPage(${this.currentPage + 1})" 
      ${this.currentPage === this.totalPages ? 'disabled' : ''} 
      aria-label="Next page">
      <i class="ph-bold ph-caret-right"></i>
    </button>`;

        html += `</div></div>`;
        container.innerHTML = html;
    }
}

/* ===== Inject Pagination Styles (once) ===== */
(function injectPaginationStyles() {
    if (document.getElementById('gnfc-pagination-styles')) return;
    const style = document.createElement('style');
    style.id = 'gnfc-pagination-styles';
    style.textContent = `
    .gnfc-pagination {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      gap: 12px;
      flex-wrap: wrap;
    }
    .pg-info {
      font-size: 11px;
      font-weight: 600;
      color: var(--app-muted, #a3a3a3);
      font-variant-numeric: tabular-nums;
    }
    .pg-controls {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .pg-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      height: 32px;
      padding: 0 8px;
      font-size: 12px;
      font-weight: 700;
      border-radius: 8px;
      border: 1px solid var(--app-border, #2c3235);
      background: transparent;
      color: var(--app-muted, #a3a3a3);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
    }
    .pg-btn:hover:not(.pg-disabled):not(.pg-active) {
      border-color: rgba(87,148,242,0.4);
      color: var(--app-text, #fff);
      background: rgba(87,148,242,0.06);
    }
    .pg-btn.pg-active {
      background: linear-gradient(135deg, #5794F2, #14b8a6);
      color: #ffffff;
      border-color: transparent;
      box-shadow: 0 2px 8px rgba(87,148,242,0.3);
    }
    .pg-btn.pg-disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
    .pg-nav {
      padding: 0 6px;
    }
    .pg-nav i {
      font-size: 14px;
    }
    .pg-ellipsis {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 28px;
      height: 32px;
      font-size: 14px;
      color: var(--app-muted, #a3a3a3);
      user-select: none;
    }

    /* Light theme overrides */
    html[data-theme-mode="light"] .pg-btn {
      border-color: #d6deea;
      color: #4b5563;
    }
    html[data-theme-mode="light"] .pg-btn:hover:not(.pg-disabled):not(.pg-active) {
      border-color: #94a3b8;
      color: #111827;
      background: rgba(59,130,246,0.05);
    }
    html[data-theme-mode="light"] .pg-btn.pg-active {
      background: linear-gradient(135deg, #3b82f6, #0d9488);
      color: #ffffff;
      border-color: transparent;
      box-shadow: 0 2px 8px rgba(59,130,246,0.25);
    }
    html[data-theme-mode="light"] .pg-info {
      color: #6b7280;
    }
    html[data-theme-mode="light"] .pg-ellipsis {
      color: #9ca3af;
    }
  `;
    document.head.appendChild(style);
})();

/* ===== Auto Table Pagination (opt-out) ===== */
(function initAutoTablePagination(global) {
    if (!global || typeof document === "undefined") return;

    const AUTO_SKIP_ATTR = "data-no-gnfc-pagination";
    const tablePagerRegistry = new Map();
    let autoContainerCounter = 0;

    function nextAutoContainerId() {
        autoContainerCounter += 1;
        return `gnfc-auto-pagination-${autoContainerCounter}`;
    }

    function shouldSkipTable(table) {
        if (!table || !table.tBodies || !table.tBodies.length) return true;
        if (table.hasAttribute(AUTO_SKIP_ATTR)) return true;
        if (table.closest(`[${AUTO_SKIP_ATTR}]`)) return true;
        if (table.classList.contains("datatable-table")) return true;
        if (table.closest(".datatable-wrapper")) return true;
        if (global.simpleDatatables) return true;
        if (table.id === "plant-table") return true;
        if (table.id && document.getElementById(`${table.id}-pagination`)) return true;
        return false;
    }

    function resolveContainer(table) {
        const explicit = table.getAttribute("data-pagination-container");
        if (explicit) {
            const explicitContainer = document.querySelector(explicit);
            if (explicitContainer) return explicitContainer;
        }

        if (table.id) {
            const existingById = document.getElementById(`${table.id}-pagination`);
            if (existingById) return existingById;
        }

        const singleTableOnPage = document.querySelectorAll("table").length === 1;
        const legacyContainer = document.getElementById("pagination");
        if (singleTableOnPage && legacyContainer && !legacyContainer.dataset.gnfcAutoPagination) {
            legacyContainer.dataset.gnfcAutoPagination = "true";
            return legacyContainer;
        }

        const host = table.closest(".overflow-x-auto") || table.parentElement || table;
        const container = document.createElement("div");
        container.id = nextAutoContainerId();
        container.dataset.gnfcAutoPagination = "true";
        container.className = "px-1 pt-2";
        host.insertAdjacentElement("afterend", container);
        return container;
    }

    function getItemsPerPage(table) {
        const value = Number(table.getAttribute("data-page-size") || 0);
        if (Number.isFinite(value) && value > 0) return Math.floor(value);
        return 10;
    }

    class GNFCAutoTablePager {
        constructor(table) {
            this.table = table;
            this.tbody = table.tBodies[0];
            this.rows = [];
            this.itemsPerPage = getItemsPerPage(table);
            this.currentPage = 1;
            this.container = resolveContainer(table);

            this.pager = new GNFCPagination({
                containerId: `#${this.container.id}`,
                totalItems: 0,
                itemsPerPage: this.itemsPerPage,
                currentPage: this.currentPage,
                onPageChange: (page) => {
                    this.currentPage = page;
                    this.applyPage();
                }
            });

            this.observer = new MutationObserver((mutations) => {
                if (!mutations.some((mutation) => mutation.type === "childList")) return;
                this.refresh(true);
            });
            this.observer.observe(this.tbody, { childList: true });
            this.refresh(true);
        }

        readRows() {
            return Array.from(this.tbody.children).filter((node) => node.tagName === "TR");
        }

        applyPage() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            this.rows.forEach((row, index) => {
                row.style.display = index >= start && index < end ? "" : "none";
            });
        }

        refresh(resetPage) {
            this.itemsPerPage = getItemsPerPage(this.table);
            this.rows = this.readRows();

            if (resetPage) this.currentPage = 1;
            const totalPages = Math.max(1, Math.ceil(this.rows.length / this.itemsPerPage));
            if (this.currentPage > totalPages) this.currentPage = totalPages;
            if (this.currentPage < 1) this.currentPage = 1;

            this.applyPage();
            this.pager.update({
                totalItems: this.rows.length,
                itemsPerPage: this.itemsPerPage,
                currentPage: this.currentPage
            });
        }
    }

    function init(root) {
        const scope = root || document;
        const tables = Array.from(scope.querySelectorAll("table"));

        tables.forEach((table) => {
            if (tablePagerRegistry.has(table)) return;
            if (shouldSkipTable(table)) return;
            const pager = new GNFCAutoTablePager(table);
            tablePagerRegistry.set(table, pager);
        });
    }

    function refreshAll() {
        tablePagerRegistry.forEach((pager) => pager.refresh(false));
    }

    global.GNFCAutoTablePagination = {
        init,
        refresh: refreshAll
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => init(document));
    } else {
        init(document);
    }
})(window);
