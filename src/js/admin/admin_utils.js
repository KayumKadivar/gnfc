/**
 * Admin Panel — Shared Utility Functions
 * Reusable helpers for all admin view modules.
 */
const AdminUtils = (() => {
    'use strict';

    /** Escape HTML entities for safe DOM insertion */
    function escapeHtml(value) {
        const text = String(value ?? '');
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /** Get value from localStorage with fallback */
    function getStoredValue(key, fallbackValue) {
        try {
            const value = localStorage.getItem(key);
            return value == null ? fallbackValue : value;
        } catch (e) { return fallbackValue; }
    }

    /** Set value in localStorage */
    function setStoredValue(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
    }

    /** Get parsed JSON from localStorage with fallback */
    function getStoredJsonValue(key, fallbackValue) {
        const raw = getStoredValue(key, '');
        if (!raw) return fallbackValue;
        try { return JSON.parse(raw); } catch (e) { return fallbackValue; }
    }

    /** Render the dark-themed top bar for each section */
    function renderTopBar(title, icon, subtitle) {
        const iconHtml = icon
            ? `<span class="admin-topbar-icon"><i class="ph ${escapeHtml(icon)}"></i></span>`
            : '';
        const subtitleHtml = subtitle
            ? `<span class="admin-topbar-subtitle">${escapeHtml(subtitle)}</span>`
            : '';
        return `
     <!-- <div class="admin-topbar">
        <span class="admin-topbar-label">MENU</span>
        <div class="admin-topbar-left">
          ${iconHtml}
          <div class="admin-topbar-text">
            <h2 class="admin-topbar-title">${escapeHtml(title)}</h2>
            ${subtitleHtml}
          </div>
        </div>
        <span></span> --!>
      </div>
    `;
    }

    /** Render permission checkbox rows for privilege tables */
    function renderPermissionRows(rows) {
        return rows.map(row => `
      <tr class="admin-table-row">
        <td class="admin-table-cell font-semibold">${escapeHtml(row.module)}</td>
        <td class="admin-table-cell text-center"><input type="checkbox" class="admin-checkbox"${row.add ? ' checked' : ''}></td>
        <td class="admin-table-cell text-center"><input type="checkbox" class="admin-checkbox"${row.modify ? ' checked' : ''}></td>
        <td class="admin-table-cell text-center"><input type="checkbox" class="admin-checkbox"${row.del ? ' checked' : ''}></td>
        <td class="admin-table-cell text-center"><input type="checkbox" class="admin-checkbox"${row.engRemark ? ' checked' : ''}></td>
        <td class="admin-table-cell text-center"><input type="checkbox" class="admin-checkbox"${row.exRemark ? ' checked' : ''}></td>
      </tr>
    `).join('');
    }

    /** Build <option> elements from rows */
    function buildSelectOptions(rows, valueFn, labelFn, selectedValue) {
        const selected = String(selectedValue || '').trim();
        if (!rows.length) return '<option value="">No records found</option>';
        return rows.map(row => {
            const val = valueFn(row);
            const lbl = labelFn(row);
            const isSel = val === selected ? ' selected' : '';
            return `<option value="${escapeHtml(val)}"${isSel}>${escapeHtml(lbl)}</option>`;
        }).join('');
    }

    /** Get group code from group name */
    function getUserInfoGroupCode(groupName) {
        const normalized = String(groupName || '').trim().toUpperCase();
        return AdminData.userInfoGroupCodeMap[normalized] || '';
    }

    /** Get consolidated user-plants directory rows */
    function getUserPlantsDirectoryRows() {
        const byEc = new Map();
        const pushRow = row => {
            const ec = String(row?.ec || '').trim();
            const userName = String(row?.userName || row?.name || '').trim();
            const group = String(row?.group || '').trim() || 'Tech';
            if (!ec || !userName) return;
            byEc.set(ec, { ec, userName, group });
        };
        AdminData.userPlantsLookupSeedRows.forEach(pushRow);
        AdminData.userPrivilegeRows.forEach(row => pushRow({ ec: row.ec, userName: row.name, group: row.group }));
        AdminData.userInfoRows.forEach(row => pushRow({ ec: row.ec, userName: row.userName, group: row.group }));
        const rows = Array.from(byEc.values());
        rows.sort((a, b) => {
            const an = parseInt(a.ec, 10), bn = parseInt(b.ec, 10);
            const aOk = Number.isFinite(an), bOk = Number.isFinite(bn);
            if (aOk && bOk && an !== bn) return an - bn;
            if (aOk !== bOk) return aOk ? -1 : 1;
            return a.ec.localeCompare(b.ec);
        });
        return rows;
    }

    /** Filter user plants directory rows */
    function filterUserPlantsDirectoryRows(filterText) {
        const query = String(filterText || '').trim().toLowerCase();
        const rows = getUserPlantsDirectoryRows();
        if (!query) return rows;
        return rows.filter(row =>
            row.ec.toLowerCase().includes(query) ||
            row.userName.toLowerCase().includes(query) ||
            row.group.toLowerCase().includes(query)
        );
    }

    /** Build user-plants EC select options with label */
    function buildUserPlantsEcOptions(rows, selectedEc) {
        const selected = String(selectedEc || '').trim();
        if (!rows.length) return '<option value="">No records found</option>';
        return rows.map(row => {
            const label = `${row.ec}    ${row.userName}    ${row.group}`;
            const isSel = row.ec === selected ? ' selected' : '';
            return `<option value="${escapeHtml(row.ec)}"${isSel}>${escapeHtml(label)}</option>`;
        }).join('');
    }

    /** Open the shared modal root */
    function openModal(html) {
        const root = document.getElementById('adminModalRoot');
        if (!root) return;
        root.innerHTML = html;
        root.classList.remove('hidden');
    }

    /** Close the shared modal root */
    function closeModal() {
        const root = document.getElementById('adminModalRoot');
        if (!root) return;
        root.classList.add('hidden');
        root.innerHTML = '';
    }

    /** Normalize module name */
    function normalizeModuleName(value) {
        return String(value || '').trim().replace(/\s+/g, ' ').toUpperCase().replace(/ /g, '_');
    }

    /** Format date as DD/MM/YYYY */
    function formatDateDDMMYYYY(dateValue) {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return '-';
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = String(date.getFullYear());
        return `${dd}/${mm}/${yyyy}`;
    }

    /** Upsert user privilege row from user info */
    function upsertUserPrivilegeRowFromUserInfo(userInfo) {
        const ec = String(userInfo?.ec || '').trim();
        if (!ec) return;
        const name = String(userInfo?.userName || '').trim();
        const group = String(userInfo?.group || '').trim() || 'Tech';
        const idx = AdminData.userPrivilegeRows.findIndex(r => r.ec === ec);
        if (idx === -1) { AdminData.userPrivilegeRows.push({ ec, name, group }); return; }
        AdminData.userPrivilegeRows[idx].name = name;
        AdminData.userPrivilegeRows[idx].group = group;
    }

    /** Remove user privilege row by EC */
    function removeUserPrivilegeRowByEc(ecNumber) {
        const ec = String(ecNumber || '').trim();
        if (!ec) return;
        const idx = AdminData.userPrivilegeRows.findIndex(r => r.ec === ec);
        if (idx !== -1) AdminData.userPrivilegeRows.splice(idx, 1);
    }

    return {
        escapeHtml,
        getStoredValue,
        setStoredValue,
        getStoredJsonValue,
        renderTopBar,
        renderPermissionRows,
        buildSelectOptions,
        getUserInfoGroupCode,
        getUserPlantsDirectoryRows,
        filterUserPlantsDirectoryRows,
        buildUserPlantsEcOptions,
        openModal,
        closeModal,
        normalizeModuleName,
        formatDateDDMMYYYY,
        upsertUserPrivilegeRowFromUserInfo,
        removeUserPrivilegeRowByEc,
    };
})();
