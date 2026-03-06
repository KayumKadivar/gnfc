/**
 * EmgCallModal - Emergency Call Report Management
 * A modular component for viewing and filtering emergency call logs.
 */
const EmgCallModal = (function() {
    // --- Configuration & Constants ---
    const CONFIG = {
        MODAL_ID: 'modal-emg-call',
        TRUNCATE_LIMIT: 20,
        TYPE_COLORS: {
            'ABNORMALITY': 'bg-red-500/10 text-red-400 border-red-500/30',
            'MAINTENANCE': 'bg-blue-500/10 text-blue-500 border-red-500/30', // Fallback maintenance
            'DEFAULT': 'bg-amber-500/10 text-amber-500 border-amber-500/30'
        },
        STYLESHEET_ID: 'gnfc-modal-ui-style',
        STYLESHEET_PATH: '/src/css/modal-ui.css'
    };

    // --- Utilities ---
    const Utils = {
        /**
         * Truncate text to a specific number of words.
         */
        truncateWords(text, limit) {
            if (!text) return '';
            const words = text.trim().split(/\s+/);
            if (words.length <= limit) return text;
            return words.slice(0, limit).join(' ') + '...';
        },

        /**
         * Escape HTML to prevent XSS.
         */
        escapeHtml(value) {
            if (value === null || value === undefined) return '';
            return String(value).replace(/[&<>"']/g, char => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char]));
        },

        /**
         * Parse DD/MM/YYYY to YYYY-MM-DD for date comparison.
         */
        parseDate(value) {
            if (!value) return '';
            const parts = String(value).split('/');
            if (parts.length !== 3) return '';
            const [day, month, year] = parts;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    };

    // --- State ---
    let state = {
        isOpen: false,
        data: [
            { date: '17/09/2025', tech: 'NRL', tag: 'CX701', type: 'ABNORMALITY', desc: 'At 02:44 AM, CX701 tripped on LS9105AL, LS9105BL, and LS9105CL due to a low-level trip in D713 (Seal Oil Drum). Following the trip, the physical condition of LTB105 and LS9105 was inspected and found normal, with no abnormalities observed. Attempts were made to restore the oil level in D713, but the level did not rise. LV9105 was responding to control room (C/R) signals. Leak', otHour: 0 },
            { date: '14/09/2025', tech: 'NRL', tag: 'MV1', type: 'ABNORMALITY', desc: 'process reported that valve getting open and close several times checked in detail and found it got open at 1st time --> 12:09:07 2nd time --> 12:09:17 3rd time --> 12:15:24 and 4th time --> 12:15:30 .Leakages are checked no leakages are found after that SOV forced from its bottom key and then relay is replaced(P0034 relay no. R0004). Connections are checked at marshalling and SOV no any abnormality is found. After relay replacement SOV key is normalized and taken in line. Jobs done with Mr.PSG,SIE(NKP), and IE(MAJ). Observation during abnormality is found.', otHour: 0 },
            { date: '11/10/2024', tech: 'NRL', tag: 'FT0210CD', type: 'DEFECT MAINTENANCE', desc: 'Process reported that its reading decreased to 22M3/Hr from 36M3/Hr, so checked at field and found on Tx. display reading showing 36M3/Hr and matching with other Tx. reading. Connected HART and showing 12mA which was same as all Tx. so on doubt base DCS channel simulation done and DCS channel found Ok. After ON/OFF Tx. it was giving 1.79mA in loop, so power module of Tx. changed but no improvement found. After that its 4-20mA cum sensor module changed and now in DCS showing Ok. Display module is also changed as it became black.', otHour: 0 },
            { date: '08/01/2024', tech: 'NRL', tag: 'C1001A', type: 'PROCESS REQMT', desc: 'Its loading unloading valve tubing connections are done. for simulation its logic was bypassed. simulation taken found Ok. logic taken in line.', otHour: 0 }
        ],
        filteredData: []
    };

    // --- Template ---
    const getModalTemplate = () => `
        <div class="modal micromodal-slide" id="${CONFIG.MODAL_ID}" aria-hidden="true">
            <div class="modal__overlay" tabindex="-1" data-micromodal-close>
                <div class="modal__container gnfc-modal-shell gnfc-modal-shell--2xl" role="dialog" aria-modal="true" aria-labelledby="modal-emg-title">
                    <div class="gnfc-modal-header">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-sm bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
                                <i class="ph-fill ph-siren text-lg"></i>
                            </div>
                            <div>
                                <h2 id="modal-emg-title" class="gnfc-modal-title">Emergency Call Report</h2>
                                <p class="gnfc-modal-subtitle font-14px">Emergency call logs with overtime summary</p>
                            </div>
                        </div>
                        <button class="gnfc-modal-close" aria-label="Close modal" data-micromodal-close>
                            <i class="ph-bold ph-x text-lg pointer-events-none"></i>
                        </button>
                    </div>

                    <div class="gnfc-modal-body gnfc-modal-body--tight flex flex-col gap-4">
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                            ${renderFilterInput('Start Date', 'emg-start-date', 'date')}
                            ${renderFilterInput('End Date', 'emg-end-date', 'date')}
                            ${renderFilterInput('Search', 'emg-search', 'text', 'Search tag, tech, type, or description')}
                            <div class="flex items-end">
                                <button type="button" onclick="EmgCallModal.applyFilters()" class="gnfc-modal-btn gnfc-modal-btn-primary w-full">Apply</button>
                            </div>
                        </div>

                        <div class="border border-dark-border rounded-sm overflow-auto">
                            <table class="w-full text-left border-collapse min-w-[960px]">
                                <thead class="sticky top-0 z-10">
                                    <tr class="font-11px fw-bold text-upper ls-wider bg-dark-header color-label border-b border-dark-border">
                                        <th class="px-3 py-2 w-28 text-center border-r border-dark-border font-14px">Date</th>
                                        <th class="px-3 py-2 w-20 text-center border-r border-dark-border font-14px">Tech</th>
                                        <th class="px-3 py-2 w-32 text-center border-r border-dark-border font-14px">Tag No</th>
                                        <th class="px-3 py-2 w-44 border-r border-dark-border font-14px">Type of Job</th>
                                        <th class="px-4 py-2 border-r border-dark-border font-14px">Description</th>
                                        <th class="px-3 py-2 w-20 text-center font-14px">OT Hr</th>
                                    </tr>
                                </thead>
                                <tbody id="emg-table-body" class="font-13px color-primary bg-dark-panel"></tbody>
                            </table>
                        </div>
                    </div>

                    <div class="gnfc-modal-footer gnfc-modal-footer--space-between">
                        <div class="font-12px color-secondary">
                            Showing <span id="emg-record-count" class="fw-bold color-primary">0</span> entries
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="font-11px text-upper ls-wide color-secondary fw-bold">Total OT Hours</span>
                            <span id="emg-total-hours" class="px-2.5 py-1 rounded-sm border border-blue-500/30 bg-blue-500/10 text-blue-500 font-12px fw-bold">0.0</span>
                            <button type="button" class="gnfc-modal-btn gnfc-modal-btn-secondary" data-micromodal-close>Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const renderFilterInput = (label, id, type, placeholder = '') => `
        <div>
            <label class="gnfc-modal-label text-upper ls-wide">${label}</label>
            <input
                id="${id}"
                type="${type}"
                class="gnfc-modal-input"
                ${placeholder ? `placeholder="${placeholder}"` : ''}
                ${type === 'text' ? 'oninput="EmgCallModal.applyFilters()"' : 'onchange="EmgCallModal.applyFilters()"'}
            >
        </div>
    `;

    // --- Private Methods ---
    const ensureStyles = () => {
        if (document.getElementById(CONFIG.STYLESHEET_ID)) return;
        const link = document.createElement('link');
        link.id = CONFIG.STYLESHEET_ID;
        link.rel = 'stylesheet';
        link.href = CONFIG.STYLESHEET_PATH;
        document.head.appendChild(link);
    };

    const ensureModal = () => {
        if (document.getElementById(CONFIG.MODAL_ID)) return;
        document.body.insertAdjacentHTML('beforeend', getModalTemplate());
    };

    const getStatusClass = (type) => {
        if (type.includes('ABNORMALITY')) return CONFIG.TYPE_COLORS['ABNORMALITY'];
        if (type.includes('MAINTENANCE')) return CONFIG.TYPE_COLORS['MAINTENANCE'];
        return CONFIG.TYPE_COLORS['DEFAULT'];
    };

    // --- Public API ---
    return {
        init() {
            state.filteredData = [...state.data];
            ensureStyles();
            ensureModal();
            try {
                MicroModal.init({
                    awaitOpenAnimation: true,
                    awaitCloseAnimation: true,
                    disableScroll: true
                });
            } catch (e) {
                console.error("MicroModal init failed", e);
            }
        },

        open() {
            this.init();
            try {
                MicroModal.show(CONFIG.MODAL_ID);
            } catch (e) {
                document.getElementById(CONFIG.MODAL_ID).classList.add('is-open');
            }
            this.applyFilters();
        },

        close() {
            try {
                MicroModal.close(CONFIG.MODAL_ID);
            } catch (e) {
                document.getElementById(CONFIG.MODAL_ID).classList.remove('is-open');
            }
        },

        applyFilters() {
            const startDate = document.getElementById('emg-start-date')?.value || '';
            const endDate = document.getElementById('emg-end-date')?.value || '';
            const search = (document.getElementById('emg-search')?.value || '').trim().toLowerCase();

            state.filteredData = state.data.filter(item => {
                const dateVal = Utils.parseDate(item.date);
                if (startDate && dateVal < startDate) return false;
                if (endDate && dateVal > endDate) return false;

                if (search) {
                    const haystack = `${item.tech} ${item.tag} ${item.type} ${item.desc}`.toLowerCase();
                    if (!haystack.includes(search)) return false;
                }
                return true;
            });

            this.updateTable();
        },

        updateTable() {
            const elements = {
                tbody: document.getElementById('emg-table-body'),
                count: document.getElementById('emg-record-count'),
                total: document.getElementById('emg-total-hours')
            };

            if (!elements.tbody) return;

            elements.tbody.innerHTML = '';
            let totalHours = 0;

            if (state.filteredData.length === 0) {
                elements.tbody.innerHTML = `<tr><td colspan="6" class="px-4 py-12 text-center color-secondary italic">No records matching your search.</td></tr>`;
            } else {
                state.filteredData.forEach(item => {
                    totalHours += (item.otHour || 0);
                    elements.tbody.innerHTML += this.renderRow(item);
                });
            }

            if (elements.count) elements.count.innerText = state.filteredData.length;
            if (elements.total) elements.total.innerText = totalHours.toFixed(1);
        },

        renderRow(item) {
            const statusClass = getStatusClass(item.type);
            const truncatedDesc = Utils.truncateWords(item.desc, CONFIG.TRUNCATE_LIMIT);

            return `
                <tr class="hover:bg-dark-bg/70 transition-colors border-b border-dark-border align-top font-14px">
                    <td class="px-3 py-3 text-center border-r border-dark-border color-secondary typo-mono">${Utils.escapeHtml(item.date)}</td>
                    <td class="px-3 py-3 text-center border-r border-dark-border fw-bold color-primary">${Utils.escapeHtml(item.tech)}</td>
                    <td class="px-3 py-3 border-r border-dark-border text-center fw-bold color-blue typo-mono">${Utils.escapeHtml(item.tag)}</td>
                    <td class="px-3 py-3 border-r border-dark-border">
                        <span class="inline-block px-2 py-0.5 rounded-sm border ${statusClass} text-[9px] font-bold uppercase tracking-wide">
                            ${Utils.escapeHtml(item.type)}
                        </span>
                    </td>
                    <td class="px-4 py-3 border-r border-dark-border color-primary leading-relaxed font-15px">
                        ${Utils.escapeHtml(truncatedDesc)}
                    </td>
                    <td class="px-3 py-3 text-center fw-bold color-primary">${(item.otHour || 0).toFixed(1)}</td>
                </tr>
            `;
        }
    };
})();
