
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
            if (!col.sortable) return `<th class="${col.class}">${col.label}</th>`;
            
            const icon = this.sortColumn === col.key
                ? (this.sortDirection === 'asc' ? 'ph-caret-up' : 'ph-caret-down')
                : 'ph-caret-up-down'; // distinct 'inactive' state could be just ph-caret-up-down opacity-50
            
            const activeClass = this.sortColumn === col.key ? 'text-grafana-blue' : 'text-slate-500 dark:text-dark-muted';

            return `
                <th class="${col.class} cursor-pointer hover:bg-white/5 transition-colors select-none" onclick="plantLogTable.sort('${col.key}')">
                    <div class="flex items-center gap-1 justify-between">
                        <span>${col.label}</span>
                        <i class="ph-fill ${icon} ${activeClass}"></i>
                    </div>
                </th>
            `;
        }).join('');
    }

    renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        // Prevent rendering if no pages
        if (totalPages <= 1) return '';

        let html = '<div class="flex items-center justify-end gap-2 mt-4 select-none">';
        
        // Prev
        html += `
            <button 
                class="px-3 py-1 text-xs font-bold rounded-sm border border-slate-200 dark:border-dark-border ${this.currentPage === 1 ? 'opacity-50 cursor-not-allowed text-slate-400 dark:text-gray-600' : 'hover:bg-slate-100 dark:hover:bg-dark-border text-slate-600 dark:text-gray-300'}"
                onclick="plantLogTable.goToPage(${this.currentPage - 1})"
                ${this.currentPage === 1 ? 'disabled' : ''}
            >Prev</button>
        `;

        // Page Numbers
        for (let i = 1; i <= totalPages; i++) {
            // Simple logic: show all. For many pages, you'd want ellipsis logic.
            const activeClass = i === this.currentPage 
                ? 'bg-blue-600 dark:bg-grafana-blue text-white border-blue-600 dark:border-gnfc-blue' 
                : 'border-slate-200 dark:border-dark-border hover:bg-slate-100 dark:hover:bg-dark-border text-slate-600 dark:text-gray-300';
            
            html += `
                <button 
                    class="px-3 py-1 text-xs font-bold rounded-sm border ${activeClass}"
                    onclick="plantLogTable.goToPage(${i})"
                >${i}</button>
            `;
        }

        // Next
        html += `
            <button 
                class="px-3 py-1 text-xs font-bold rounded-sm border border-slate-200 dark:border-dark-border ${this.currentPage === totalPages ? 'opacity-50 cursor-not-allowed text-slate-400 dark:text-gray-600' : 'hover:bg-slate-100 dark:hover:bg-dark-border text-slate-600 dark:text-gray-300'}"
                onclick="plantLogTable.goToPage(${this.currentPage + 1})"
                ${this.currentPage === totalPages ? 'disabled' : ''}
            >Next</button>
        `;

        html += '</div>';
        return html;
    }

    goToPage(page) {
        if (page < 1) return;
        this.currentPage = page;
        this.render();
    }

    createRow(item) {
         const statusClass = item.statusColor === 'green'
          ? 'text-grafana-green bg-grafana-green/10 border-grafana-green/20'
          : 'text-grafana-orange bg-grafana-orange/10 border-grafana-orange/20';

        return `
            <tr class="hover:bg-white/5 transition-colors border-b border-dark-border group">
                <td class="p-2 text-center text-slate-500 dark:text-dark-muted font-mono border-r border-dark-border">${item.sr}</td>
                <td class="p-2 font-bold text-slate-700 dark:text-white border-r border-dark-border">${item.area}</td>
                <td class="p-2 border-r border-dark-border">
                    <div class="text-xs text-blue-600 dark:text-grafana-blue font-bold">${item.tag}</div>
                    <span class="inline-block mt-1 text-[10px] text-slate-500 dark:text-dark-muted bg-slate-100  px-1.5 py-0.5 rounded border border-dark-border font-mono">${item.tagSubtitle}</span>
                </td>
                <td class="p-2 border-r border-dark-border">
                    <div class="font-medium text-slate-600 dark:text-gray-300 line-clamp-1">${item.jobType}</div>
                    <div class="text-[10px] text-slate-400 dark:text-dark-muted mt-0.5">${item.jobRef}</div>
                    ${item.jobLabel ? `<span class="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-grafana-blue/10 !text-blue-600 dark:text-grafana-blue border border-dark-border">${item.jobLabel}</span>` : ''}
                </td>
                <td class="p-2 text-center font-bold text-slate-500 dark:text-dark-muted border-r border-dark-border">${item.tech}</td>
                <td class="p-2 text-slate-500 dark:text-gray-400 border-r border-dark-border leading-relaxed">${item.desc}</td>
                <td class="p-2 text-center border-r border-dark-border">
                    <div class="font-bold text-slate-600 dark:text-gray-300">${item.engineer}</div>
                    <div class="text-[10px] text-slate-400 dark:text-dark-muted">${item.engInitials}</div>
                </td>
                <td class="p-2 text-center border-r border-dark-border">
                    ${item.status ? `
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold border ${statusClass}">
                        ${item.status}
                    </span>` : ''}
                </td>
                <td class="p-2 text-slate-600 dark:text-gray-400">${item.remarks}</td>
            </tr>
        `;
    }

    getUniqueValues(key) {
        return [...new Set(this.data.map(item => item[key]).filter(val => val !== null && val !== undefined && val !== ''))].sort();
    }

    render() {
        const tbody = document.querySelector(`${this.containerId} tbody`);
        const paginationContainer = document.querySelector(`${this.containerId}-pagination`);
        
        if (!tbody) return;

        const processedData = this.getProcessedData();
        const paginatedData = this.getPaginatedData(processedData);

        tbody.innerHTML = '';

        if (paginatedData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="px-6 py-12 text-center text-slate-400 dark:text-dark-muted italic border-b border-slate-200 dark:border-dark-border">No entries found for this view.</td></tr>`;
        } else {
            paginatedData.forEach(item => {
                if (this.onRender) {
                    tbody.innerHTML += this.onRender(item);
                } else {
                    tbody.innerHTML += this.createRow(item);
                }
            });
        }

        // Render Pagination
        if (paginationContainer) {
            paginationContainer.innerHTML = this.renderPagination(processedData.length);
        }
        
        // Update Count if element exists
        const countEl = document.getElementById('record-count');
        if (countEl) {
             countEl.textContent = `${processedData.length} Records`;
        }
    }
}
