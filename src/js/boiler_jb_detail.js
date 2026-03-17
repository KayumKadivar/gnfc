/**
 * boiler_jb_detail.js
 * Functional Architecture for Junction Box Detail Page
 * Prepared for .NET Backend Integration
 */

// --- Global State ---
let currentJB = null;
const fieldMap = {
    location:    { label: 'Location',     icon: 'ph-map-pin',      dbKey: 'location',    displayId: 'cc-location-val' },
    cableNo:     { label: 'Cable No',     icon: 'ph-cable-car',    dbKey: 'cableNo',     displayId: 'cc-cable-no' },
    cableType:   { label: 'Cable Type',   icon: 'ph-plugs',        dbKey: 'cableType',   displayId: 'cc-cable-type' },
    cabinet:     { label: 'Cabinet',      icon: 'ph-archive',      dbKey: 'cabinet',     displayId: 'cc-cabinet' },
    docNo:       { label: 'Document No',  icon: 'ph-file-text',    dbKey: 'docNo',       displayId: 'cc-doc-no' },
    drawingNo:   { label: 'Drawing No',   icon: 'ph-blueprint',    dbKey: 'drawingNo',   displayId: 'cc-drawing-no' },
    drawingName: { label: 'Drawing Name', icon: 'ph-pencil-ruler', dbKey: 'drawingName', displayId: 'cc-drawing-name' },
    excl:        { label: 'Excl',         icon: 'ph-shield-check', dbKey: 'excl',        displayId: 'cc-excl' }
};

// --- Initialization ---
function initPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const tagFromUrl = urlParams.get('tag');
    if (tagFromUrl) {
        const tagInput = document.getElementById('jb-tag-input');
        if (tagInput) tagInput.value = tagFromUrl;
    }

    // Auto-select first available JB if selected doesn't exist
    const sel = document.getElementById('jb-select');
    if (sel && window.JB_DATABASE) {
        if (!window.JB_DATABASE[sel.value]) {
            for (let o of sel.options) {
                if (window.JB_DATABASE[o.value]) {
                    o.selected = true;
                    break;
                }
            }
        }
    }

    jbFind();
}

// --- Data Operations ---
function jbFind() {
    const sel = document.getElementById('jb-select');
    if (!sel) return;
    
    const jbName = sel.value;
    // Fallback if data missing
    const data = (window.JB_DATABASE && window.JB_DATABASE[jbName]) ? window.JB_DATABASE[jbName] : (window.JB_DATABASE ? window.JB_DATABASE['ACJB-2'] : null);
    
    if (!data) return;
    currentJB = jbName;

    // UI Updates
    const banner = document.getElementById('alert-banner');
    if (banner) banner.style.display = 'none';
    
    document.getElementById('control-copy-section')?.classList.remove('hidden');
    document.getElementById('channel-table-section')?.classList.remove('hidden');

    // Populate Control Copy Card
    const jbNoDisplay = document.getElementById('cc-jb-no');
    if (jbNoDisplay) jbNoDisplay.textContent = jbName;

    Object.values(fieldMap).forEach(cfg => {
        const el = document.getElementById(cfg.displayId);
        if (el) el.textContent = data[cfg.dbKey] || '—';
    });

    renderChannelTable(data.channels);
}

function filterByTag() {
    // Standard mock implementation for now
    Swal.fire({
        icon: 'info',
        title: 'Search',
        text: 'Searching for tag: ' + document.getElementById('jb-tag-input')?.value,
        timer: 1500
    });
}

// --- Rendering Functions ---
function renderChannelTable(channels) {
    const tbody = document.getElementById('ch-table-body');
    if (!tbody) return;

    let html = '';
    channels.forEach((ch, ci) => {
        ch.rows.forEach((row, ri) => {
            html += `<tr>`;
            if (ri === 0) {
                html += `<td rowspan="${ch.rows.length}" class="jbd-ch-num">${ch.ch}</td>`;
                html += `<td rowspan="${ch.rows.length}" style="vertical-align:top; padding-top:0.375rem;">`;
                html += `<input type="text" class="jbd-tbl-input" value="${row.tag || ''}" data-ch="${ci}" data-row="${ri}" data-field="tag">`;
                html += `</td>`;
            }
            html += `<td><input type="text" class="jbd-tbl-input" value="${row.func || ''}" data-ch="${ci}" data-row="${ri}" data-field="func"></td>`;
            html += `<td><input type="text" class="jbd-tbl-input jbd-tbl-input-sm" value="${row.jbTerm || ''}" data-ch="${ci}" data-row="${ri}" data-field="jbTerm"></td>`;
            html += `<td><input type="text" class="jbd-tbl-input" value="${row.cabTerm || ''}" data-ch="${ci}" data-row="${ri}" data-field="cabTerm"></td>`;
            html += `<td><input type="text" class="jbd-tbl-input jbd-tbl-input-sm" value="${row.cabStrip || ''}" data-ch="${ci}" data-row="${ri}" data-field="cabStrip"></td>`;
            html += `</tr>`;
        });
    });

    tbody.innerHTML = html;
    const countEl = document.getElementById('ch-record-count');
    if (countEl) countEl.textContent = channels.length + ' Channels';
}

function renderJBIndex() {
    const tbody = document.getElementById('jb-index-body');
    if (!tbody || !window.JB_INDEX_DATA) return;

    let html = '';
    let sr = 0;

    window.JB_INDEX_DATA.forEach((group, gi) => {
        html += `<tr class="jbd-group-row"><td colspan="6">${group.group}</td></tr>`;
        group.items.forEach((item, ii) => {
            sr++;
            html += `<tr class="h-auto">
                <td class="text-center fw-bold py-2 px-1 font-13px">${sr}</td>
                <td class="fw-bold color-blue py-2 px-[6px] font-13px">${item.jb}</td>
                <td class="jbd-idx-cell-loc py-2 px-2 cursor-pointer" onclick="openIdxLocationModal(${gi},${ii})">
                    <span class="flex items-center gap-[5px]">
                        <i class="ph-bold ph-caret-right font-13px text-[#9aa7b5]"></i>
                        <span class="font-13px text-[var(--app-text,#e6edf3)]">${item.loc}</span>
                        <i class="ph-bold ph-pencil-simple font-13px opacity-40 ml-auto"></i>
                    </span>
                </td>
                <td class="jbd-idx-cell-cable py-2 px-[6px] text-center cursor-pointer" onclick="openIdxCableModal(${gi},${ii})">
                    <span class="inline-flex items-center gap-1">
                        <i class="ph-bold ph-caret-right font-13px text-[#9aa7b5]"></i>
                        <span class="font-13px">${item.cable}</span>
                        <i class="ph-bold ph-pencil-simple font-13px opacity-40"></i>
                    </span>
                </td>
                <td class="jbd-idx-cell-cab py-2 px-[6px] text-center cursor-pointer" onclick="openIdxCabinetModal(${gi},${ii})">
                    <span class="inline-flex items-center gap-1">
                        <i class="ph-bold ph-caret-right font-13px text-[#9aa7b5]"></i>
                        <span class="font-13px">${item.cab}</span>
                        <i class="ph-bold ph-pencil-simple font-13px opacity-40"></i>
                    </span>
                </td>
                <td class="py-2 px-1 text-center">
                    <button class="jbd-btn jbd-btn-blue font-13px py-0 h-[26px] px-[10px] gap-[3px]" onclick="previewJBSchedule('${item.jb}')">
                        <i class="ph-bold ph-printer"></i> Preview
                    </button>
                </td>
            </tr>`;
        });
    });

    tbody.innerHTML = html;
}

// --- General Modal Helpers ---
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) requestAnimationFrame(() => modal.classList.add('is-open'));
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('is-open');
}

// --- Specific Modal Functions ---
let editingField = null;

function openEditFieldModal(field) {
    if (!currentJB) return;
    const cfg = fieldMap[field];
    if (!cfg) return;
    
    editingField = field;
    const data = window.JB_DATABASE[currentJB];

    const titleEl = document.getElementById('ef-title');
    if (titleEl) titleEl.innerHTML = `Edit ${cfg.label}`;
    
    const subEl = document.getElementById('ef-subtitle');
    if (subEl) {
        const span = subEl.querySelector('span');
        if (span) span.textContent = currentJB;
    }
    
    document.getElementById('ef-label').textContent = cfg.label + ' :';
    const input = document.getElementById('ef-input');
    if (input) {
        input.placeholder = 'Enter ' + cfg.label.toLowerCase() + '...';
        input.value = data ? (data[cfg.dbKey] || '') : '';
    }

    openModal('modal-edit-field');
}

function openEditLocationModal() { openEditFieldModal('location'); }

function closeEditFieldModal() { closeModal('modal-edit-field'); }

function updateField() {
    if (!editingField) return;
    const cfg = fieldMap[editingField];
    const newVal = document.getElementById('ef-input').value.trim();
    
    if (currentJB && window.JB_DATABASE[currentJB]) {
        window.JB_DATABASE[currentJB][cfg.dbKey] = newVal;
        const display = document.getElementById(cfg.displayId);
        if (display) display.textContent = newVal || '—';
    }
    
    closeEditFieldModal();
    Swal.fire({
        icon: 'success', 
        title: 'Updated!',
        text: cfg.label + ' updated to "' + newVal + '"',
        confirmButtonColor: '#2563eb', 
        timer: 2000, 
        timerProgressBar: true
    });
}

// --- J B Index Edit Modals ---
let _idxEditItem = null;
let _idxEditJBName = null;

function openJBIndex() {
    renderJBIndex();
    openModal('modal-jb-index');
}

function closeJBIndexModal() { closeModal('modal-jb-index'); }

function openIdxLocationModal(gi, ii) {
    _idxEditItem = window.JB_INDEX_DATA[gi].items[ii];
    _idxEditJBName = _idxEditItem.jb;
    document.getElementById('idx-loc-jbno').textContent = _idxEditJBName;
    document.getElementById('idx-loc-input').value = _idxEditItem.loc;
    openModal('modal-idx-location');
}

function closeIdxLocationModal() { closeModal('modal-idx-location'); }

function saveIdxLocation() {
    const val = document.getElementById('idx-loc-input').value.trim();
    if (_idxEditItem) _idxEditItem.loc = val || _idxEditItem.loc;
    closeIdxLocationModal();
    renderJBIndex();
    Swal.fire({ icon: 'success', title: 'Location Updated', text: `Location for ${_idxEditJBName} updated.`, confirmButtonColor: '#2563eb', timer: 1800 });
}

function openIdxCableModal(gi, ii) {
    _idxEditItem = window.JB_INDEX_DATA[gi].items[ii];
    _idxEditJBName = _idxEditItem.jb;
    document.getElementById('idx-cable-jbno').textContent = _idxEditJBName;
    const sel = document.getElementById('idx-cable-select');
    if (sel) {
        for (let o of sel.options) { o.selected = (o.value === _idxEditItem.cable); }
    }
    openModal('modal-idx-cable');
}

function closeIdxCableModal() { closeModal('modal-idx-cable'); }

function saveIdxCable() {
    const val = document.getElementById('idx-cable-select').value;
    if (_idxEditItem) _idxEditItem.cable = val;
    closeIdxCableModal();
    renderJBIndex();
    Swal.fire({ icon: 'success', title: 'Cable Type Updated', text: `Cable Type for ${_idxEditJBName} set to "${val}".`, confirmButtonColor: '#2563eb', timer: 1800 });
}

function openIdxCabinetModal(gi, ii) {
    _idxEditItem = window.JB_INDEX_DATA[gi].items[ii];
    _idxEditJBName = _idxEditItem.jb;
    document.getElementById('idx-cab-jbno').textContent = _idxEditJBName;
    document.getElementById('idx-cab-input').value = _idxEditItem.cab;
    openModal('modal-idx-cabinet');
}

function closeIdxCabinetModal() { closeModal('modal-idx-cabinet'); }

function saveIdxCabinet() {
    const val = document.getElementById('idx-cab-input').value.trim();
    if (_idxEditItem) _idxEditItem.cab = val || _idxEditItem.cab;
    closeIdxCabinetModal();
    renderJBIndex();
    Swal.fire({ icon: 'success', title: 'Cabinet Updated', text: `Cabinet for ${_idxEditJBName} set to "${val}".`, confirmButtonColor: '#2563eb', timer: 1800 });
}

// --- Preview & Report ---
function previewJBSchedule(jbName) {
    const sel = document.getElementById('jb-select');
    if (sel) {
        for (let o of sel.options) {
            if (o.value === jbName) { o.selected = true; break; }
        }
    }
    jbFind();
    generateReport();
}

function generateReport() { openModal('modal-jb-schedule'); }

function closeJBScheduleModal() { closeModal('modal-jb-schedule'); }

function runJBScheduleReport() {
    const chFrom = document.getElementById('jbs-ch-from').value;
    const chTo = document.getElementById('jbs-ch-to').value;
    const reportType = document.getElementById('jbs-report-type').value;
    closeJBScheduleModal();
    Swal.fire({
        icon: 'success', 
        title: 'Report Generated',
        text: `Channel ${chFrom} to ${chTo} — ${reportType}`,
        confirmButtonColor: '#2563eb', 
        timer: 2500
    });
}

// --- Control Copy ---
function markAsControlCopy() {
    const jbDisplay = document.getElementById('cc-modal-jb-no');
    if (jbDisplay) jbDisplay.textContent = currentJB;
    openModal('modal-control-copy');
}

function closeControlCopyModal() { closeModal('modal-control-copy'); }

function confirmControlCopy() {
    closeControlCopyModal();
    Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `${currentJB} marked as Control Copy.`,
        confirmButtonColor: '#2563eb',
        timer: 1800
    });
}

// --- JBDB Update (InsBl) ---
function updateFromInsBl() {
    const jbLabel = currentJB || '—';
    document.getElementById('insbl-jb-no').textContent = jbLabel;
    document.getElementById('insbl-all-jb').checked = false;
    openModal('modal-insbl-update');
}

function closeInsBlModal() { closeModal('modal-insbl-update'); }

function runInsBlUpdate() {
    const allJB = document.getElementById('insbl-all-jb').checked;
    closeInsBlModal();
    Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: allJB ? 'All JBs updated from InsBl database.' : `J B ${currentJB || ''} updated from InsBl database.`,
        confirmButtonColor: '#2563eb',
        timer: 2500
    });
}

// --- Add JB ---
function openAddJBModal() {
    document.getElementById('add-jb-no').value = '';
    document.getElementById('add-jb-type').selectedIndex = 0;
    document.getElementById('add-jb-node').value = '';
    document.getElementById('add-jb-cable').value = '';
    document.getElementById('add-jb-cabinet').value = '';
    document.getElementById('add-jb-loc').value = '';
    openModal('modal-add-jb');
}

function closeAddJBModal() { closeModal('modal-add-jb'); }

function submitAddJB() {
    const jbNo = document.getElementById('add-jb-no').value.trim();
    if (!jbNo) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'New J B No is required', confirmButtonColor: '#2563eb' });
        return;
    }
    closeAddJBModal();
    Swal.fire({ icon: 'success', title: 'J B Added', text: `${jbNo} has been created successfully.`, confirmButtonColor: '#2563eb', timer: 1800 });
}

// --- Tag Editing ---
let editingTagCh = null;
let editingTagRow = null;

function openEditTagModal(ch, rowIdx) {
    if (!currentJB) return;
    editingTagCh = ch;
    editingTagRow = rowIdx;
    document.getElementById('et-subtitle').textContent = 'J B No : ' + currentJB;

    const data = window.JB_DATABASE[currentJB];
    if (data) {
        const channel = data.channels.find(c => c.ch === ch);
        if (channel && channel.rows[rowIdx]) {
            const currentTag = channel.rows[rowIdx].tag;
            const sel = document.getElementById('et-tag-select');
            for (let o of sel.options) { o.selected = (o.value === currentTag); }
        }
    }
    document.getElementById('et-update-revision').checked = false;
    openModal('modal-edit-tag');
}

function closeEditTagModal() { closeModal('modal-edit-tag'); }

function updateTag() {
    const newTag = document.getElementById('et-tag-select').value;
    if (currentJB && window.JB_DATABASE[currentJB] && editingTagCh !== null) {
        const channel = window.JB_DATABASE[currentJB].channels.find(c => c.ch === editingTagCh);
        if (channel && channel.rows[editingTagRow]) {
            channel.rows[editingTagRow].tag = newTag;
        }
    }
    closeEditTagModal();
    jbFind();
    Swal.fire({ icon: 'success', title: 'Tag Updated!', text: 'Tag set to "' + newTag + '"', confirmButtonColor: '#2563eb', timer: 2000 });
}

// --- Event Listeners ---
window.addEventListener('DOMContentLoaded', initPage);
