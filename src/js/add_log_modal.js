const AddLogModal = {
    initialized: false,

    init() {
        this.ensureModalStructure();
        if (this.initialized) return;

        try {
            MicroModal.init({
                openTrigger: "data-micromodal-trigger",
                closeTrigger: "data-micromodal-close",
                disableScroll: true,
                disableFocus: false,
                awaitOpenAnimation: true,
                awaitCloseAnimation: true
            });
        } catch (e) {
            console.error("AddLogModal MicroModal init failed", e);
        }

        this.initialized = true;
    },

    ensureModalStructure() {
        if (document.getElementById("modal-add-log")) return;

        const modalHtml = `
            <div class="modal micromodal-slide" id="modal-add-log" aria-hidden="true">
                <div class="modal__overlay" tabindex="-1" data-micromodal-close>
                    <div class="modal__container w-full max-w-6xl border border-dark-border bg-dark-panel shadow-2xl overflow-hidden flex flex-col" role="dialog" aria-modal="true" aria-labelledby="modal-add-log-title">
                        <div class="bg-dark-header p-3 border-b border-dark-border flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-sm bg-gnfc-blue/15 border border-gnfc-blue/30 text-gnfc-blue flex items-center justify-center">
                                    <i class="ph-bold ph-clipboard-text text-lg"></i>
                                </div>
                                <div>
                                    <h2 id="modal-add-log-title" class="text-sm font-bold text-dark-text uppercase tracking-wider">Create Shift Log Entry</h2>
                                </div>
                            </div>
                            <button class="p-2 rounded-sm text-dark-muted hover:text-dark-text hover:bg-dark-border/50 transition-colors" aria-label="Close" data-micromodal-close>
                                <i class="ph-bold ph-x text-base pointer-events-none"></i>
                            </button>
                        </div>

                        <form id="add-log-form" onsubmit="AddLogModal.handleSubmit(event)" class="flex-1 flex flex-col min-h-0">
                            <div class="p-3 space-y-3 overflow-auto">
                                <div class="grid grid-cols-1 lg:grid-cols-12 gap-3">
                                    <div class="lg:col-span-3 bg-dark-bg border border-dark-border rounded-sm p-3 space-y-2">
                                        <label class="text-[10px] font-bold text-gnfc-blue uppercase tracking-wide">Date & Loop</label>
                                        <input id="add-log-date" name="logDate" type="date" required class="w-full bg-dark-panel border border-dark-border text-dark-text text-xs rounded-sm px-2 py-1.5 outline-none focus:border-gnfc-blue">
                                        <select id="add-log-loop" name="loopName" class="w-full bg-dark-panel border border-dark-border text-dark-text text-xs rounded-sm px-2 py-1.5 outline-none focus:border-gnfc-blue">
                                            <option value="N.A">N.A</option>
                                            <option value="FA">FA</option>
                                            <option value="MF">MF</option>
                                            <option value="DCS">DCS</option>
                                            <option value="UTIL">UTIL</option>
                                        </select>
                                    </div>

                                    <div class="lg:col-span-5 bg-dark-bg border border-dark-border rounded-sm p-3 space-y-2">
                                        <label class="text-[10px] font-bold text-gnfc-blue uppercase tracking-wide">InstTag</label>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <input id="add-log-tag" name="tagNo" type="text" placeholder="e.g. PT5087K" required class="w-full bg-dark-panel border border-dark-border text-dark-text text-xs rounded-sm px-2 py-1.5 outline-none focus:border-gnfc-blue">
                                            <input id="add-log-tag-detail" name="tagDetail" type="text" placeholder="Tag Detail" class="w-full bg-dark-panel border border-dark-border text-dark-text text-xs rounded-sm px-2 py-1.5 outline-none focus:border-gnfc-blue">
                                        </div>
                                    </div>

                                    <div class="lg:col-span-2 bg-dark-bg border border-dark-border rounded-sm p-3 space-y-2">
                                        <label class="text-[10px] font-bold text-gnfc-blue uppercase tracking-wide">Type Of Job</label>
                                        <select id="add-log-job-type" name="jobType" class="w-full bg-dark-panel border border-dark-border text-dark-text text-xs rounded-sm px-2 py-1.5 outline-none focus:border-gnfc-blue">
                                            <option value="Routine Check">Routine Check</option>
                                            <option value="PM">PM</option>
                                            <option value="Calibration">Calibration</option>
                                            <option value="Breakdown">Breakdown</option>
                                            <option value="Process Reqmt">Process Reqmt</option>
                                        </select>
                                    </div>

                                    <div class="lg:col-span-2 bg-dark-bg border border-dark-border rounded-sm p-3 space-y-2">
                                        <label class="text-[10px] font-bold text-gnfc-blue uppercase tracking-wide">Type Of Inst</label>
                                        <select id="add-log-inst-type" name="instType" class="w-full bg-dark-panel border border-dark-border text-dark-text text-xs rounded-sm px-2 py-1.5 outline-none focus:border-gnfc-blue">
                                            <option value="Field Instrument">Field Instrument</option>
                                            <option value="Control Valve">Control Valve</option>
                                            <option value="Analyzer">Analyzer</option>
                                            <option value="DCS">DCS</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="bg-dark-bg border border-dark-border rounded-sm p-3 space-y-2">
                                    <label class="text-[10px] font-bold text-gnfc-blue uppercase tracking-wide">Job Description</label>
                                    <textarea id="add-log-description" name="description" rows="5" required
                                        placeholder="Write the complete work details, observation and actions taken..."
                                        class="w-full bg-dark-panel border border-dark-border text-dark-text text-xs rounded-sm px-3 py-2 outline-none focus:border-gnfc-blue resize-y"></textarea>
                                </div>

                                <div class="grid grid-cols-1 lg:grid-cols-12 gap-3">
                                    <div class="lg:col-span-2 bg-dark-bg border border-dark-border rounded-sm p-3 space-y-2">
                                        <label class="text-[10px] font-bold text-gnfc-blue uppercase tracking-wide">Job Status</label>
                                        <select id="add-log-status" name="jobStatus" class="w-full bg-dark-panel border border-dark-border text-dark-text text-xs rounded-sm px-2 py-1.5 outline-none focus:border-gnfc-blue">
                                            <option value="OVER">OVER</option>
                                            <option value="PENDING">PENDING</option>
                                            <option value="WORKING">WORKING</option>
                                        </select>
                                    </div>

                                    <div class="lg:col-span-2 bg-dark-bg border border-dark-border rounded-sm p-3 space-y-2">
                                        <label class="text-[10px] font-bold text-gnfc-blue uppercase tracking-wide">Tech Name</label>
                                        <input id="add-log-tech" name="techName" type="text" value="ENG_TESTER" class="w-full bg-dark-panel border border-dark-border text-dark-text text-xs rounded-sm px-2 py-1.5 outline-none focus:border-gnfc-blue">
                                    </div>

                                    <div class="lg:col-span-2 bg-dark-bg border border-dark-border rounded-sm p-3 space-y-2">
                                        <label class="text-[10px] font-bold text-gnfc-blue uppercase tracking-wide">Eng</label>
                                        <input id="add-log-eng" name="engName" type="text" placeholder="Select ENG" class="w-full bg-dark-panel border border-dark-border text-dark-text text-xs rounded-sm px-2 py-1.5 outline-none focus:border-gnfc-blue">
                                    </div>

                                    <div class="lg:col-span-2 bg-dark-bg border border-dark-border rounded-sm p-3 space-y-2">
                                        <label class="text-[10px] font-bold text-gnfc-blue uppercase tracking-wide">Area</label>
                                        <select id="add-log-area" name="area" class="w-full bg-dark-panel border border-dark-border text-dark-text text-xs rounded-sm px-2 py-1.5 outline-none focus:border-gnfc-blue">
                                            <option value="N.A">N.A</option>
                                            <option value="FA">FA</option>
                                            <option value="MF">MF</option>
                                            <option value="DCS">DCS</option>
                                            <option value="UTIL">UTIL</option>
                                        </select>
                                    </div>

                                    <div class="lg:col-span-2 bg-dark-bg border border-dark-border rounded-sm p-3 space-y-2">
                                        <label class="text-[10px] font-bold text-gnfc-blue uppercase tracking-wide">Extra Duty</label>
                                        <div class="grid grid-cols-2 gap-2">
                                            <select id="add-log-ot-hr" name="extraHour" class="bg-dark-panel border border-dark-border text-dark-text text-xs rounded-sm px-2 py-1.5 outline-none focus:border-gnfc-blue">
                                                ${Array.from({ length: 13 }, (_, i) => `<option value="${i}">${i} Hr</option>`).join("")}
                                            </select>
                                            <select id="add-log-ot-min" name="extraMin" class="bg-dark-panel border border-dark-border text-dark-text text-xs rounded-sm px-2 py-1.5 outline-none focus:border-gnfc-blue">
                                                <option value="00">00 Min</option>
                                                <option value="15">15 Min</option>
                                                <option value="30">30 Min</option>
                                                <option value="45">45 Min</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div class="lg:col-span-2 bg-dark-bg border border-dark-border rounded-sm p-3">
                                        <label class="text-[10px] font-bold text-gnfc-blue uppercase tracking-wide block mb-2">Flags</label>
                                        <div class="space-y-2 text-xs text-dark-text">
                                            <label class="flex items-center gap-2 cursor-pointer select-none">
                                                <input type="checkbox" id="add-log-emergency" name="emergencyCall" class="accent-red-600">
                                                <span>Emergency Call</span>
                                            </label>
                                            <label class="flex items-center gap-2 cursor-pointer select-none">
                                                <input type="checkbox" id="add-log-mod-required" name="modificationRequired" class="accent-gnfc-blue">
                                                <span>Modification Required</span>
                                            </label>
                                            <label class="flex items-center gap-2 cursor-pointer select-none">
                                                <input type="checkbox" id="add-log-doc-required" name="docChangeRequired" class="accent-gnfc-orange">
                                                <span>Doc. Chg. Required</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div class="bg-dark-bg border border-dark-border rounded-sm p-3 space-y-2">
                                    <label class="text-[10px] font-bold text-gnfc-blue uppercase tracking-wide">Remarks</label>
                                    <input id="add-log-remarks" name="remarks" type="text" placeholder="Optional remarks..."
                                        class="w-full bg-dark-panel border border-dark-border text-dark-text text-xs rounded-sm px-3 py-2 outline-none focus:border-gnfc-blue">
                                </div>
                            </div>

                            <div class="bg-dark-header border-t border-dark-border p-3 flex items-center justify-between gap-3 shrink-0">
                                <p class="text-[10px] text-dark-muted uppercase tracking-wider">Entry will be added to current table view.</p>
                                <div class="flex items-center gap-2">
                                    <button type="button" data-micromodal-close
                                        class="px-4 py-1.5 text-xs font-bold border border-dark-border text-dark-muted hover:text-dark-text hover:bg-dark-border/50 rounded-sm transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit"
                                        class="px-4 py-1.5 text-xs font-bold bg-gnfc-blue hover:bg-blue-600 text-white rounded-sm border border-gnfc-blue/70 shadow-lg shadow-blue-500/20 transition-colors flex items-center gap-2">
                                        <i class="ph-bold ph-floppy-disk"></i>
                                        Save Entry
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML("beforeend", modalHtml);
    },

    open() {
        this.init();
        this.resetDefaults();

        try {
            MicroModal.show("modal-add-log");
        } catch (e) {
            const modal = document.getElementById("modal-add-log");
            if (modal) modal.classList.add("is-open");
        }
    },

    close() {
        try {
            MicroModal.close("modal-add-log");
        } catch (e) {
            const modal = document.getElementById("modal-add-log");
            if (modal) modal.classList.remove("is-open");
        }
    },

    resetDefaults() {
        const form = document.getElementById("add-log-form");
        if (!form) return;
        form.reset();

        const dateInput = document.getElementById("add-log-date");
        if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];

        const areaSelect = document.getElementById("add-log-area");
        if (areaSelect) areaSelect.value = "N.A";

        const loopSelect = document.getElementById("add-log-loop");
        if (loopSelect) loopSelect.value = "N.A";
    },

    formatDateToDDMMYYYY(value) {
        if (!value) return "";
        const [yyyy, mm, dd] = value.split("-");
        return `${dd}/${mm}/${yyyy}`;
    },

    nextSerial(view) {
        const list = (typeof plantLogData !== "undefined" && plantLogData[view]) ? plantLogData[view] : [];
        return String(list.length + 1).padStart(2, "0");
    },

    handleSubmit(event) {
        event.preventDefault();

        const form = event.target;
        const data = new FormData(form);

        const view = (typeof currentView !== "undefined" && currentView) ? currentView : "today";
        const targetView = (typeof plantLogData !== "undefined" && Array.isArray(plantLogData[view])) ? view : "today";

        if (typeof plantLogData === "undefined" || !Array.isArray(plantLogData[targetView])) {
            this.close();
            return;
        }

        const date = this.formatDateToDDMMYYYY(data.get("logDate"));
        const techName = (data.get("techName") || "").toString().trim() || "N.A";
        const status = (data.get("jobStatus") || "").toString().trim() || "PENDING";
        const jobType = (data.get("jobType") || "").toString().trim() || "General";
        const area = (data.get("area") || "").toString().trim() || "N.A";
        const tagNo = (data.get("tagNo") || "").toString().trim() || "N.A";
        const tagDetail = (data.get("tagDetail") || "").toString().trim() || "Detail";
        const remarks = (data.get("remarks") || "").toString().trim();
        const description = (data.get("description") || "").toString().trim();

        const emergency = document.getElementById("add-log-emergency")?.checked;
        const modRequired = document.getElementById("add-log-mod-required")?.checked;
        const docRequired = document.getElementById("add-log-doc-required")?.checked;
        const extraHour = data.get("extraHour") || "0";
        const extraMin = data.get("extraMin") || "00";

        const noteParts = [];
        if (remarks) noteParts.push(remarks);
        if (Number(extraHour) > 0 || Number(extraMin) > 0) noteParts.push(`OT ${extraHour}h ${extraMin}m`);
        if (emergency) noteParts.push("Emergency");
        if (modRequired) noteParts.push("Modification");
        if (docRequired) noteParts.push("Doc Change");

        const newEntry = {
            sr: this.nextSerial(targetView),
            date: date || "",
            area,
            tag: tagNo,
            tagSubtitle: tagDetail || "Detail",
            jobType,
            jobRef: `By:${techName} : ${date || "--/--/----"}`,
            tech: techName,
            desc: description,
            engineer: (data.get("engName") || "").toString().trim(),
            engInitials: "",
            status,
            statusColor: status.toUpperCase() === "OVER" ? "green" : "orange",
            remarks: noteParts.join(" | ")
        };

        plantLogData[targetView].unshift(newEntry);

        if (typeof plantLogTable !== "undefined" && plantLogTable && typeof plantLogTable.setData === "function") {
            plantLogTable.setData(plantLogData[targetView]);
        }

        this.close();
    }
};
