/**
 * User Privilege View — Lookup privileges for a specific user
 */
const UserPrivilegeView = (() => {
    'use strict';

    function filterRows(filterText) {
        const query = String(filterText || '').trim().toLowerCase();
        if (!query) return AdminData.userPrivilegeRows.slice();
        return AdminData.userPrivilegeRows.filter(row =>
            row.ec.toLowerCase().includes(query) ||
            row.name.toLowerCase().includes(query) ||
            row.group.toLowerCase().includes(query)
        );
    }

    function buildSelectOptions(rows, selectedEc) {
        const selected = String(selectedEc || '').trim();
        if (!rows.length) return '<option value="">No records found</option>';
        return rows.map(row => {
            const label = `${row.ec}    ${row.name}    ${row.group}`;
            const isSel = row.ec === selected ? ' selected' : '';
            return `<option value="${AdminUtils.escapeHtml(row.ec)}"${isSel}>${AdminUtils.escapeHtml(label)}</option>`;
        }).join('');
    }

    function getUserByEc(ec) {
        const ecTrimmed = String(ec || '').trim();
        return AdminData.userPrivilegeRows.find(r => r.ec === ecTrimmed) || null;
    }

    function showUserPlantsPrivilege(user) {
        const plants = AdminData.userPlantsPrivilegePlantRows;
        const userPlants = AdminData.userPlantsPrivilegeByEc.get(user.ec) || new Set();
        const userName = String(user.name || '').replace(/-/g, '').trim().toUpperCase() || 'USER';

        const html = `
      <div class="admin-modal-overlay" data-close-modal></div>
      <div class="admin-modal-center">
        <div class="admin-modal-box w-full max-w-4xl">
          <div class="admin-modal-header">
            <h3>User Privilege — ${AdminUtils.escapeHtml(userName)} (${AdminUtils.escapeHtml(user.ec)})</h3>
            <button type="button" class="admin-btn admin-btn-sm" data-close-modal>Close</button>
          </div>
          <div class="admin-modal-body">
            <div class="admin-table-scroll" style="max-height:52vh">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th class="admin-table-head">Plant</th>
                    <th class="admin-table-head">Code</th>
                    <th class="admin-table-head text-center">Access</th>
                  </tr>
                </thead>
                <tbody>
                  ${plants.map(p => `
                    <tr class="admin-table-row">
                      <td class="admin-table-cell">${AdminUtils.escapeHtml(p.name)}</td>
                      <td class="admin-table-cell typo-mono">${AdminUtils.escapeHtml(p.code)}</td>
                      <td class="admin-table-cell text-center">
                        <input type="checkbox" class="admin-checkbox" data-plant-code="${AdminUtils.escapeHtml(p.code)}"${userPlants.has(p.code) ? ' checked' : ''}>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            <div class="admin-btn-row mt-4">
              <button type="button" class="admin-btn admin-btn-primary" id="userPrivilegeSaveBtn">
                <i class="ph ph-floppy-disk"></i> Save
              </button>
              <button type="button" class="admin-btn admin-btn-secondary" data-close-modal>Close</button>
            </div>
          </div>
        </div>
      </div>
    `;

        AdminUtils.openModal(html);
        const root = document.getElementById('adminModalRoot');
        if (!root) return;

        root.querySelectorAll('[data-close-modal]').forEach(el => {
            el.addEventListener('click', () => AdminUtils.closeModal());
        });

        const saveBtn = document.getElementById('userPrivilegeSaveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const checked = new Set();
                root.querySelectorAll('[data-plant-code]:checked').forEach(cb => checked.add(cb.dataset.plantCode));
                AdminData.userPlantsPrivilegeByEc.set(user.ec, checked);
                AdminUtils.closeModal();
            });
        }
    }

    function render() {
        const rows = AdminData.userPrivilegeRows.slice();
        const selectedEc = rows[0]?.ec || '';

        return `
      ${AdminUtils.renderTopBar('User Privilege')}
      <div class="admin-card">
        <div class="admin-form-row-3">
          <div>
            <label for="userPrivilegeFilter" class="admin-form-label">Filter</label>
            <input id="userPrivilegeFilter" type="text" class="admin-input" placeholder="Search EC / Name...">
          </div>
          <div>
            <label for="userPrivilegeSelect" class="admin-form-label">EC Number</label>
            <select id="userPrivilegeSelect" class="admin-select">
              <option value="">Select EC Number</option>
              ${buildSelectOptions(rows, selectedEc)}
            </select>
          </div>
          <div class="flex items-end">
            <button id="userPrivilegeGo" type="button" class="admin-btn admin-btn-primary">
              <i class="ph ph-arrow-right"></i> Go
            </button>
          </div>
        </div>
      </div>
    `;
    }

    function bind() {
        const filterInput = document.getElementById('userPrivilegeFilter');
        const ecSelect = document.getElementById('userPrivilegeSelect');
        const goButton = document.getElementById('userPrivilegeGo');
        if (!filterInput || !ecSelect || !goButton) return;

        const applyFilter = () => {
            const rows = filterRows(filterInput.value);
            const preferredEc = String(ecSelect.value || '').trim();
            const hasPreferred = rows.some(r => r.ec === preferredEc);
            const selectedEc = hasPreferred ? preferredEc : (rows[0]?.ec || '');
            ecSelect.innerHTML = '<option value="">Select EC Number</option>' + buildSelectOptions(rows, selectedEc);
            ecSelect.value = selectedEc;
        };

        const openSelected = () => {
            const filteredRows = filterRows(filterInput.value);
            const selectedUser = getUserByEc(ecSelect.value) || filteredRows[0] || null;
            if (!selectedUser) return;
            showUserPlantsPrivilege(selectedUser);
        };

        goButton.addEventListener('click', openSelected);
        filterInput.addEventListener('input', applyFilter);
        filterInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); openSelected(); } });
        applyFilter();
    }

    return { render, bind };
})();

AdminRouter.register('user_privilege', UserPrivilegeView);
