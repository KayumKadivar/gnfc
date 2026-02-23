/**
 * Privilege View — Master Privilege management
 * Add, filter, and view privilege records with a modal.
 */
const PrivilegeView = (() => {
    'use strict';

    let modalEscHandler = null;

    function render() {
        return `
      ${AdminUtils.renderTopBar('Master - Privilege')}
      <div class="admin-card">
        <div class="admin-form-grid">
          <label for="privilegeCodeInput" class="admin-form-label">Code</label>
          <input id="privilegeCodeInput" type="text" class="admin-input" placeholder="Enter code...">
          <label for="privilegeNameInput" class="admin-form-label">Name</label>
          <input id="privilegeNameInput" type="text" class="admin-input" placeholder="Enter name...">
        </div>
        <div class="admin-btn-row mt-4">
          <button id="privilegeAddBtn" type="button" class="admin-btn admin-btn-primary">
            <i class="ph ph-plus-circle"></i> Add
          </button>
          <button id="privilegeViewBtn" type="button" class="admin-btn admin-btn-secondary">
            <i class="ph ph-list-magnifying-glass"></i> View
          </button>
        </div>
      </div>
    `;
    }

    function filterRows(codeText, nameText) {
        const cq = String(codeText || '').trim().toLowerCase();
        const nq = String(nameText || '').trim().toLowerCase();
        return AdminData.privilegeMasterRows.filter(row =>
            (!cq || row.code.toLowerCase().includes(cq)) &&
            (!nq || row.name.toLowerCase().includes(nq))
        );
    }

    function buildTableRows(rows) {
        if (!rows.length) return `<tr><td colspan="3" class="admin-table-cell text-center color-hint py-4">No records found.</td></tr>`;
        return rows.map(row => `
      <tr class="admin-table-row">
        <td class="admin-table-cell text-center">
          <input type="radio" name="privilegeModalSelected" value="${AdminUtils.escapeHtml(row.code)}" class="admin-radio">
        </td>
        <td class="admin-table-cell font-semibold">${AdminUtils.escapeHtml(row.code)}</td>
        <td class="admin-table-cell">${AdminUtils.escapeHtml(row.name)}</td>
      </tr>
    `).join('');
    }

    function openModal(codeFilter, nameFilter) {
        const rows = filterRows(codeFilter, nameFilter);
        if (rows.length) rows[0]._selected = true;

        const html = `
      <div class="admin-modal-overlay" data-close-modal></div>
      <div class="admin-modal-center">
        <div class="admin-modal-box w-full max-w-3xl">
          <div class="admin-modal-header">
            <h3>Master - Privilege [ View ]</h3>
            <button type="button" class="admin-btn admin-btn-sm" data-close-modal>Close</button>
          </div>
          <div class="admin-modal-body">
            <div class="admin-table-scroll" style="max-height:340px">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th class="admin-table-head w-12"></th>
                    <th class="admin-table-head">Code</th>
                    <th class="admin-table-head">Name</th>
                  </tr>
                </thead>
                <tbody>${buildTableRows(rows)}</tbody>
              </table>
            </div>
            <div class="admin-btn-row mt-4">
              <button type="button" class="admin-btn admin-btn-danger" id="privilegeModalDeleteBtn">
                <i class="ph ph-trash"></i> Delete
              </button>
              <button type="button" class="admin-btn admin-btn-secondary" data-close-modal>Close</button>
            </div>
          </div>
        </div>
      </div>
    `;

        AdminUtils.openModal(html);
        bindModalClose();

        const deleteBtn = document.getElementById('privilegeModalDeleteBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => deleteBtn.blur());
        }
    }

    function bindModalClose() {
        const root = document.getElementById('adminModalRoot');
        if (!root) return;
        root.querySelectorAll('[data-close-modal]').forEach(el => {
            el.addEventListener('click', () => AdminUtils.closeModal());
        });
        if (modalEscHandler) document.removeEventListener('keydown', modalEscHandler);
        modalEscHandler = e => { if (e.key === 'Escape') AdminUtils.closeModal(); };
        document.addEventListener('keydown', modalEscHandler);
    }

    function bind() {
        const codeInput = document.getElementById('privilegeCodeInput');
        const nameInput = document.getElementById('privilegeNameInput');
        const addBtn = document.getElementById('privilegeAddBtn');
        const viewBtn = document.getElementById('privilegeViewBtn');
        if (!codeInput || !nameInput || !addBtn || !viewBtn) return;

        addBtn.addEventListener('click', () => {
            const code = codeInput.value.trim();
            const name = nameInput.value.trim();
            if (!code || !name) { codeInput.focus(); return; }
            const exists = AdminData.privilegeMasterRows.some(r => r.code === code);
            if (!exists) AdminData.privilegeMasterRows.push({ code, name });
            codeInput.value = ''; nameInput.value = '';
            codeInput.focus();
        });

        const openFilteredModal = () => openModal(codeInput.value, nameInput.value);
        viewBtn.addEventListener('click', openFilteredModal);
        codeInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); openFilteredModal(); } });
        nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); openFilteredModal(); } });
    }

    return { render, bind };
})();

AdminRouter.register('privilege', PrivilegeView);
