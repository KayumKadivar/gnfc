/**
 * boiler_job_detail.js
 * OOP Architecture for JObDetail Page
 */

class JobDataManager {
    constructor() {
        this.db = window.JB_DATABASE || {};
        this.indexData = window.JB_INDEX_DATA || [];
        this.currentJob = null;
    }

    getJobData(jobName) {
        // Fallback to ACJB-2 or first available
        let data = this.db[jobName];
        if (!data) {
            const keys = Object.keys(this.db);
            if (keys.length > 0) {
                data = this.db[keys[0]];
                this.currentJob = keys[0];
            }
        } else {
            this.currentJob = jobName;
        }
        return data;
    }

    updateJobField(fieldKey, value) {
        if (this.currentJob && this.db[this.currentJob]) {
            this.db[this.currentJob][fieldKey] = value;
            return true;
        }
        return false;
    }

    updateTag(ch, rowIdx, newTag) {
        if (this.currentJob && this.db[this.currentJob] && ch !== null) {
            const channel = this.db[this.currentJob].channels.find(c => c.ch === ch);
            if (channel && channel.rows[rowIdx]) {
                channel.rows[rowIdx].tag = newTag;
                return true;
            }
        }
        return false;
    }

    getIndexItem(groupIndex, itemIndex) {
        if (this.indexData[groupIndex] && this.indexData[groupIndex].items[itemIndex]) {
            return this.indexData[groupIndex].items[itemIndex];
        }
        return null;
    }
}

class JobUIManager {
    constructor(dataManager, modalController) {
        this.data = dataManager;
        this.modals = modalController;

        this.fieldMap = {
            location:    { label: 'Location',     icon: 'ph-map-pin',      dbKey: 'location',    displayId: 'cc-location-val' },
            cableNo:     { label: 'Cable No',     icon: 'ph-cable-car',    dbKey: 'cableNo',     displayId: 'cc-cable-no' },
            cableType:   { label: 'Cable Type',   icon: 'ph-plugs',        dbKey: 'cableType',   displayId: 'cc-cable-type' },
            cabinet:     { label: 'Cabinet',      icon: 'ph-archive',      dbKey: 'cabinet',     displayId: 'cc-cabinet' },
            docNo:       { label: 'Document No',  icon: 'ph-file-text',    dbKey: 'docNo',       displayId: 'cc-doc-no' },
            drawingNo:   { label: 'Drawing No',   icon: 'ph-blueprint',    dbKey: 'drawingNo',   displayId: 'cc-drawing-no' },
            drawingName: { label: 'Drawing Name', icon: 'ph-pencil-ruler', dbKey: 'drawingName', displayId: 'cc-drawing-name' },
            excl:        { label: 'Excl',         icon: 'ph-shield-check', dbKey: 'excl',        displayId: 'cc-excl' }
        };
    }

    renderJobData(jobName) {
        const data = this.data.getJobData(jobName);
        if (!data) return;

        // Hide alert, show sections
        document.getElementById('alert-banner').style.display = 'none';
        document.getElementById('control-copy-section').classList.remove('hidden');
        document.getElementById('channel-table-section').classList.remove('hidden');

        // Populate Control Copy
        document.getElementById('cc-jb-no').textContent = this.data.currentJob;
        
        Object.values(this.fieldMap).forEach(cfg => {
            const el = document.getElementById(cfg.displayId);
            if (el) el.textContent = data[cfg.dbKey] || '—';
        });

        this.renderChannelTable(data.channels);
    }

    renderChannelTable(channels) {
        const tbody = document.getElementById('ch-table-body');
        let html = '';

        channels.forEach((ch, ci) => {
            ch.rows.forEach((row, ri) => {
                html += `<tr>`;
                if (ri === 0) {
                    html += `<td rowspan="${ch.rows.length}" class="text-center font-bold align-top pt-2 border-r border-gray-700/50 bg-blue-600/10 text-blue-400">${ch.ch}</td>`;
                    html += `<td rowspan="${ch.rows.length}" class="align-top pt-2">`;
                    html += `<input type="text" class="w-full bg-gray-900/50 border border-gray-700/50 rounded-sm px-2 py-1 text-xs font-bold text-gray-200 focus:outline-none focus:border-blue-500 hover:border-gray-600 transition-colors" value="${row.tag || ''}" data-ch="${ci}" data-row="${ri}" data-field="tag">`;
                    html += `</td>`;
                }
                html += `<td><input type="text" class="w-full bg-transparent border border-transparent hover:border-gray-700/50 focus:bg-gray-900/50 focus:border-blue-500 rounded-sm px-2 py-1 text-xs text-gray-300 transition-colors" value="${row.func || ''}" data-ch="${ci}" data-row="${ri}" data-field="func"></td>`;
                html += `<td><input type="text" class="w-full bg-transparent border border-transparent hover:border-gray-700/50 focus:bg-gray-900/50 focus:border-blue-500 rounded-sm px-2 py-1 text-xs text-gray-300 text-center transition-colors" style="width: 46px;" value="${row.jbTerm || ''}" data-ch="${ci}" data-row="${ri}" data-field="jbTerm"></td>`;
                html += `<td><input type="text" class="w-full bg-transparent border border-transparent hover:border-gray-700/50 focus:bg-gray-900/50 focus:border-blue-500 rounded-sm px-2 py-1 text-xs text-gray-300 transition-colors" value="${row.cabTerm || ''}" data-ch="${ci}" data-row="${ri}" data-field="cabTerm"></td>`;
                html += `<td><input type="text" class="w-full bg-transparent border border-transparent hover:border-gray-700/50 focus:bg-gray-900/50 focus:border-blue-500 rounded-sm px-2 py-1 text-xs text-gray-300 text-center transition-colors" style="width: 46px;" value="${row.cabStrip || ''}" data-ch="${ci}" data-row="${ri}" data-field="cabStrip"></td>`;
                html += `</tr>`;
            });
        });

        tbody.innerHTML = html;
        document.getElementById('ch-record-count').textContent = channels.length + ' Channels';
    }

    renderJobIndex() {
        const tbody = document.getElementById('jb-index-body');
        let html = '';
        let sr = 0;

        this.data.indexData.forEach((group, gi) => {
            html += `<tr class="bg-blue-600/10 font-extrabold text-[#9aa7b5] text-xs uppercase tracking-wider"><td colspan="6" class="px-3 py-2 border-b border-gray-700/50">${group.group}</td></tr>`;
            group.items.forEach((item, ii) => {
                sr++;
                html += `<tr>
                    <td class="text-center font-bold px-1 py-1 text-xs border-b border-gray-700/30">${sr}</td>
                    <td class="font-bold text-blue-400 px-2 py-1 text-xs border-b border-gray-700/30">${item.jb}</td>
                    <td class="px-2 py-1 border-b border-gray-700/30 cursor-pointer hover:bg-white/5 transition-colors group" onclick="app.modals.openIdxLocationModal(${gi},${ii})">
                        <span class="flex items-center gap-1.5">
                            <i class="ph-bold ph-caret-right text-[10px] text-[#9aa7b5]"></i>
                            <span class="text-xs text-gray-200">${item.loc}</span>
                            <i class="ph-bold ph-pencil-simple text-[10px] opacity-0 group-hover:opacity-100 text-gray-400 ml-auto transition-opacity"></i>
                        </span>
                    </td>
                    <td class="px-2 py-1 border-b border-gray-700/30 text-center cursor-pointer hover:bg-white/5 transition-colors group" onclick="app.modals.openIdxCableModal(${gi},${ii})">
                        <span class="inline-flex items-center gap-1.5">
                            <i class="ph-bold ph-caret-right text-[10px] text-[#9aa7b5]"></i>
                            <span class="text-xs text-gray-300">${item.cable}</span>
                            <i class="ph-bold ph-pencil-simple text-[10px] opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity"></i>
                        </span>
                    </td>
                    <td class="px-2 py-1 border-b border-gray-700/30 text-center cursor-pointer hover:bg-white/5 transition-colors group" onclick="app.modals.openIdxCabinetModal(${gi},${ii})">
                        <span class="inline-flex items-center gap-1.5">
                            <i class="ph-bold ph-caret-right text-[10px] text-[#9aa7b5]"></i>
                            <span class="text-xs text-gray-300">${item.cab}</span>
                            <i class="ph-bold ph-pencil-simple text-[10px] opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity"></i>
                        </span>
                    </td>
                    <td class="px-1 py-1 text-center border-b border-gray-700/30">
                        <button class="inline-flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded px-2.5 h-6 text-[11px] transition-colors" onclick="app.previewJBSchedule('${item.jb}')">
                            <i class="ph-bold ph-printer"></i> Preview
                        </button>
                    </td>
                </tr>`;
            });
        });

        tbody.innerHTML = html;
    }
}

class JobModalController {
    constructor(dataManager, uiManager) {
        this.data = dataManager;
        this.ui = uiManager;
    }

    _open(id) {
        const modal = document.getElementById(id);
        if (modal) requestAnimationFrame(() => modal.classList.add('is-open'));
    }

    _close(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove('is-open');
    }

    // -- Generic Edit Field
    openEditField(field) {
        const cfg = this.ui.fieldMap[field];
        if (!cfg || !this.data.currentJob) return;

        this.editingField = field;
        const data = this.data.getJobData(this.data.currentJob);

        document.getElementById('ef-title').innerHTML = `<i class="ph-bold ${cfg.icon} mr-1"></i> Edit ${cfg.label}`;
        document.getElementById('ef-subtitle').textContent = `JObNO : ${this.data.currentJob}`;
        document.getElementById('ef-label').textContent = cfg.label;
        document.getElementById('ef-input').placeholder = `Enter ${cfg.label.toLowerCase()}...`;
        document.getElementById('ef-input').value = data ? (data[cfg.dbKey] || '') : '';
        
        this._open('modal-edit-field');
    }

    saveEditField() {
        if (!this.editingField) return;
        const cfg = this.ui.fieldMap[this.editingField];
        const val = document.getElementById('ef-input').value.trim();

        if (this.data.updateJobField(cfg.dbKey, val)) {
            document.getElementById(cfg.displayId).textContent = val || '—';
        }

        this._close('modal-edit-field');
        Swal.fire({ icon: 'success', title: 'Updated!', text: `${cfg.label} updated to "${val}"`, confirmButtonColor: '#2563eb', timer: 2000, timerProgressBar: true });
    }

    // -- Control Copy
    openControlCopy() {
        document.getElementById('cc-modal-jb-no').textContent = this.data.currentJob;
        this._open('modal-control-copy');
    }

    confirmControlCopy() {
        this._close('modal-control-copy');
        Swal.fire({ icon: 'success', title: 'Success', text: `${this.data.currentJob} marked as Control Copy.`, confirmButtonColor: '#2563eb', timer: 1800, timerProgressBar: true });
    }

    // -- Index Modals
    openJobIndex() {
        this.ui.renderJobIndex();
        this._open('modal-jb-index');
    }

    openIdxLocationModal(gi, ii) {
        this._setupIdxEdit(gi, ii, 'modal-idx-location', 'idx-loc-jbno', 'idx-loc-input', 'loc');
    }
    
    openIdxCableModal(gi, ii) {
        this._setupIdxEdit(gi, ii, 'modal-idx-cable', 'idx-cable-jbno', 'idx-cable-select', 'cable', true);
    }
    
    openIdxCabinetModal(gi, ii) {
        this._setupIdxEdit(gi, ii, 'modal-idx-cabinet', 'idx-cab-jbno', 'idx-cab-input', 'cab');
    }

    _setupIdxEdit(gi, ii, modalId, jbId, inputId, dataKey, isSelect = false) {
        const item = this.data.getIndexItem(gi, ii);
        if (!item) return;

        this._idxEditItem = item;
        this._idxEditJOb = item.jb;
        
        document.getElementById(jbId).textContent = item.jb;
        const inputEl = document.getElementById(inputId);
        
        if (isSelect) {
            for (let o of inputEl.options) { o.selected = (o.value === item[dataKey]); }
        } else {
            inputEl.value = item[dataKey];
        }
        
        this._open(modalId);
    }

    saveIdxField(modalId, inputId, dataKey, label) {
        const val = document.getElementById(inputId).value.trim();
        if (this._idxEditItem) this._idxEditItem[dataKey] = val;
        this._close(modalId);
        this.openJobIndex();
        Swal.fire({ icon:'success', title:`${label} Updated`, text:`${label} for ${this._idxEditJOb} updated to "${val}".`, confirmButtonColor:'#2563eb', timer:1800, timerProgressBar:true });
    }

    // -- Other Modals
    openAddJob() {
        ['add-jb-no', 'add-jb-node', 'add-jb-cable', 'add-jb-cabinet', 'add-jb-loc'].forEach(id => {
            document.getElementById(id).value = '';
        });
        document.getElementById('add-jb-type').selectedIndex = 0;
        this._open('modal-add-jb');
    }

    submitAddJob() {
        const jbNo = document.getElementById('add-jb-no').value.trim();
        if (!jbNo) {
            Swal.fire({ icon:'error', title:'Error', text:'New JObNO is required', confirmButtonColor:'#2563eb' });
            return;
        }
        this._close('modal-add-jb');
        Swal.fire({ icon: 'success', title: 'JObAdded', text: `${jbNo} has been created successfully.`, confirmButtonColor: '#2563eb', timer: 1800, timerProgressBar: true });
    }

    openReport() { this._open('modal-jb-schedule'); }
    
    runReport() {
        const chFrom = document.getElementById('jbs-ch-from').value;
        const chTo = document.getElementById('jbs-ch-to').value;
        const reportType = document.getElementById('jbs-report-type').value;
        this._close('modal-jb-schedule');
        Swal.fire({ icon: 'success', title: 'Report Generated', text: `Channel ${chFrom} to ${chTo} — ${reportType}`, confirmButtonColor: '#2563eb', timer: 2500, timerProgressBar: true });
    }

    openInsBl() {
        document.getElementById('insbl-jb-no').textContent = this.data.currentJob || '—';
        document.getElementById('insbl-all-jb').checked = false;
        this._open('modal-insbl-update');
    }

    runInsBl() {
        const allJob = document.getElementById('insbl-all-jb').checked;
        this._close('modal-insbl-update');
        Swal.fire({ icon: 'success', title: 'Updated!', text: allJob ? 'All JBs updated from InsBl database.' : `JOb${this.data.currentJob || ''} updated from InsBl database.`, confirmButtonColor: '#2563eb', timer: 2500, timerProgressBar: true });
    }
}

class JobDetailApp {
    constructor() {
        this.data = new JobDataManager();
        this.modals = new JobModalController(this.data, null); // Set UI later
        this.ui = new JobUIManager(this.data, this.modals);
        this.modals.ui = this.ui; // circular reference for ease
    }

    init() {
        const urlParams = new URLSearchParams(window.location.search);
        const tagFromUrl = urlParams.get('tag');
        if (tagFromUrl) {
            document.getElementById('jb-tag-input').value = tagFromUrl;
        }

        // Bind global Find
        document.getElementById('jb-select').addEventListener('change', () => this.findJob());

        this.findJob();
    }

    findJob() {
        const jbName = document.getElementById('jb-select').value;
        this.ui.renderJobData(jbName);
    }

    previewJBSchedule(jobName) {
        this.modals._close('modal-jb-index');
        const sel = document.getElementById('jb-select');
        for (let o of sel.options) {
            if (o.value === jobName) { o.selected = true; break; }
        }
        this.findJob();
        this.modals.openReport();
    }
}

// Initialize Application
const app = new JobDetailApp();
window.addEventListener('DOMContentLoaded', () => {
    app.init();
});
