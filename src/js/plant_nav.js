/**
 * Plant Navigation Bar — Grafana-Style Grouped Industrial Dashboard Nav
 * -  Logically grouped items to avoid scrollbar overflow
 * -  Portal-pattern dropdowns (appended to document.body) to avoid
 *    backdrop-filter / transform containing-block issues
 * -  Responsive: no scrollbar at any breakpoint
 *
 * @param {string} activePageId - The ID of the current active page
 */
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
        // Group 5 — System PM (dropdown with children)
        {
            dropdown: true,
            id: 'sy_pm',
            label: 'SY PM',
            icon: 'ph-gear-six',
            activeIds: ['sy_pm'],
            // items: [
            //     { label: 'FOXBORO DCS', icon: 'ph-circuitry', href: buildSyPmHref('FOXBORO DCS') },
            //     { label: 'YBL DCS', icon: 'ph-circuitry', href: buildSyPmHref('YBL DCS') },
            //     { label: 'GHH DCS', icon: 'ph-circuitry', href: buildSyPmHref('GHH DCS') },
            //     { label: 'TRICONEX ESD', icon: 'ph-shield-check', href: buildSyPmHref('TRICONEX ESD') },
            //     { label: 'HAIL ESD', icon: 'ph-shield-check', href: buildSyPmHref('HAIL ESD') }
            // ]
        }
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

                    <div class="shrink-0 pl-4 ml-2 border-l border-gray-200 dark:border-[#2c3235]">
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
        panel.innerHTML = group.items.map(child => {
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
            p.classList.remove(cls.dropdownPanelOpen.split(' ').join(','));
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
