/**
 * Ex-DMS View — Ex-DMS Space management
 */
const ExDmsView = (() => {
  'use strict';

  function buildUserOptions(selectedEc) {
    const selected = String(selectedEc || '').trim();
    const rows = AdminUtils.getUserPlantsDirectoryRows();
    return rows.map(row => {
      const label = `${row.ec}:${String(row.userName || '').replace(/-/g, '').trim().toUpperCase()}`;
      const isSel = row.ec === selected ? ' selected' : '';
      return `<option value="${AdminUtils.escapeHtml(row.ec)}"${isSel}>${AdminUtils.escapeHtml(label)}</option>`;
    }).join('');
  }

  function render() {
    const selectedEc = AdminData.exDmsSelectedUserEc || AdminUtils.getUserPlantsDirectoryRows()[0]?.ec || '';
    return `
      ${AdminUtils.renderTopBar('Ex-DMS Space', 'ph-folder-open', 'External DMS space management')}
      <div class="admin-card">
        <div class="admin-form-section">
          <div class="admin-form-section-header">
            <div class="admin-form-section-icon" style="background: rgba(115,191,105,0.12); color: #73BF69">
              <i class="ph-bold ph-folder-plus"></i>
            </div>
            <div>
              <div class="admin-form-section-title">Create Ex-DMS Space</div>
              <div class="admin-form-section-desc">Select a user and create their external DMS space</div>
            </div>
          </div>
          <div class="admin-form-section-body">
            <div class="admin-field-group" style="max-width: 500px">
              <label for="exDmsUserSelect" class="admin-field-label"><i class="ph ph-user"></i> Select User</label>
              <select id="exDmsUserSelect" class="admin-select">${buildUserOptions(selectedEc)}</select>
            </div>
            <div class="admin-btn-row mt-4" style="justify-content: flex-start">
              <button id="exDmsCreateBtn" type="button" class="admin-btn admin-btn-primary">
                <i class="ph ph-folder-plus"></i> Create Space
              </button>
            </div>
            <p id="exDmsStatus" class="admin-status-badge success mt-3 opacity-0 transition-opacity"><i class="ph ph-check"></i> Space created</p>
          </div>
        </div>
      </div>
    `;
  }

  function bind() {
    const userSelect = document.getElementById('exDmsUserSelect');
    const createBtn = document.getElementById('exDmsCreateBtn');
    const status = document.getElementById('exDmsStatus');
    if (!userSelect || !createBtn) return;

    userSelect.addEventListener('change', () => {
      AdminData.exDmsSelectedUserEc = userSelect.value.trim();
    });

    createBtn.addEventListener('click', () => {
      AdminData.exDmsSelectedUserEc = userSelect.value.trim();
      if (status) {
        const opt = userSelect.options[userSelect.selectedIndex];
        status.textContent = `Space created for ${opt ? opt.text : AdminData.exDmsSelectedUserEc}`;
        status.classList.remove('opacity-0');
        setTimeout(() => status.classList.add('opacity-0'), 1800);
      }
    });
  }

  return { render, bind };
})();

AdminRouter.register('ex_dms_space', ExDmsView);
