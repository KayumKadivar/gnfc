
function renderPlantNav(activePageId) {
    const navContainer = document.getElementById('plant-nav-container');
    if (!navContainer) return;

    const currentUrl = new URL(window.location.href);
    const currentPlant = (currentUrl.searchParams.get('plant') || '').trim();

    const buildSyPmHref = (systemName) => {
        const params = new URLSearchParams();
        params.set('system', systemName);
        if (currentPlant) params.set('plant', currentPlant);
        return `#`;
        // return `/src/pages/Sy_PM.html?${params.toString()}`;
    };

    // ─── Configuration ───────────────────────────────────────────────
    const navGroups = [
        // Group 1 — Primary view
        {
            items: [
                { id: 'logs', label: 'Logs', icon: 'ph-list-dashes', href: '/src/pages/plant_detail.html' }
            ]
        },
        // Group 2 — Classification
        {
            items: [
                { id: 'job_types', label: 'Type Of Job', icon: 'ph-wrench', href: '/src/pages/job_types.html' },
                { id: 'instrument_types', label: 'Type Of Inst', icon: 'ph-cpu', href: '/src/pages/instrument_types.html' }
            ]
        },
        // Group 3 — Reports (collapsed into dropdown)
        {
            dropdown: true,
            id: 'reports_group',
            label: 'Reports',
            icon: 'ph-chart-bar',
            activeIds: ['remark_reports', 'tagwise_filter', 'monthly_report', 'datewise_report', 'namewise_report'],
            items: [
                { id: 'remark_reports', label: 'Remark Report', icon: 'ph-note', href: '/src/pages/remark_reports.html' },
                { id: 'tagwise_filter', label: 'TagWise Filter', icon: 'ph-funnel', href: '/src/pages/tagwise_filter.html' },
                { id: 'monthly_report', label: 'Monthly Report', icon: 'ph-calendar-blank', href: '/src/pages/monthly_report.html' },
                { id: 'datewise_report', label: 'Date Wise Report', icon: 'ph-calendar-dots', href: '/src/pages/datewise_report.html' },
                { id: 'namewise_report', label: 'Name Wise Report', icon: 'ph-user-list', href: '/src/pages/namewise_report.html' }
            ]
        },
        // Group 4 — Analysis
        {
            items: [
                { id: 'job_history', label: 'Job History', icon: 'ph-clock-counter-clockwise', href: '/src/pages/job_history.html' },
                { id: 'ot_hours', label: 'OT Hrs', icon: 'ph-timer', href: '/src/pages/ot_hours.html' },
                { id: 'pending_log', label: 'Pending Log', icon: 'ph-hourglass-medium', href: '/src/pages/pending_log.html' }
            ]
        },
        {
            items: [
                { id: 'modifications', label: 'Modifications', icon: 'ph-gear-fine', href: '/src/pages/modifications.html' },
                { id: 'doc_change', label: 'Doc. Change', icon: 'ph-file-doc', href: '/src/pages/doc_change.html' }
            ]
        },
        // Group 5 — System PM (dropdown with children)
        /* {
            dropdown: true,
            id: 'sy_pm',
            label: 'SY PM',
            icon: 'ph-gear-six',
            activeIds: ['sy_pm', 'sy_pm1'],
            items: [
                { id: 'foxboro_dcs', label: 'FOXBORO DCS', icon: 'ph-circuitry', href: buildSyPmHref('FOXBORO DCS') },
                { id: 'ybl_dcs', label: 'YBL DCS', icon: 'ph-circuitry', href: buildSyPmHref('YBL DCS') },
                { id: 'ghh_dcs', label: 'GHH DCS', icon: 'ph-circuitry', href: buildSyPmHref('GHH DCS') },
                { id: 'triconex_esd', label: 'TRICONEX ESD', icon: 'ph-shield-check', href: buildSyPmHref('TRICONEX ESD') },
                { id: 'hail_esd', label: 'HAIL ESD', icon: 'ph-shield-check', href: buildSyPmHref('HAIL ESD') }
            ]
        } */
    ];

    // ─── Style Tokens ────────────────────────────────────────────────
    const cls = {
        pill: 'relative flex items-center gap-1.5 px-2.5 py-1.5 font-15px font-semibold rounded-md transition-all duration-150 whitespace-nowrap select-none',
        active: 'bg-gnfc-blue text-white shadow-sm shadow-blue-500/25',
        inactive: 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06]',
        separator: 'w-px h-5 bg-gray-200 dark:bg-[#2c3235] mx-1 shrink-0',
        dropdownPanel: 'pn-dropdown-portal absolute z-[9999] w-52 bg-white dark:bg-[#1a1d21] border border-gray-200 dark:border-[#2c3235] rounded-lg shadow-2xl shadow-black/20 dark:shadow-black/50 py-1.5 opacity-0 scale-95 pointer-events-none transition-all duration-150 origin-top-left',
        dropdownPanelOpen: 'opacity-100 scale-100 pointer-events-auto',
        dropdownItem: 'flex items-center gap-2.5 px-3.5 py-2 text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-white/[0.06] hover:text-gnfc-blue dark:hover:text-gnfc-blue transition-colors rounded-md mx-1.5',
        dropdownItemActive: 'bg-blue-50/70 dark:bg-white/[0.04] text-gnfc-blue dark:text-gnfc-blue font-bold'
    };

    // ─── Helpers ──────────────────────────────────────────────────────
    const isItemActive = (item) => item.id === activePageId;
    const isGroupActive = (group) => {
        if (group.activeIds) return group.activeIds.includes(activePageId);
        return group.items.some(i => i.id === activePageId);
    };
    const isChildActive = (child) => {
        try {
            const childUrl = new URL(child.href, window.location.origin);
            if (childUrl.pathname !== currentUrl.pathname) return false;

            const childSystem = (childUrl.searchParams.get('system') || '').trim().toUpperCase();
            const currentSystem = (currentUrl.searchParams.get('system') || '').trim().toUpperCase();
            if (childSystem && currentSystem) {
                return childSystem === currentSystem;
            }

            return currentUrl.href.includes(child.href);
        } catch (error) {
            return currentUrl.href.includes(child.href);
        }
    };

    // ─── Build HTML ──────────────────────────────────────────────────
    const groupsHtml = navGroups.map((group, gi) => {
        let html = '';

        // Separator between groups (not before the first one)
        if (gi > 0) {
            html += `<div class="${cls.separator}"></div>`;
        }

        // ── Dropdown group ──
        if (group.dropdown) {
            const active = isGroupActive(group);
            const pillCls = `${cls.pill} ${active ? cls.active : cls.inactive} cursor-pointer`;
            const ddId = `pn-dd-${group.id}`;

            html += `
                <div class="relative" data-pn-dropdown>
                    <button type="button" class="${pillCls}" data-pn-trigger="${ddId}">
                        <i class="ph-bold ${group.icon} text-[12px] opacity-80"></i>
                        ${group.label}
                        <i class="ph-bold ph-caret-down text-[9px] opacity-60 ml-0.5 transition-transform duration-150" data-pn-caret></i>
                    </button>
                </div>
            `;
            return html;
        }

        // ── Regular items ──
        html += group.items.map(item => {
            const active = isItemActive(item);
            const pillCls = `${cls.pill} ${active ? cls.active : cls.inactive}`;
            return `
                <a href="${item.href}" class="${pillCls}">
                    <i class="ph-bold ${item.icon} text-[12px] opacity-80"></i>
                    ${item.label}
                </a>
            `;
        }).join('');

        return html;
    }).join('');

    // ─── Main Container ──────────────────────────────────────────────
    navContainer.innerHTML = `
        <div class="sticky top-0 z-30">
            <div class="bg-white dark:bg-[#111217] border-b border-gray-200 dark:border-[#2c3235] px-3 py-1.5 shadow-sm rounded-md">
                <div class="flex items-center justify-between gap-3">

                    <nav class="flex items-center gap-1 flex-1 min-w-0 overflow-hidden flex-wrap">
                        ${groupsHtml}
                    </nav>

                    <div class="shrink-0 pl-4 ml-2 border-l border-gray-200 dark:border-[#2c3235] flex items-center gap-2">
                        <button onclick="try{window.openOtModal('${currentPlant}')}catch(e){console.log('OT Modal missing')}"
                            class="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-md text-[11px] font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm">
                            <i class="ph-bold ph-clock-user"></i>
                            <span class="hidden sm:inline">O.T.</span>
                            <span class="sm:hidden">O.T.</span>
                        </button>
                        <button onclick="try{EmgCallModal.open()}catch(e){console.log('EMG Modal missing')}"
                            class="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-md text-[11px] font-bold hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm">
                            <i class="ph-bold ph-siren animate-pulse"></i>
                            <span class="hidden sm:inline">EMG Call</span>
                            <span class="sm:hidden">EMG</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    `;

    // ─── Portal Dropdowns (appended to body) ─────────────────────────
    // Remove old portals from previous renders
    document.querySelectorAll('.pn-dropdown-portal').forEach(el => el.remove());

    navGroups.filter(g => g.dropdown).forEach(group => {
        const ddId = `pn-dd-${group.id}`;

        const panel = document.createElement('div');
        panel.id = ddId;
        panel.className = cls.dropdownPanel;
        panel.innerHTML = (group.items || []).map(child => {
            const childActive = isChildActive(child) || (child.id && child.id === activePageId);
            return `
                <a href="${child.href}"
                   class="${cls.dropdownItem} ${childActive ? cls.dropdownItemActive : ''}">
                    <i class="ph-bold ${child.icon} text-[12px] opacity-70"></i>
                    ${child.label}
                </a>
            `;
        }).join('');

        document.body.appendChild(panel);
    });

    // ─── Dropdown Positioning & Toggle Logic ─────────────────────────
    const GAP = 6;

    const positionPortal = (panel, trigger) => {
        const tr = trigger.getBoundingClientRect();
        const pw = panel.offsetWidth;
        const ph = panel.offsetHeight;

        let left = tr.left;
        let top = tr.bottom + GAP;

        // Flip horizontally if overflow right
        if (left + pw > window.innerWidth - GAP) {
            left = tr.right - pw;
        }
        if (left < GAP) left = GAP;

        // Flip vertically if overflow bottom
        if (top + ph > window.innerHeight - GAP) {
            const above = tr.top - ph - GAP;
            if (above >= GAP) {
                top = above;
                panel.style.transformOrigin = 'bottom left';
            }
        }

        panel.style.left = `${Math.round(left)}px`;
        panel.style.top = `${Math.round(top)}px`;
    };

    const closeAll = () => {
        document.querySelectorAll('.pn-dropdown-portal').forEach(p => {
            // Remove each class individually
            cls.dropdownPanelOpen.split(' ').forEach(c => p.classList.remove(c));
        });
        document.querySelectorAll('[data-pn-caret]').forEach(c => {
            c.style.transform = '';
        });
    };

    const openDropdown = (trigger, panel) => {
        closeAll();
        positionPortal(panel, trigger);
        cls.dropdownPanelOpen.split(' ').forEach(c => panel.classList.add(c));
        const caret = trigger.querySelector('[data-pn-caret]');
        if (caret) caret.style.transform = 'rotate(180deg)';
    };

    // Attach click handlers to triggers
    navContainer.querySelectorAll('[data-pn-trigger]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const ddId = btn.getAttribute('data-pn-trigger');
            const panel = document.getElementById(ddId);
            if (!panel) return;

            const isOpen = panel.classList.contains('opacity-100');
            if (isOpen) {
                closeAll();
            } else {
                openDropdown(btn, panel);
            }
        });
    });

    // Close on outside click
    if (!window._pnClickAdded) {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('[data-pn-dropdown]') && !e.target.closest('.pn-dropdown-portal')) {
                closeAll();
            }
        });
        window._pnClickAdded = true;
    }

    // Close on resize / scroll
    if (!window._pnResizeAdded) {
        window.addEventListener('resize', closeAll);
        window.addEventListener('scroll', closeAll, true);
        window._pnResizeAdded = true;
    }
}

/**
 * OT Statement Modal — GNFC-style table with month/year/ECNO filters
 * Columns: SR | ECNO | NAME | DATE | SHIFT | FROM | TO | OT REASON | DETAIL REASON | RS | MIN
 */
window.openOtModal = (function () {
    const MODAL_ID = 'modal-ot-statement';
    const STYLESHEET_ID = 'gnfc-modal-ui-style';
    const STYLESHEET_PATH = '/src/css/modal-ui.css';

    // ─── Exact data matching the image ──────────────────────
    const OT_DATA = [
        { ecno: 'N.A.', name: 'N.A.', date: '01/03/2026', shift: 'A', from: '', to: '', otReason: '', detailReason: 'nd taken found OK\ner checked found OK', rs: '', min: '' },
        { ecno: 'BOILE', name: 'BOILER', date: '01/03/2026', shift: 'B', from: '', to: '', otReason: '', detailReason: 'berated so its operation check with operator found ok', rs: '', min: '' },
        { ecno: 'ASH', name: 'ASH', date: '01/03/2026', shift: 'C', from: '', to: '', otReason: '', detailReason: 'n checked and cylinder callnk found so link and seal pressure found ok', rs: '', min: '' },
        { ecno: 'N.A.', name: 'N.A.', date: '01/03/2026', shift: 'A', from: '', to: '', otReason: '', detailReason: 'nd taken found OK\ner checked found OK', rs: '', min: '' },
        { ecno: 'ASH', name: 'ASH', date: '01/03/2026', shift: 'B', from: '', to: '', otReason: 'DEFECT MAINTENANCE', detailReason: 'Seal not coming due to mech, so bypass it as per process requirements.', rs: '', min: '' },
        { ecno: 'ASH', name: 'ASH', date: '01/03/2026', shift: 'C', from: '', to: '', otReason: 'DEFECT MAINTENANCE', detailReason: 'Seal not coming because valve remain minor open due to mech. Manual operation done and seal ok', rs: '', min: '' },
        { ecno: 'N.A.', name: 'N.A.', date: '01/03/2026', shift: 'A', from: '', to: '', otReason: 'N.A', detailReason: 'Boiler CPP CPEU system round taken found OK\nAll visible and UV flame scanner checked found OK', rs: '', min: '' },
        { ecno: 'ASH', name: 'ASH', date: '01/03/2026', shift: 'B', from: '', to: '', otReason: 'DEFECT MAINTENANCE', detailReason: 'DV-1 seal pressure Ok indication bypass due to mechanical seal damage.', rs: '', min: '' },
        { ecno: 'ASH', name: 'ASH', date: '01/03/2026', shift: 'C', from: '', to: '', otReason: 'DEFECT MAINTENANCE', detailReason: 'Seal pressure Ok indication bypass as per process requirement.', rs: '', min: '' },
        { ecno: 'BOILER-2', name: 'BOILER-2', date: '01/03/2026', shift: 'A', from: '', to: '', otReason: 'DEFECT MAINTENANCE', detailReason: 'Open feedback bypass due to not available in open condition.', rs: '', min: '' },
    ];

    function ensureStyles() {
        if (document.getElementById(STYLESHEET_ID)) return;
        const link = document.createElement('link');
        link.id = STYLESHEET_ID;
        link.rel = 'stylesheet';
        link.href = STYLESHEET_PATH;
        document.head.appendChild(link);
    }

    function getFilteredData() {
        const month = document.getElementById('ot-filter-month')?.value || '';
        const year = document.getElementById('ot-filter-year')?.value || '';
        const ecno = (document.getElementById('ot-filter-ecno')?.value || '').trim().toLowerCase();

        return OT_DATA.filter(row => {
            const parts = row.date.split('/');
            const rowMonth = parts[1] || '';
            const rowYear = parts[2] || '';
            if (month && rowMonth !== month) return false;
            if (year && !rowYear.startsWith(year)) return false;
            if (ecno && !row.ecno.toLowerCase().includes(ecno)) return false;
            return true;
        });
    }

    function renderTable() {
        const tbody = document.getElementById('ot-tbody');
        const totalRsEl = document.getElementById('ot-total-rs');
        const totalMinEl = document.getElementById('ot-total-min');
        const countEl = document.getElementById('ot-record-count');
        if (!tbody) return;

        const rows = getFilteredData();
        let totalRs = 0, totalMin = 0;

        if (rows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="11" class="px-4 py-10 text-center color-secondary italic font-14px">No records found.</td></tr>`;
        } else {
            tbody.innerHTML = rows.map((r, i) => {
                totalRs += Number(r.rs) || 0;
                totalMin += Number(r.min) || 0;
                const otReasonValue = r.otReason || '-';
                const reasonCls = otReasonValue === '-' || otReasonValue === 'N.A'
                    ? 'text-gray-400'
                    : 'inline-block px-1.5 py-0.5 rounded-sm border bg-blue-500/10 text-blue-500 border-blue-500/30 text-[9px] font-bold uppercase tracking-wide';
                return `
                <tr class="hover:bg-dark-bg/70 transition-colors border-b border-dark-border font-14px align-top">
                    <td class="px-2 py-2 text-center border-r border-dark-border color-secondary">${i + 1}</td>
                    <td class="px-2 py-2 text-center border-r border-dark-border fw-bold color-blue typo-mono">${r.ecno || '-'}</td>
                    <td class="px-2 py-2 border-r border-dark-border color-primary">${r.name || '-'}</td>
                    <td class="px-2 py-2 text-center border-r border-dark-border color-secondary typo-mono">${r.date || '-'}</td>
                    <td class="px-2 py-2 text-center border-r border-dark-border fw-bold color-primary">${r.shift || '-'}</td>
                    <td class="px-2 py-2 text-center border-r border-dark-border color-secondary typo-mono">${r.from || '-'}</td>
                    <td class="px-2 py-2 text-center border-r border-dark-border color-secondary typo-mono">${r.to || '-'}</td>
                    <td class="px-2 py-2 border-r border-dark-border"><span class="${reasonCls}">${otReasonValue}</span></td>
                    <td class="px-2 py-2 border-r border-dark-border color-primary leading-snug whitespace-pre-wrap">${r.detailReason || '-'}</td>
                    <td class="px-2 py-2 text-center border-r border-dark-border fw-bold color-primary">${r.rs || '-'}</td>
                    <td class="px-2 py-2 text-center fw-bold color-primary">${r.min || '-'}</td>
                </tr>`;
            }).join('');
        }

        if (totalRsEl) totalRsEl.textContent = totalRs;
        if (totalMinEl) totalMinEl.textContent = totalMin;
        if (countEl) countEl.textContent = rows.length;
    }

    // Expose renderTable so inline onchange can call it
    window._otRenderTable = renderTable;

    function buildModal(plant) {
        const now = new Date();
        const curMonth = String(now.getMonth() + 1).padStart(2, '0');
        const curYear = String(now.getFullYear());

        const months = [
            ['01', 'January'], ['02', 'February'], ['03', 'March'], ['04', 'April'],
            ['05', 'May'], ['06', 'June'], ['07', 'July'], ['08', 'August'],
            ['09', 'September'], ['10', 'October'], ['11', 'November'], ['12', 'December']
        ];
        const monthOptions = months.map(([v, l]) =>
            `<option value="${v}" ${v === curMonth ? 'selected' : ''}>${l}</option>`
        ).join('');

        const years = [];
        for (let y = now.getFullYear(); y >= 2020; y--) years.push(y);
        const yearOptions = years.map(y =>
            `<option value="${y}" ${y === now.getFullYear() ? 'selected' : ''}>${y}</option>`
        ).join('');

        const wrapper = document.createElement('div');
        wrapper.id = MODAL_ID;
        wrapper.className = 'gnfc-modal-overlay';
        wrapper.setAttribute('role', 'dialog');
        wrapper.setAttribute('aria-modal', 'true');
        wrapper.setAttribute('aria-labelledby', 'ot-modal-title');

        wrapper.innerHTML = `
            <div class="gnfc-modal-shell gnfc-modal-shell--2xl" style="height: min(750px, 92vh);">

                <!-- Header -->
                <div class="gnfc-modal-header">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-sm bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500">
                            <i class="ph-fill ph-clock-user text-lg"></i>
                        </div>
                        <div>
                            <h2 id="ot-modal-title" class="gnfc-modal-title">Over Time Statement</h2>
                            <p class="gnfc-modal-subtitle">Plant: <span class="fw-bold color-primary">${plant}</span></p>
                        </div>
                    </div>
                    <button type="button" onclick="window.closeOtModal()" class="gnfc-modal-close" aria-label="Close">
                        <i class="ph-bold ph-x text-lg pointer-events-none"></i>
                    </button>
                </div>

                <!-- Filters -->
                <div class="flex flex-wrap items-end gap-3 px-4 py-3 border-b border-[var(--gnfc-modal-shell-border)] bg-[var(--gnfc-modal-header-bg)]">
                    <div>
                        <label class="gnfc-modal-label">Month</label>
                        <select id="ot-filter-month" class="gnfc-modal-input" style="width:130px" onchange="window._otRenderTable()">
                            <option value="">All</option>
                            ${monthOptions}
                        </select>
                    </div>
                    <div>
                        <label class="gnfc-modal-label">Year</label>
                        <select id="ot-filter-year" class="gnfc-modal-input" style="width:90px" onchange="window._otRenderTable()">
                            <option value="">All</option>
                            ${yearOptions}
                        </select>
                    </div>
                    <div>
                        <label class="gnfc-modal-label">ECNO</label>
                        <input id="ot-filter-ecno" type="text" placeholder="Search ECNO…" class="gnfc-modal-input" style="width:140px" oninput="window._otRenderTable()">
                    </div>
                    <button type="button" onclick="window._otRenderTable()" class="gnfc-modal-btn gnfc-modal-btn-primary" style="align-self:flex-end">
                        <i class="ph-bold ph-magnifying-glass"></i> Go
                    </button>
                </div>

                <!-- Table Body -->
                <div class="gnfc-modal-body gnfc-modal-body--flush" style="overflow:auto; flex:1;">
                    <table class="w-full text-left border-collapse min-w-[900px]">
                        <thead class="sticky top-0 z-10">
                            <tr class="font-11px fw-bold text-upper ls-wider bg-dark-header color-label border-b border-dark-border">
                                <th class="px-2 py-2 w-10 text-center border-r border-dark-border font-14px">SR</th>
                                <th class="px-2 py-2 w-24 text-center border-r border-dark-border font-14px">ECNO</th>
                                <th class="px-2 py-2 w-28 border-r border-dark-border font-14px">NAME</th>
                                <th class="px-2 py-2 w-28 text-center border-r border-dark-border font-14px">DATE</th>
                                <th class="px-2 py-2 w-14 text-center border-r border-dark-border font-14px">SHIFT</th>
                                <th class="px-2 py-2 w-16 text-center border-r border-dark-border font-14px">FROM</th>
                                <th class="px-2 py-2 w-16 text-center border-r border-dark-border font-14px">TO</th>
                                <th class="px-2 py-2 w-36 border-r border-dark-border font-14px">OT REASON</th>
                                <th class="px-2 py-2 border-r border-dark-border font-14px">DETAIL REASON</th>
                                <th class="px-2 py-2 w-14 text-center border-r border-dark-border font-14px">RS</th>
                                <th class="px-2 py-2 w-14 text-center font-14px">MIN</th>
                            </tr>
                        </thead>
                        <tbody id="ot-tbody" class="font-13px color-primary bg-dark-panel"></tbody>
                        <tfoot>
                            <tr class="border-t-2 border-dark-border fw-bold font-13px bg-dark-header">
                                <td colspan="9" class="px-2 py-2 text-right text-upper ls-wide color-secondary border-r border-dark-border">TOTAL</td>
                                <td id="ot-total-rs"  class="px-2 py-2 text-center text-blue-400 border-r border-dark-border">0</td>
                                <td id="ot-total-min" class="px-2 py-2 text-center text-blue-400">0</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <!-- Footer -->
                <div class="gnfc-modal-footer gnfc-modal-footer--space-between">
                    <div class="flex items-center gap-2 font-12px color-secondary">
                        Showing <span id="ot-record-count" class="fw-bold color-primary mx-1">0</span> entries
                    </div>
                    <div class="flex items-center gap-2">
                        <button type="button" onclick="window.openOtSummaryModal()" class="gnfc-modal-btn gnfc-modal-btn-secondary">
                            <i class="ph-bold ph-chart-bar mr-1"></i>Summary
                        </button>
                        <button type="button" onclick="window.openOtTotalReportModal()" class="gnfc-modal-btn gnfc-modal-btn-primary">
                            <i class="ph-bold ph-printer mr-1"></i>Total Report
                        </button>
                        <button type="button" onclick="window.closeOtModal()" class="gnfc-modal-btn gnfc-modal-btn-secondary">
                            Close
                        </button>
                    </div>
                </div>

            </div>
        `;

        wrapper.addEventListener('click', function (e) {
            if (e.target === wrapper) window.closeOtModal();
        });

        document.body.appendChild(wrapper);
    }

    return function openOtModal(plantName) {
        const plant = (plantName || 'BOILER').toUpperCase();

        ensureStyles();

        let modal = document.getElementById(MODAL_ID);
        if (!modal) {
            buildModal(plant);
            modal = document.getElementById(MODAL_ID);
        }

        requestAnimationFrame(() => {
            modal.classList.add('is-open');
            renderTable();
        });
    };
})();

window.closeOtModal = function () {
    const modal = document.getElementById('modal-ot-statement');
    if (modal) modal.classList.remove('is-open');
};

/**
 * OT Summary Child Modal
 */
window.openOtSummaryModal = function () {
    const filterMonth = document.getElementById('ot-filter-month')?.value || (new Date().getMonth() + 1).toString();
    const filterYear = document.getElementById('ot-filter-year')?.value || new Date().getFullYear();
    const rs = document.getElementById('ot-total-rs')?.textContent || '0';
    const min = document.getElementById('ot-total-min')?.textContent || '0';
    const numPersons = document.getElementById('ot-tbody')?.querySelectorAll('tr').length || '0';

    // convert minutes to Hours and Minutes
    let m = parseInt(min) || 0;
    const hr = Math.floor(m / 60);
    const remMin = m % 60;

    let subModal = document.getElementById('modal-ot-summary');
    if (!subModal) {
        subModal = document.createElement('div');
        subModal.id = 'modal-ot-summary';
        subModal.className = 'gnfc-modal-overlay style="z-index: 10005;"';
        subModal.setAttribute('role', 'dialog');
        subModal.setAttribute('aria-modal', 'true');

        subModal.innerHTML = `
            <div class="gnfc-modal-shell gnfc-modal-shell--medium">
                <div class="gnfc-modal-header">
                    <h2 class="gnfc-modal-title">Over Time Summary</h2>
                    <button type="button" onclick="window.closeOtSummaryModal()" class="gnfc-modal-close" aria-label="Close">
                        <i class="ph-bold ph-x text-lg pointer-events-none"></i>
                    </button>
                </div>
                <div class="gnfc-modal-body p-6 flex flex-col gap-4">
                    <h3 class="text-[16px] color-primary border-b border-gray-300 dark:border-gray-600 pb-2 mb-2">Over Time Summary for the month of <span id="summ-month-year" class="fw-bold"></span></h3>
                    <div class="flex flex-col gap-2 font-15px">
                        <div><span class="fw-bold color-primary">No Of Person :</span> <span id="summ-persons" class="color-blue fw-bold"></span></div>
                        <div class="flex items-center gap-3">
                            <span class="fw-bold color-primary">Grand Total :</span> 
                            <div class="flex flex-wrap items-center gap-2">
                                <span>Hr : <input type="text" id="summ-hr" class="gnfc-modal-input inline-block w-16 px-1 py-0.5 text-center bg-gray-50 dark:bg-black/20" readonly></span>
                                <span>Min : <input type="text" id="summ-min" class="gnfc-modal-input inline-block w-16 px-1 py-0.5 text-center bg-gray-50 dark:bg-black/20" readonly></span>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 mt-4">
                            <span class="fw-bold color-primary">Reason:</span>
                            <input type="text" class="gnfc-modal-input flex-1" style="max-width: 200px;">
                            <button class="gnfc-modal-btn gnfc-modal-btn-secondary py-1 h-[30px]"><i class="ph-bold ph-export"></i> Export</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(subModal);
    }

    document.getElementById('summ-month-year').textContent = `${parseInt(filterMonth)}/${filterYear}`;
    document.getElementById('summ-persons').textContent = numPersons;
    document.getElementById('summ-hr').value = hr;
    document.getElementById('summ-min').value = remMin;

    requestAnimationFrame(() => subModal.classList.add('is-open'));
};

window.closeOtSummaryModal = function () {
    const modal = document.getElementById('modal-ot-summary');
    if (modal) modal.classList.remove('is-open');
};

/**
 * OT Total Report Child Modal
 */
window.openOtTotalReportModal = function () {
    const filterMonth = document.getElementById('ot-filter-month')?.value || (new Date().getMonth() + 1).toString();
    const filterYear = document.getElementById('ot-filter-year')?.value || new Date().getFullYear();
    const min = document.getElementById('ot-total-min')?.textContent || '0';
    const numPersons = document.getElementById('ot-tbody')?.querySelectorAll('tr').length || '0';

    // convert minutes to Hours and Minutes
    let m = parseInt(min) || 0;
    const hr = Math.floor(m / 60);
    const remMin = m % 60;

    let totalModal = document.getElementById('modal-ot-total-report');
    if (!totalModal) {
        totalModal = document.createElement('div');
        totalModal.id = 'modal-ot-total-report';
        totalModal.className = 'gnfc-modal-overlay style="z-index: 10005;"';
        totalModal.setAttribute('role', 'dialog');
        totalModal.setAttribute('aria-modal', 'true');

        totalModal.innerHTML = `
            <div class="gnfc-modal-shell gnfc-modal-shell--medium">
                <div class="gnfc-modal-header">
                    <h2 class="gnfc-modal-title">Over Time Summary (Total Report)</h2>
                    <button type="button" onclick="window.closeOtTotalReportModal()" class="gnfc-modal-close" aria-label="Close">
                        <i class="ph-bold ph-x text-lg pointer-events-none"></i>
                    </button>
                </div>
                <div class="gnfc-modal-body p-6 flex flex-col gap-4">
                    <h3 class="text-[16px] color-primary border-b border-gray-300 dark:border-gray-600 pb-2 mb-2">Over Time Summary for the month of <span id="tot-month-year" class="fw-bold"></span></h3>
                    <div class="flex flex-col gap-2 font-15px">
                        <div><span class="fw-bold color-primary">No Of Person :</span> <span id="tot-persons" class="color-blue fw-bold"></span></div>
                        <div class="flex items-center gap-2">
                            <span class="fw-bold color-primary">Grand Total :</span> 
                            <span class="fw-bold">Hr :</span> <span id="tot-hr" class="color-primary"></span>
                            <span class="fw-bold ml-2">Min :</span> <span id="tot-min" class="color-primary"></span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(totalModal);
    }

    document.getElementById('tot-month-year').textContent = `${parseInt(filterMonth)}/${filterYear}`;
    document.getElementById('tot-persons').textContent = numPersons;
    document.getElementById('tot-hr').textContent = hr;
    document.getElementById('tot-min').textContent = remMin;

    requestAnimationFrame(() => totalModal.classList.add('is-open'));
};

window.closeOtTotalReportModal = function () {
    const modal = document.getElementById('modal-ot-total-report');
    if (modal) modal.classList.remove('is-open');
};

