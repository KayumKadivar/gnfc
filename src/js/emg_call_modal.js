const EmgCallModal = {
    isOpen: false,
    data: [
        { date: '17/09/2025', tech: 'NRL', tag: 'CX701', type: 'ABNORMALITY', desc: 'At 02:44 AM, CX701 tripped on LS9105AL, LS9105BL, and LS9105CL due to a low-level trip in D713 (Seal Oil Drum). Following the trip, the physical condition of LTB105 and LS9105 was inspected and found normal, with no abnormalities observed. Attempts were made to restore the oil level in D713, but the level did not rise. LV9105 was responding to control room (C/R) signals. Leak checks were performed, and the valve\'s physical condition was found satisfactory. The process team then attempted to fill the oil level using the bypass of LV9105, which resulted in the level of D713 rising. This created suspicion of a control valve (C/V) malfunction. The valve was removed from the line, and a water test was performed, which is found completely ok holding while valve close and water passing while valve open. To rule out process-side issues, the upstream (U/S) and downstream (D/S) lines were inspected. After starting the oil pump and opening the U/S isolation valve, no oil was observed at the open flange until approximately 50% valve opening. At this point, minor oil flow was detected, and upon subsequent closure of the isolation valve, full oil flow was established. The C/V was dismantled from the bonnet for detailed inspection. The plug, seat, and cage were found in good condition, and valve operation was confirmed satisfactory. The valve was reassembled with a new bonnet gasket, reinstalled, and the positioner was mounted. Stroke calibration was completed, and the valve was taken in line. No leakage was observed. The activity was carried out in coordination with Mr. PSG.', otHour: 0 },
        { date: '14/09/2025', tech: 'NRL', tag: 'MV1', type: 'ABNORMALITY', desc: 'process reported that valve getting open and close several times checked in detail and found it got open at 1st time --> 12:09:07 2nd time --> 12:09:17 3rd time --> 12:15:24 and 4th time --> 12:15:30 .Leakages are checked no leakages are found after that SOV forced from its bottom key and then relay is replaced(P0034 relay no. R0004). Connections are checked at marshalling and SOV no any abnormality is found. After relay replacement SOV key is normalized and taken in line. Jobs done with Mr.PSG,SIE(NKP), and IE(MAJ). Observation during abnormality is found.', otHour: 0 },
        { date: '11/10/2024', tech: 'NRL', tag: 'FT0210CD', type: 'DEFECT MAINTENANCE', desc: 'Process reported that its reading decreased to 22M3/Hr from 36M3/Hr, so checked at field and found on Tx. display reading showing 36M3/Hr and matching with other Tx. reading. Connected HART and showing 12mA which was same as all Tx. so on doubt base DCS channel simulation done and DCS channel found Ok. After ON/OFF Tx. it was giving 1.79mA in loop, so power module of Tx. changed but no improvement found. After that its 4-20mA cum sensor module changed and now in DCS showing Ok. Display module is also changed as it became black.', otHour: 0 },
        { date: '08/01/2024', tech: 'NRL', tag: 'C1001A', type: 'PROCESS REQMT', desc: 'Its loading unloading valve tubing connections are done. for simulation its logic was bypassed. simulation taken found Ok. logic taken in line.', otHour: 0 }
    ],
    filteredData: [],

    ensureSharedStyles() {
        const styleId = 'gnfc-modal-ui-style';
        if (document.getElementById(styleId)) return;

        const link = document.createElement('link');
        link.id = styleId;
        link.rel = 'stylesheet';
        link.href = '/src/css/modal-ui.css';
        document.head.appendChild(link);
    },

    init() {
        this.filteredData = [...this.data];
        this.ensureSharedStyles();
        this.ensureModalStructure();
        try {
            MicroModal.init({
                onShow: modal => console.info(`${modal.id} is shown`),
                onClose: modal => console.info(`${modal.id} is hidden`),
                openTrigger: 'data-micromodal-trigger',
                closeTrigger: 'data-micromodal-close',
                disableScroll: true,
                disableFocus: false,
                awaitOpenAnimation: true,
                awaitCloseAnimation: true,
                debugMode: false
            });
        } catch (e) {
            console.error("MicroModal init failed", e);
        }
    },

    ensureModalStructure() {
        if (document.getElementById('modal-emg-call')) return;

        // Using a clean light-theme design for the report modal as per screenshot
        const modalHtml = `
            <div class="modal micromodal-slide" id="modal-emg-call" aria-hidden="true">
                <div class="modal__overlay" tabindex="-1" data-micromodal-close>
                    <div class="modal__container gnfc-modal-shell bg-white border border-gray-200 shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col" role="dialog" aria-modal="true" aria-labelledby="modal-emg-title">
                        
                        <!-- Header -->
                        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                    <i class="ph-fill ph-siren text-xl"></i>
                                </div>
                                <h2 id="modal-emg-title" class="text-sm font-bold text-gray-800 uppercase tracking-widest leading-none">Emergency Call Report</h2>
                            </div>
                            <button class="gnfc-modal-close text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close modal" data-micromodal-close>
                                <i class="ph-bold ph-x text-lg pointer-events-none"></i>
                            </button>
                        </div>

                        <div class="flex-1 flex flex-col overflow-hidden bg-white">
                            
                            <!-- Filters -->
                            <div class="px-6 py-4 border-b border-gray-100 shrink-0 bg-gray-50/50">
                                <div class="flex items-end gap-6 max-w-4xl">
                                    <div class="flex gap-4 w-full max-w-md">
                                        <div class="space-y-1.5 flex-1">
                                            <label class="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Start Date</label>
                                            <div class="relative">
                                                <input type="date" id="emg-start-date" 
                                                    class="w-full bg-white border border-gray-300 text-gray-700 text-xs rounded-sm px-3 py-2 pl-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-400">
                                            </div>
                                        </div>
                                        <div class="space-y-1.5 flex-1">
                                            <label class="text-[10px] font-bold text-blue-600 uppercase tracking-widest">End Date</label>
                                            <div class="relative">
                                                <input type="date" id="emg-end-date" 
                                                    class="w-full bg-white border border-gray-300 text-gray-700 text-xs rounded-sm px-3 py-2 pl-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-400">
                                            </div>
                                        </div>
                                    </div>
                                    <button onclick="EmgCallModal.applyFilters()"
                                        class="h-[34px] px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-sm shadow-sm transition-all uppercase tracking-wider flex items-center justify-center">
                                        GO
                                    </button>
                                </div>
                            </div>

                            <!-- Table Area -->
                            <div class="flex-1 overflow-auto bg-white">
                                <table class="w-full text-left border-collapse min-w-[900px]">
                                    <thead class="sticky top-0 z-10 bg-gray-50">
                                        <tr class="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">
                                            <th class="px-4 py-3 w-28 text-center border-r border-gray-100">Date</th>
                                            <th class="px-4 py-3 w-20 text-center border-r border-gray-100">Tech</th>
                                            <th class="px-4 py-3 w-28 font-mono text-center border-r border-gray-100">Tag No</th>
                                            <th class="px-4 py-3 w-36 border-r border-gray-100">Type of Job</th>
                                            <th class="px-6 py-3 border-r border-gray-100">Description</th>
                                            <th class="px-4 py-3 w-20 text-center">OT Hr</th>
                                        </tr>
                                    </thead>
                                    <tbody id="emg-table-body" class="text-xs font-sans text-gray-700"></tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="px-6 py-3 border-t border-gray-200 bg-white shrink-0 flex items-center justify-between text-[10px]">
                            <div class="flex items-center gap-4 text-gray-500">
                                <span>Showing <span id="emg-record-count" class="text-gray-900 font-bold">0</span> entries</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-gray-500 uppercase tracking-wider font-bold">Total Overtime:</span>
                                <span id="emg-total-hours" class="bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1 rounded-sm font-bold text-xs">0.0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    open() {
        this.init();
        try {
            MicroModal.show('modal-emg-call');
            this.updateTable();
        } catch (e) {
            console.error("MicroModal show failed, falling back", e);
            document.getElementById('modal-emg-call').classList.add('is-open');
        }
    },

    close() {
        try {
            MicroModal.close('modal-emg-call');
        } catch (e) {
            document.getElementById('modal-emg-call').classList.remove('is-open');
        }
    },

    render() {
        this.ensureSharedStyles();
        this.ensureModalStructure();
    },

    updateTable() {
        const tbody = document.getElementById('emg-table-body');
        const countEl = document.getElementById('emg-record-count');
        const totalHourEl = document.getElementById('emg-total-hours');

        if (!tbody) return;

        tbody.innerHTML = '';
        let totalHours = 0;

        if (this.filteredData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-20 text-center text-gray-400 italic text-sm">No emergency calls found for the selected range.</td></tr>`;
        } else {
            this.filteredData.forEach(item => {
                totalHours += item.otHour || 0;

                // Determine styling based on type (simple badge logic)
                let typeClass = "bg-orange-50 text-orange-600 border-orange-100";
                if (item.type.includes('MAINTENANCE')) typeClass = "bg-blue-50 text-blue-600 border-blue-100";

                const row = `
                    <tr class="hover:bg-gray-50 transition-colors border-b border-gray-100 group align-top">
                        <td class="px-4 py-4 text-center border-r border-gray-100 text-gray-500 whitespace-nowrap font-mono">${item.date}</td>
                        <td class="px-4 py-4 text-center border-r border-gray-100 font-bold text-gray-900">${item.tech}</td>
                        <td class="px-4 py-4 border-r border-gray-100 text-center font-bold text-blue-600 font-mono text-[11px]">${item.tag}</td>
                        <td class="px-4 py-4 border-r border-gray-100">
                            <span class="inline-block px-2 py-0.5 rounded-sm border ${typeClass} text-[9px] font-bold uppercase tracking-wide">
                                ${item.type}
                            </span>
                        </td>
                        <td class="px-6 py-4 border-r border-gray-100 text-gray-600 leading-relaxed text-[11px] font-sans">
                            <div class="line-clamp-4 hover:line-clamp-none transition-all">
                                ${item.desc}
                            </div>
                        </td>
                        <td class="px-4 py-4 text-center font-bold text-gray-900">${item.otHour.toFixed(1)}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        }

        if (countEl) countEl.innerText = this.filteredData.length;
        if (totalHourEl) totalHourEl.innerText = totalHours.toFixed(1);
    }
};
