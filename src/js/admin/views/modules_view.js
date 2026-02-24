/**
 * Modules View — Module Master management
 */
const ModulesView = (() => {
  'use strict';

  function filterRows(nameText) {
    const query = String(nameText || '').trim().toLowerCase();
    if (!query) return AdminData.moduleMasterRows.slice();
    return AdminData.moduleMasterRows.filter(row => row.module.toLowerCase().includes(query));
  }

  function buildTableRows(rows) {
    if (!rows.length) return `<tr><td colspan="2" class="admin-table-cell text-center color-hint py-4">No modules found.</td></tr>`;
    return rows.map(row => `
      <tr class="admin-table-row">
        <td class="admin-table-cell text-center">
          <input type="radio" name="moduleModalSelected" value="${AdminUtils.escapeHtml(row.module)}" class="admin-radio">
        </td>
        <td class="admin-table-cell fw-semibold">${AdminUtils.escapeHtml(row.module)}</td>
      </tr>
    `).join('');
  }

  function openModal(nameFilter) {
    const rows = filterRows(nameFilter);

    const html = `
      <div class="admin-modal-overlay" data-close-modal></div>
      <div class="admin-modal-center">
        <div class="admin-modal-box w-full max-w-3xl">
          <div class="admin-modal-header">
            <h3>Master - Modules [ View ]</h3>
            <button type="button" class="admin-btn admin-btn-sm" data-close-modal><i class="ph-bold ph-x text-lg"></i></button>
          </div>
          <div class="admin-modal-body">
            <div class="admin-table-scroll" style="max-height:400px">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th class="admin-table-head w-12"></th>
                    <th class="admin-table-head">Module Name</th>
                  </tr>
                </thead>
                <tbody>${buildTableRows(rows)}</tbody>
              </table>
            </div>
            <div class="admin-btn-row mt-4">
              <button type="button" class="admin-btn admin-btn-danger" id="modulesModalDeleteBtn">
                <i class="ph ph-trash"></i> Delete
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

    root.querySelectorAll('[data-close-modal]').forEach(el =>
      el.addEventListener('click', () => AdminUtils.closeModal())
    );

    const deleteBtn = document.getElementById('modulesModalDeleteBtn');
    if (deleteBtn) deleteBtn.addEventListener('click', () => deleteBtn.blur());
  }

  function render() {
    return `
      ${AdminUtils.renderTopBar('Master - Modules', 'ph-squares-four', 'System module registry and configuration')}
      <div class="admin-card">
        <div class="admin-form-section">
          <div class="admin-form-section-header">
            <div class="admin-form-section-icon" style="background: rgba(255,153,0,0.12); color: #FF9900">
              <i class="ph-bold ph-plus-circle"></i>
            </div>
            <div>
              <div class="admin-form-section-title">Add / Search Module</div>
              <div class="admin-form-section-desc">Add a new system module or browse existing modules</div>
            </div>
          </div>
          <div class="admin-form-section-body">
            <div class="admin-field-group" style="max-width: 500px">
              <label for="moduleMasterNameInput" class="admin-field-label"><i class="ph ph-puzzle-piece"></i> Module Name</label>
              <input id="moduleMasterNameInput" type="text" class="admin-input" placeholder="Enter module name...">
            </div>
            <div class="admin-btn-row mt-4" style="justify-content: flex-start">
              <button id="moduleMasterAddBtn" type="button" class="admin-btn admin-btn-primary">
                <i class="ph ph-plus-circle"></i> Add
              </button>
              <button id="moduleMasterViewBtn" type="button" class="admin-btn admin-btn-secondary">
                <i class="ph ph-list-magnifying-glass"></i> View All
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function bind() {
    const nameInput = document.getElementById('moduleMasterNameInput');
    const addBtn = document.getElementById('moduleMasterAddBtn');
    const viewBtn = document.getElementById('moduleMasterViewBtn');
    if (!nameInput || !addBtn || !viewBtn) return;

    const openFiltered = () => openModal(nameInput.value);

    addBtn.addEventListener('click', () => {
      const moduleName = AdminUtils.normalizeModuleName(nameInput.value);
      if (!moduleName) { nameInput.focus(); return; }
      const exists = AdminData.moduleMasterRows.some(r => r.module.toLowerCase() === moduleName.toLowerCase());
      if (!exists) AdminData.moduleMasterRows.push({ module: moduleName });
      nameInput.value = ''; nameInput.focus();
    });

    viewBtn.addEventListener('click', openFiltered);
    nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); openFiltered(); } });
  }

  return { render, bind };
})();

AdminRouter.register('modules', ModulesView);
