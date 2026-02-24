/**
 * User Plants View — Lookup plants assigned to a user
 */
const UserPlantsView = (() => {
  'use strict';

  function render() {
    const rows = AdminUtils.getUserPlantsDirectoryRows();
    const selectedEc = rows[0]?.ec || '';

    return `
      ${AdminUtils.renderTopBar('User - Plants', 'ph-tree', 'Plant assignment mapping per user')}
      <div class="admin-card">
        <div class="admin-form-section">
          <div class="admin-form-section-header">
            <div class="admin-form-section-icon" style="background: rgba(115,191,105,0.12); color: #73BF69">
              <i class="ph-bold ph-user-focus"></i>
            </div>
            <div>
              <div class="admin-form-section-title">Select Employee</div>
              <div class="admin-form-section-desc">Choose a user to view their assigned plant list</div>
            </div>
          </div>
          <div class="admin-form-section-body">
            <div class="admin-form-cols-3">
              <div class="admin-field-group">
                <label for="userPlantsFilter" class="admin-field-label"><i class="ph ph-magnifying-glass"></i> Filter</label>
                <input id="userPlantsFilter" type="text" class="admin-input" placeholder="Search by EC or Name...">
              </div>
              <div class="admin-field-group">
                <label for="userPlantsSelect" class="admin-field-label"><i class="ph ph-identification-card"></i> EC Number</label>
                <select id="userPlantsSelect" class="admin-select">
                  <option value="">Select EC Number</option>
                  ${AdminUtils.buildUserPlantsEcOptions(rows, selectedEc)}
                </select>
              </div>
              <button id="userPlantsGoBtn" type="button" class="admin-btn admin-btn-primary">
                <i class="ph ph-eye"></i> View
              </button>
            </div>
            <div class="admin-info-box mt-4">
              <i class="ph ph-info"></i>
              Click <strong>View</strong> to see the plants assigned to this user.
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function showUserPlants(user) {
    const plants = AdminData.userPlantsPrivilegePlantRows;
    const userPlants = AdminData.userPlantsPrivilegeByEc.get(user.ec) || new Set();
    const userName = String(user.userName || '').replace(/-/g, '').trim().toUpperCase();

    const html = `
      <div class="admin-modal-overlay" data-close-modal></div>
      <div class="admin-modal-center">
        <div class="admin-modal-box w-full max-w-3xl">
          <div class="admin-modal-header">
            <h3>Plants — ${AdminUtils.escapeHtml(userName)} (${AdminUtils.escapeHtml(user.ec)})</h3>
            <button type="button" class="admin-btn admin-btn-sm" data-close-modal><i class="ph-bold ph-x text-lg"></i></button>
          </div>
          <div class="admin-modal-body">
            <div class="admin-table-scroll" style="max-height:52vh">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th class="admin-table-head">Plant</th>
                    <th class="admin-table-head">Code</th>
                    <th class="admin-table-head text-center">Assigned</th>
                  </tr>
                </thead>
                <tbody>
                  ${plants.map(p => `
                    <tr class="admin-table-row">
                      <td class="admin-table-cell">${AdminUtils.escapeHtml(p.name)}</td>
                      <td class="admin-table-cell font-15px fw-semibold ">${AdminUtils.escapeHtml(p.code)}</td>
                      <td class="admin-table-cell text-center">
                        <input type="checkbox" class="admin-checkbox" data-plant-code="${AdminUtils.escapeHtml(p.code)}"${userPlants.has(p.code) ? ' checked' : ''}>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            <div class="admin-btn-row mt-4">
              <button type="button" class="admin-btn admin-btn-secondary" data-close-modal>Close</button>
            </div>
          </div>
        </div>
      </div>
    `;

    AdminUtils.openModal(html);
    document.getElementById('adminModalRoot')?.querySelectorAll('[data-close-modal]').forEach(el =>
      el.addEventListener('click', () => AdminUtils.closeModal())
    );
  }

  function bind() {
    const filterInput = document.getElementById('userPlantsFilter');
    const ecSelect = document.getElementById('userPlantsSelect');
    const goBtn = document.getElementById('userPlantsGoBtn');
    if (!filterInput || !ecSelect || !goBtn) return;

    const applyFilter = () => {
      const rows = AdminUtils.filterUserPlantsDirectoryRows(filterInput.value);
      const preferred = String(ecSelect.value || '').trim();
      const hasPreferred = rows.some(r => r.ec === preferred);
      const selectedEc = hasPreferred ? preferred : (rows[0]?.ec || '');
      ecSelect.innerHTML = '<option value="">Select EC Number</option>' + AdminUtils.buildUserPlantsEcOptions(rows, selectedEc);
      ecSelect.value = selectedEc;
    };

    const goToUser = () => {
      const rows = AdminUtils.filterUserPlantsDirectoryRows(filterInput.value);
      const selectedUser = rows.find(r => r.ec === ecSelect.value) || rows[0] || null;
      if (selectedUser) showUserPlants(selectedUser);
    };

    goBtn.addEventListener('click', goToUser);
    filterInput.addEventListener('input', applyFilter);
    filterInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); goToUser(); } });
    applyFilter();
  }

  return { render, bind };
})();

AdminRouter.register('user_plants', UserPlantsView);
