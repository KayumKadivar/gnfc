/**
 * Renders the Plant Navigation Bar (Modern & Responsive)
 * @param {string} activePageId - The ID of the current active page
 */
function renderPlantNav(activePageId) {
    const navContainer = document.getElementById('plant-nav-container');
    if (!navContainer) return;

    // --- Configuration ---
    const navItems = [
        { id: 'logs', label: 'Logs', href: '/src/pages/plant_detail.html' },
        { id: 'job_types', label: 'Type Of Job', href: '/src/pages/job_types.html' },
        { id: 'instrument_types', label: 'Type Of Inst', href: '/src/pages/instrument_types.html' },
        { id: 'remark_reports', label: 'Remark Report', href: '/src/pages/remark_reports.html' },
        { id: 'tagwise_filter', label: 'TagWise Filter', href: '/src/pages/tagwise_filter.html' },
        { id: 'monthly_report', label: 'Monthly Report', href: '/src/pages/monthly_report.html' },
        { id: 'datewise_report', label: 'Date Wise Report', href: '/src/pages/datewise_report.html' },
        { id: 'job_history', label: 'Job History', href: '/src/pages/job_history.html' },
        { id: 'ot_hours', label: 'OT Hrs', href: '/src/pages/ot_hours.html' },
        {
            id: 'sy_pm', label: 'SY PM', href: '#', children: [
                { label: 'FOXBORO DCS', href: '/src/pages/Sy_PM.html?system=FOXBORO DCS' },
                { label: 'YBL DCS', href: '/src/pages/Sy_PM.html?system=YBL DCS' },
                { label: 'GHH DCS', href: '/src/pages/Sy_PM.html?system=GHH DCS' },
                { label: 'TRICONEX ESD', href: '/src/pages/Sy_PM.html?system=TRICONEX ESD' },
                { label: 'HAIL ESD', href: '/src/pages/Sy_PM.html?system=HAIL ESD' }
            ]
        }
    ];

    // --- Generate Nav Items ---
    const buttonsHtml = navItems.map((item, index) => {
        // Check if active (either direct ID match or child URL match)
        const isActive = item.id === activePageId || (item.children && item.children.some(child => window.location.href.includes(child.href)));

        // Styles
        const baseClass = "relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap";
        const activeClass = "bg-gnfc-blue text-white shadow-md shadow-blue-500/20";
        const inactiveClass = "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2c3235]";

        const finalClass = `${baseClass} ${isActive ? activeClass : inactiveClass}`;

        // Render Dropdown
        if (item.children) {
            const dropdownId = `dropdown-${index}`;
            return `
                <div class="relative group">
                    <button type="button" 
                            class="${finalClass}" 
                            onclick="toggleDropdown(event, '${dropdownId}')">
                        ${item.label}
                        <i class="ph-bold ph-caret-down opacity-70 text-[10px]"></i>
                    </button>
                    <div id="${dropdownId}" 
                         class="dropdown-menu hidden fixed w-48 bg-white dark:bg-[#1a1d21] border border-gray-200 dark:border-[#2c3235] rounded-lg shadow-xl py-1 z-[70] animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                        ${item.children.map(child => `
                            <a href="${child.href}" class="block px-3 py-2 text-[11px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2c3235] hover:text-gnfc-blue dark:hover:text-gnfc-blue transition-colors">
                                ${child.label}
                            </a>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Render Standard Link
        return `
            <a href="${item.href}" class="${finalClass}">
                ${item.label}
            </a>
        `;
    }).join('');

    // --- Render Container ---
    navContainer.innerHTML = `
        <div class="sticky top-10 z-20 transition-all duration-300">
            <div class="bg-white/80 dark:bg-[#111217]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#2c3235] p-2 mb-4">
                <div class="max-w-[1920px] mx-auto flex items-center justify-between gap-4">
                    
                    <nav class="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar mask-gradient-right">
                        ${buttonsHtml}
                    </nav>

                    <div class="shrink-0 pl-4 border-l border-gray-200 dark:border-[#2c3235]">
                        <button onclick="try{EmgCallModal.open()}catch(e){console.log('EMG Modal missing')}"
                            class="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-md text-xs font-bold hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm">
                            <i class="ph-bold ph-siren animate-pulse"></i> 
                            <span class="hidden sm:inline">EMG Call</span>
                            <span class="sm:hidden">EMG</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    `;

    const closeAllDropdowns = () => {
        document.querySelectorAll('.dropdown-menu').forEach(el => el.classList.add('hidden'));
    };

    const getFixedContainingBlock = (element) => {
        let current = element.parentElement;
        while (current && current !== document.body) {
            const styles = window.getComputedStyle(current);
            const containValue = styles.contain || '';
            const createsContainingBlock =
                styles.transform !== 'none' ||
                styles.perspective !== 'none' ||
                styles.filter !== 'none' ||
                styles.backdropFilter !== 'none' ||
                styles.webkitBackdropFilter !== 'none' ||
                containValue.includes('paint') ||
                containValue.includes('layout');

            if (createsContainingBlock) return current;
            current = current.parentElement;
        }
        return null;
    };

    const positionDropdown = (menu, triggerButton) => {
        const spacing = 8;
        const triggerRect = triggerButton.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const containingBlock = getFixedContainingBlock(menu);

        let minLeft = spacing;
        let maxRight = window.innerWidth - spacing;
        let minTop = spacing;
        let maxBottom = window.innerHeight - spacing;
        let leftOffset = 0;
        let topOffset = 0;

        if (containingBlock) {
            const blockRect = containingBlock.getBoundingClientRect();
            leftOffset = blockRect.left;
            topOffset = blockRect.top;
            minLeft = spacing;
            maxRight = blockRect.width - spacing;
            minTop = spacing;
            maxBottom = blockRect.height - spacing;
        }

        let left = (triggerRect.left - leftOffset);
        let top = (triggerRect.bottom - topOffset) + spacing;

        if (left + menuRect.width > maxRight) {
            left = maxRight - menuRect.width;
        }
        if (left < minLeft) left = minLeft;

        if (top + menuRect.height > maxBottom) {
            const aboveTrigger = (triggerRect.top - topOffset) - menuRect.height - spacing;
            if (aboveTrigger >= minTop) top = aboveTrigger;
        }

        menu.style.left = `${Math.round(left)}px`;
        menu.style.top = `${Math.round(top)}px`;
    };

    // --- Dropdown Handler (attached to window for global access) ---
    window.toggleDropdown = function(event, id) {
        event.stopPropagation();
        const triggerButton = event.currentTarget;
        const menu = document.getElementById(id);
        if (!menu || !triggerButton) return;
        const isHidden = menu.classList.contains('hidden');
        
        // Close all others
        closeAllDropdowns();
        
        // Toggle current
        if (isHidden) {
            menu.classList.remove('hidden');
            positionDropdown(menu, triggerButton);
        }
    };

    // --- Close Dropdowns on Outside Click ---
    if (!window.dropdownListenerAdded) {
        document.addEventListener('click', () => {
            closeAllDropdowns();
        });
        window.dropdownListenerAdded = true;
    }

    // Close open dropdowns whenever viewport changes.
    if (!window.dropdownViewportListenerAdded) {
        window.addEventListener('resize', closeAllDropdowns);
        window.addEventListener('scroll', closeAllDropdowns, true);
        window.dropdownViewportListenerAdded = true;
    }
}
