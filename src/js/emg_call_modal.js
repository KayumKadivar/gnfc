/**
 * EMG Call Modal Component
 * Handles the display and filtering of Emergency Call reports.
 */
const EmgCallModal = {
    isOpen: false,
    data: [
        { date: '17/09/2025', tech: 'NRL', tag: 'CX701', type: 'ABNORMALITY', desc: 'At 02:44 AM, CX701 tripped on LS9105AL, LS9105BL, and LS9105CL due to a low-level trip in D713 (Seal Oil Drum). Following the trip, the physical condition of LTB105 and LS9105 was inspected and found normal, with no abnormalities observed. Attempts were made to restore the oil level in D713, but the level did not rise. LV9105 was responding to control room (C/R) signals. Leak checks were performed, and the valve\'s physical condition was found satisfactory. The process team then attempted to fill the oil level using the bypass of LV9105, which resulted in the level of D713 rising. This created suspicion of a control valve (C/V) malfunction. The valve was removed from the line, and a water test was performed, which is found completely ok holding while valve close and water passing while valve open. To rule out process-side issues, the upstream (U/S) and downstream (D/S) lines were inspected. After starting the oil pump and opening the U/S isolation valve, no oil was observed at the open flange until approximately 50% valve opening. At this point, minor oil flow was detected, and upon subsequent closure of the isolation valve, full oil flow was established. The C/V was dismantled from the bonnet for detailed inspection. The plug, seat, and cage were found in good condition, and valve operation was confirmed satisfactory. The valve was reassembled with a new bonnet gasket, reinstalled, and the positioner was mounted. Stroke calibration was completed, and the valve was taken in line. No leakage was observed. The activity was carried out in coordination with Mr. PSG.', otHour: 0 },
        { date: '14/09/2025', tech: 'NRL', tag: 'MV1', type: 'ABNORMALITY', desc: 'process reported that valve getting open and close several times checked in detail and found it got open at 1st time --> 12:09:07 2nd time --> 12:09:17 3rd time --> 12:15:24 and 4th time --> 12:15:30 .Leakages are checked no leakages are found after that SOV forced from its bottom key and then relay is replaced(P0034 relay no. R0004). Connections are checked at marshalling and SOV no any abnormality is found. After relay replacement SOV key is normalized and taken in line. Jobs done with Mr.PSG,SIE(NKP), and IE(MAJ). Observation during abnormality is found.', otHour: 0 },
        { date: '11/10/2024', tech: 'NRL', tag: 'FT0210CD', type: 'DEFECT MAINTENANCE', desc: 'Process reported that its reading decreased to 22M3/Hr from 36M3/Hr, so checked at field and found on Tx. display reading showing 36M3/Hr and matching with other Tx. reading. Connected HART and showing 12mA which was same as all Tx. so on doubt base DCS channel simulation done and DCS channel found Ok. After ON/OFF Tx. it was giving 1.79mA in loop, so power module of Tx. changed but no improvement found. After that its 4-20mA cum sensor module changed and now in DCS showing Ok. Display module is also changed as it became black.', otHour: 0 },
        { date: '08/01/2024', tech: 'NRL', tag: 'C1001A', type: 'PROCESS REQMT', desc: 'Its loading unloading valve tubing connections are done. for simulation its logic was bypassed. simulation taken found Ok. logic taken in line.', otHour: 0 }
    ],
    filteredData: [],

    init() {
        this.filteredData = [...this.data];
        this.render();
    },

    open() {
        this.isOpen = true;
        this.init();
        document.body.style.overflow = 'hidden';
    },

    close() {
        this.isOpen = false;
        const modal = document.getElementById('emg-modal-overlay');
        if (modal) modal.remove();
        document.body.style.overflow = '';
    },

    applyFilters() {
        const start = document.getElementById('emg-start-date').value;
        const end = document.getElementById('emg-end-date').value;

        if (!start && !end) {
            this.filteredData = [...this.data];
        } else {
            this.filteredData = this.data.filter(item => {
                const [d, m, y] = item.date.split('/').map(Number);
                const itemDate = new Date(y, m - 1, d);

                if (start) {
                    const startDate = new Date(start);
                    startDate.setHours(0, 0, 0, 0);
                    if (itemDate < startDate) return false;
                }

                if (end) {
                    const endDate = new Date(end);
                    endDate.setHours(23, 59, 59, 999);
                    if (itemDate > endDate) return false;
                }

                return true;
            });
        }
        this.updateTable();
    },

    render() {
        const overlay = document.createElement('div');
        overlay.id = 'emg-modal-overlay';
        overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4';
        overlay.onclick = (e) => { if (e.target === overlay) this.close(); };

        const modal = `
            <div class="bg-dark-panel border border-dark-border rounded-sm shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                <!-- Header -->
                <div class="bg-[#22252B] px-6 py-4 border-b border-dark-border flex justify-between items-center shrink-0">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-grafana-red/20 flex items-center justify-center text-grafana-red">
                            <i class="ph-fill ph-siren text-xl animate-pulse"></i>
                        </div>
                        <div>
                            <h2 class="text-sm font-bold text-white uppercase tracking-widest">Emergency Call Report</h2>
                            <p class="text-[10px] text-dark-muted font-mono mt-0.5">INTERNAL SYSTEM AUDIT | LIVE FEED</p>
                        </div>
                    </div>
                    <button onclick="EmgCallModal.close()" class="p-2 hover:bg-white/5 rounded-full text-dark-muted hover:text-white transition-colors">
                        <i class="ph-bold ph-x text-lg"></i>
                    </button>
                </div>

                <!-- Filters -->
                <div class="p-6 bg-dark-bg/30 border-b border-dark-border shrink-0">
                    <div class="flex items-end gap-6 max-w-4xl">
                        <div class="flex-1 grid grid-cols-2 gap-4">
                            <div class="space-y-1.5">
                                <label class="text-[10px] font-bold text-grafana-blue uppercase tracking-widest">Start Date</label>
                                <div class="relative">
                                    <input type="date" id="emg-start-date" 
                                        class="w-full bg-dark-panel border border-dark-border text-white text-xs rounded-sm px-3 py-2 focus:border-grafana-blue outline-none transition-colors">
                                </div>
                            </div>
                            <div class="space-y-1.5">
                                <label class="text-[10px] font-bold text-grafana-blue uppercase tracking-widest">End Date</label>
                                <div class="relative">
                                    <input type="date" id="emg-end-date" 
                                        class="w-full bg-dark-panel border border-dark-border text-white text-xs rounded-sm px-3 py-2 focus:border-grafana-blue outline-none transition-colors">
                                </div>
                            </div>
                        </div>
                        <button onclick="EmgCallModal.applyFilters()"
                            class="h-9 px-8 bg-grafana-blue hover:bg-blue-600 text-white text-xs font-bold rounded-sm shadow-lg shadow-blue-500/10 transition-all flex items-center gap-2 uppercase tracking-wider">
                            <i class="ph-bold ph-magnifying-glass"></i> GO
                        </button>
                    </div>
                </div>

                <!-- Table Content -->
                <div class="flex-1 overflow-auto p-0">
                    <table class="w-full text-left border-collapse min-w-[1000px]">
                        <thead class="sticky top-0 z-10">
                            <tr class="bg-dark-header text-[10px] font-bold text-dark-muted uppercase tracking-widest border-b border-dark-border shadow-sm">
                                <th class="px-4 py-4 w-28 text-center border-r border-dark-border/30">Date</th>
                                <th class="px-4 py-4 w-20 text-center border-r border-dark-border/30">Tech</th>
                                <th class="px-4 py-4 w-32 border-r border-dark-border/30">Tag No</th>
                                <th class="px-4 py-4 w-40 border-r border-dark-border/30">Type of Job</th>
                                <th class="px-6 py-4 min-w-[400px] border-r border-dark-border/30">Description</th>
                                <th class="px-4 py-4 w-20 text-center">OT Hr</th>
                            </tr>
                        </thead>
                        <tbody id="emg-table-body" class="text-xs font-mono">
                            <!-- Rows injected by updateTable() -->
                        </tbody>
                    </table>
                </div>

                <!-- Footer Summary -->
                <div class="bg-[#22252B] px-6 py-3 border-t border-dark-border flex justify-between items-center text-[10px] shrink-0">
                    <div class="flex items-center gap-4">
                        <span class="text-dark-muted"><span id="emg-record-count" class="text-white font-bold">0</span> Records found</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-dark-muted uppercase tracking-wider">Total Extra Duty Hours:</span>
                        <span id="emg-total-hours" class="bg-grafana-orange/10 text-grafana-orange border border-grafana-orange/30 px-3 py-1 rounded font-bold">0.0</span>
                    </div>
                </div>
            </div>
        `;

        overlay.innerHTML = modal;
        document.body.appendChild(overlay);
        this.updateTable();
    },

    updateTable() {
        const tbody = document.getElementById('emg-table-body');
        const countEl = document.getElementById('emg-record-count');
        const totalHourEl = document.getElementById('emg-total-hours');

        if (!tbody) return;

        tbody.innerHTML = '';
        let totalHours = 0;

        if (this.filteredData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-20 text-center text-dark-muted italic text-sm">No emergency calls found for the selected range.</td></tr>`;
        } else {
            this.filteredData.forEach(item => {
                totalHours += item.otHour || 0;
                const row = `
                    <tr class="hover:bg-white/5 transition-colors border-b border-dark-border/20 group align-top">
                        <td class="px-4 py-4 text-center border-r border-dark-border/10 text-dark-muted whitespace-nowrap">${item.date}</td>
                        <td class="px-4 py-4 text-center border-r border-dark-border/10 font-bold text-white">${item.tech}</td>
                        <td class="px-4 py-4 border-r border-dark-border/10 font-bold text-grafana-blue">${item.tag}</td>
                        <td class="px-4 py-4 border-r border-dark-border/10">
                            <span class="inline-block px-2 py-0.5 rounded-sm bg-grafana-orange/10 text-grafana-orange border border-grafana-orange/20 text-[10px] font-bold">
                                ${item.type}
                            </span>
                        </td>
                        <td class="px-6 py-4 border-r border-dark-border/10 text-dark-text leading-relaxed text-[11px] font-sans">
                            <div class="max-h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-dark-border">
                                ${item.desc}
                            </div>
                        </td>
                        <td class="px-4 py-4 text-center font-bold text-white">${item.otHour.toFixed(1)}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        }

        if (countEl) countEl.innerText = this.filteredData.length;
        if (totalHourEl) totalHourEl.innerText = totalHours.toFixed(1);
    }
};
