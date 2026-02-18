
class PlantLogTable {
    constructor(config) {
        this.containerId = config.containerId;
        this.data = config.data || [];
        this.itemsPerPage = config.itemsPerPage || 10;
        this.currentPage = 1;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.filterText = '';
        this.activeFilters = {};
        this.onRender = config.onRender; // Callback for custom row rendering if needed

        this.init();
    }

    init() {
        this.renderControls();
        this.render();
    }

    setData(data) {
        this.data = data;
        this.currentPage = 1;
        this.render();
    }

    setFilter(key, value) {
        if (value === null || value === undefined || value === '') {
            delete this.activeFilters[key];
        } else {
            this.activeFilters[key] = value;
        }
        this.currentPage = 1;
        this.render();
    }

    setSearch(text) {
        this.filterText = text.toLowerCase();
        this.currentPage = 1;
        this.render();
    }

    sort(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
        this.render();
    }

    getProcessedData() {
        let processed = [...this.data];

        // 1. Filter by text (search)
        if (this.filterText) {
            processed = processed.filter(item => {
                return Object.values(item).some(val =>
                    String(val).toLowerCase().includes(this.filterText)
                );
            });
        }

        // 2. Filter by specific criteria (exact match for simplicity, can be extended)
        Object.entries(this.activeFilters).forEach(([key, value]) => {
            processed = processed.filter(item => item[key] == value);
        });

        // 3. Sort
        if (this.sortColumn) {
            processed.sort((a, b) => {
                let valA = a[this.sortColumn];
                let valB = b[this.sortColumn];

                // Check for dates
                if (this.sortColumn === 'date') {
                    // Assuming DD/MM/YYYY
                    const [d1, m1, y1] = valA.split('/').map(Number);
                    const [d2, m2, y2] = valB.split('/').map(Number);
                    valA = new Date(y1, m1 - 1, d1).getTime();
                    valB = new Date(y2, m2 - 1, d2).getTime();
                }
                // Check for numbers
                else if (!isNaN(parseFloat(valA)) && isFinite(valA)) {
                    valA = parseFloat(valA);
                    valB = parseFloat(valB);
                } else {
                    valA = String(valA).toLowerCase();
                    valB = String(valB).toLowerCase();
                }

                if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return processed;
    }

    getPaginatedData(data) {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return data.slice(start, end);
    }

    renderControls() {
        // Placeholder for external controls if we wanted to inject them
        // For now, we assume controls are in the HTML and bound to this instance
    }

    renderHeader(columns) {
        return columns.map(col => {
            if (!col.sortable) return `<th class="${col.class} font-13px fw-bold color-label text-upper ls-widest">${col.label}</th>`;

            const icon = this.sortColumn === col.key
                ? (this.sortDirection === 'asc' ? 'ph-caret-up' : 'ph-caret-down')
                : 'ph-caret-up-down'; 

            const activeClass = this.sortColumn === col.key ? 'color-blue' : 'color-label';

            return `
                <th class="${col.class} font-13px fw-bold color-label text-upper ls-widest cursor-pointer hover:bg-white/5 transition-colors select-none" onclick="plantLogTable.sort('${col.key}')">
                    <div class="flex items-center gap-1 justify-between">
                        <span>${col.label}</span>
                        <i class="ph-fill ${icon} ${activeClass} font-12px"></i>
                    </div>
                </th>
            `;
        }).join('');
    }

    goToPage(page) {
        if (page < 1) return;
        this.currentPage = page;
        this.render();
    }

    createRow(item) {
        const statusClass = item.statusColor === 'green'
            ? 'color-green bg-gnfc-green/10 border-gnfc-green/20'
            : 'color-orange bg-gnfc-orange/10 border-gnfc-orange/20';

        return `
            <tr class="border-b border-dark-border group transition-all duration-150 hover:bg-white/5" style="border-left: 3px solid transparent;">
                <td class="p-2.5 text-center typo-mono font-12px border-r border-dark-border color-label">${item.sr}</td>
                <td class="p-2.5 fw-bold font-13px border-r border-dark-border color-primary">${item.area}</td>
                <td class="p-2.5 border-r border-dark-border">
                    <div class="font-13px color-blue fw-bold">${item.tag}</div>
                    <span class="inline-block mt-1 font-11px px-1.5 py-0.5 rounded-sm typo-mono color-label bg-dark-bg border border-dark-border">${item.tagSubtitle}</span>
                </td>
                <td class="p-2.5 border-r border-dark-border">
                    <div class="fw-medium font-13px color-primary">${item.jobType}</div>
                    <div class="font-11px mt-0.5 color-label">${item.jobRef}</div>
                    ${item.jobLabel ? `<span class="inline-block mt-1 px-1.5 py-0.5 rounded-sm font-11px fw-bold bg-gnfc-blue/10 color-blue border border-dark-border">${item.jobLabel}</span>` : ''}
                </td>
                <td class="p-2.5 text-center fw-bold border-r border-dark-border color-label font-13px">${item.tech}</td>
                <td class="p-2.5 border-r border-dark-border leading-relaxed font-13px color-secondary">${item.desc}</td>
                <td class="p-2.5 text-center border-r border-dark-border">
                    <div class="fw-bold font-13px color-primary">${item.engineer}</div>
                    <div class="font-11px color-label">${item.engInitials}</div>
                </td>
                <td class="p-2.5 text-center border-r border-dark-border">
                    ${item.status ? `
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm font-11px fw-bold border ${statusClass}">
                        ${item.status}
                    </span>` : ''}
                </td>
                <td class="p-2.5 font-13px color-label">${item.remarks}</td>
            </tr>
        `;
    }

    getUniqueValues(key) {
        return [...new Set(this.data.map(item => item[key]).filter(val => val !== null && val !== undefined && val !== ''))].sort();
    }

    render() {
        const tbody = document.querySelector(`${this.containerId} tbody`);
        const paginationSel = `${this.containerId}-pagination`;

        if (!tbody) return;

        const processedData = this.getProcessedData();
        const paginatedData = this.getPaginatedData(processedData);

        tbody.innerHTML = '';

        if (paginatedData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" class="px-6 py-16 text-center italic border-b" style="color: var(--app-muted); border-color: var(--app-border);">
                <i class="ph ph-clipboard-text font-30px block mb-2 opacity-30"></i>
                No entries found for this view.
            </td></tr>`;
        } else {
            paginatedData.forEach(item => {
                if (this.onRender) {
                    tbody.innerHTML += this.onRender(item);
                } else {
                    tbody.innerHTML += this.createRow(item);
                }
            });
        }

        // Render Pagination using GNFCPagination if available
        if (typeof GNFCPagination !== 'undefined') {
            if (!this._pagination) {
                this._pagination = new GNFCPagination({
                    containerId: paginationSel,
                    totalItems: processedData.length,
                    itemsPerPage: this.itemsPerPage,
                    currentPage: this.currentPage,
                    onPageChange: (page) => {
                        this.currentPage = page;
                        this.render();
                    }
                });
            }
            this._pagination.update({
                totalItems: processedData.length,
                currentPage: this.currentPage
            });
        }

        // Update Count if element exists
        const countEl = document.getElementById('record-count');
        if (countEl) {
            countEl.textContent = `${processedData.length} Records`;
        }
    }
}
