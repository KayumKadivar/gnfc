/**
 * Plants View — Plant Master CRUD
 * Add, view, update, delete plant records with modals.
 */
const PlantsView = (() => {
  'use strict';

  function filterRows(codeText, nameText) {
    const cq = String(codeText || '').trim().toLowerCase();
    const nq = String(nameText || '').trim().toLowerCase();
    return AdminData.plantMasterRows.filter(row =>
      (!cq || row.code.toLowerCase().includes(cq)) &&
      (!nq || row.name.toLowerCase().includes(nq))
    );
  }

  function buildTableRows(rows, selectedCode) {
    if (!rows.length) return `<tr><td colspan="3" class="admin-table-cell text-center color-hint py-4">No plant records found.</td></tr>`;
    const preferred = String(selectedCode || '').trim();
    return rows.map((row, i) => `
      <tr class="admin-table-row">
        <td class="admin-table-cell text-center">
          <input type="radio" name="plantModalSelected" value="${AdminUtils.escapeHtml(row.code)}" class="admin-radio"${(preferred && row.code === preferred) || (!preferred && i === 0) ? ' checked' : ''}>
        </td>
        <td class="admin-table-cell fw-semibold">${AdminUtils.escapeHtml(row.code)}</td>
        <td class="admin-table-cell">${AdminUtils.escapeHtml(row.name)}</td>
      </tr>
    `).join('');
  }

  function getSelectedPlant(rows) {
    if (!rows?.length) return null;
    const checked = document.querySelector('input[name="plantModalSelected"]:checked');
    const code = String(checked?.value || '').trim();
    if (code) { const r = rows.find(x => x.code === code); if (r) return r; }
    return rows[0] || null;
  }

  function openUpdateModal(plant, sourceRows) {
    const source = sourceRows?.length ? sourceRows : AdminData.plantMasterRows;
    const html = `
      <div class="admin-modal-overlay" data-close-modal></div>
      <div class="admin-modal-center">
        <div class="admin-modal-box w-full max-w-3xl">
          <div class="admin-modal-header">
            <h3>Master - Plant [ Update ]</h3>
            <button type="button" class="admin-btn admin-btn-sm" data-close-modal><i class="ph-bold ph-x text-lg"></i></button>
          </div>
          <div class="admin-modal-body">
            <div class="admin-form-grid">
              <label for="plantUpdateCode" class="admin-form-label">Plant Code</label>
              <input id="plantUpdateCode" type="text" value="${AdminUtils.escapeHtml(plant.code)}" readonly class="admin-input opacity-60">
              <label for="plantUpdateName" class="admin-form-label">Plant Name</label>
              <input id="plantUpdateName" type="text" value="${AdminUtils.escapeHtml(plant.name)}" class="admin-input" required>
            </div>
            <div class="admin-btn-row mt-4">
              <button id="plantUpdateSaveBtn" type="button" class="admin-btn admin-btn-primary">
                <i class="ph ph-floppy-disk"></i> Update
              </button>
              <button id="plantUpdateBackBtn" type="button" class="admin-btn admin-btn-secondary">
                <i class="ph ph-arrow-left"></i> Back
              </button>
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

    const backBtn = document.getElementById('plantUpdateBackBtn');
    const saveBtn = document.getElementById('plantUpdateSaveBtn');
    const nameInput = document.getElementById('plantUpdateName');

    const goBack = () => openListModal(source.map(r => ({ ...r })), plant.code);

    if (backBtn) backBtn.addEventListener('click', goBack);
    if (saveBtn && nameInput) {
      saveBtn.addEventListener('click', () => {
        const nextName = nameInput.value.trim();
        if (!nextName) { nameInput.focus(); return; }
        const plantRow = AdminData.plantMasterRows.find(r => r.code === plant.code);
        if (plantRow) plantRow.name = nextName;
        plant.name = nextName;
        goBack();
      });
    }
  }

  function openListModal(rows, selectedCode) {
    const html = `
      <div class="admin-modal-overlay" data-close-modal></div>
      <div class="admin-modal-center">
        <div class="admin-modal-box w-full max-w-4xl">
          <div class="admin-modal-header">
            <h3>Master - Plant [ View ]</h3>
            <button type="button" class="admin-btn admin-btn-sm" data-close-modal><i class="ph-bold ph-x text-lg"></i></button>
          </div>
          <div class="admin-modal-body">
            <div class="admin-table-scroll" style="max-height:360px">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th class="admin-table-head w-12"></th>
                    <th class="admin-table-head">Plant Code</th>
                    <th class="admin-table-head">Plant Name</th>
                  </tr>
                </thead>
                <tbody>${buildTableRows(rows, selectedCode)}</tbody>
              </table>
            </div>
            <div class="admin-btn-row mt-4">
              <button id="plantsModalUpdateBtn" type="button" class="admin-btn admin-btn-secondary">
                <i class="ph ph-pencil"></i> Update
              </button>
              <button id="plantsModalDeleteBtn" type="button" class="admin-btn admin-btn-danger">
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

    const updateBtn = document.getElementById('plantsModalUpdateBtn');
    const deleteBtn = document.getElementById('plantsModalDeleteBtn');

    if (updateBtn) {
      updateBtn.addEventListener('click', () => {
        const selected = getSelectedPlant(rows);
        if (selected) openUpdateModal({ ...selected }, rows);
      });
    }

    if (deleteBtn) deleteBtn.addEventListener('click', () => deleteBtn.blur());
  }

  function render() {
    return `
      ${AdminUtils.renderTopBar('Master - Plants', 'ph-factory', 'Plant master configuration and management')}
      <div class="admin-card">
        <div class="admin-form-section">
          <div class="admin-form-section-header">
            <div class="admin-form-section-icon" style="background: rgba(115,191,105,0.12); color: #73BF69">
              <i class="ph-bold ph-plus-circle"></i>
            </div>
            <div>
              <div class="admin-form-section-title">Add / Search Plant</div>
              <div class="admin-form-section-desc">Add a new plant or search existing plant records</div>
            </div>
          </div>
          <div class="admin-form-section-body">
            <div class="admin-form-cols">
              <div class="admin-field-group">
                <label for="plantCodeInput" class="admin-field-label"><i class="ph ph-hash"></i> Plant Code</label>
                <input id="plantCodeInput" type="text" class="admin-input" placeholder="Enter plant code...">
              </div>
              <div class="admin-field-group">
                <label for="plantNameInput" class="admin-field-label"><i class="ph ph-factory"></i> Plant Name</label>
                <input id="plantNameInput" type="text" class="admin-input" placeholder="Enter plant name...">
              </div>
            </div>
            <div class="admin-btn-row mt-4" style="justify-content: flex-start">
              <button id="plantsAddBtn" type="button" class="admin-btn admin-btn-primary">
                <i class="ph ph-plus-circle"></i> Add
              </button>
              <button id="plantsViewBtn" type="button" class="admin-btn admin-btn-secondary">
                <i class="ph ph-list-magnifying-glass"></i> View All
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function bind() {
    const codeInput = document.getElementById('plantCodeInput');
    const nameInput = document.getElementById('plantNameInput');
    const addBtn = document.getElementById('plantsAddBtn');
    const viewBtn = document.getElementById('plantsViewBtn');
    if (!codeInput || !nameInput || !viewBtn) return;

    const openFiltered = () => {
      const rows = filterRows(codeInput.value, nameInput.value);
      openListModal(rows);
    };

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        codeInput.value = ''; nameInput.value = ''; codeInput.focus();
      });
    }

    viewBtn.addEventListener('click', openFiltered);
    codeInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); openFiltered(); } });
    nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); openFiltered(); } });
  }

  return { render, bind };
})();

AdminRouter.register('plants', PlantsView);
