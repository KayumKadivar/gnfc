/**
 * Admin Member View — Add/Remove users from admin group
 */
const AdminMemberView = (() => {
  'use strict';

  function render() {
    return `
      ${AdminUtils.renderTopBar('Admin Member', 'ph-users-three', 'Manage elevated admin group membership')}
      <div class="admin-card">
        <div class="admin-form-section">
          <div class="admin-form-section-header">
            <div class="admin-form-section-icon" style="background: rgba(20,184,166,0.12); color: #14b8a6">
              <i class="ph-bold ph-user-focus"></i>
            </div>
            <div>
              <div class="admin-form-section-title">Select Employee</div>
              <div class="admin-form-section-desc">Search and select a user to add or remove from the admin group</div>
            </div>
          </div>
          <div class="admin-form-section-body">
            <div class="admin-form-cols">
              <div class="admin-field-group">
                <label for="adminMemberFilter" class="admin-field-label"><i class="ph ph-magnifying-glass"></i> Filter</label>
                <input id="adminMemberFilter" type="text" class="admin-input" placeholder="Search by EC or Name...">
              </div>
              <div class="admin-field-group">
                <label for="adminMemberSelect" class="admin-field-label"><i class="ph ph-identification-card"></i> EC Number</label>
                <select id="adminMemberSelect" class="admin-select">
                  <option value="">Select EC Number</option>
                </select>
              </div>
            </div>
            <div class="admin-btn-row mt-4" style="justify-content: flex-start">
              <button id="adminMemberAddBtn" type="button" class="admin-btn admin-btn-primary">
                <i class="ph ph-user-plus"></i> Add To Admin Group
              </button>
              <button id="adminMemberRemoveBtn" type="button" class="admin-btn admin-btn-danger">
                <i class="ph ph-user-minus"></i> Remove From Admin Group
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function bind() {
    const filterInput = document.getElementById('adminMemberFilter');
    const ecSelect = document.getElementById('adminMemberSelect');
    const addBtn = document.getElementById('adminMemberAddBtn');
    const removeBtn = document.getElementById('adminMemberRemoveBtn');
    if (!filterInput || !ecSelect || !addBtn || !removeBtn) return;

    const applyFilter = () => {
      const rows = AdminUtils.filterUserPlantsDirectoryRows(filterInput.value);
      const preferred = String(ecSelect.value || '').trim();
      const hasPreferred = rows.some(r => r.ec === preferred);
      const selectedEc = hasPreferred ? preferred : (rows[0]?.ec || '');
      ecSelect.innerHTML = '<option value="">Select EC Number</option>' + AdminUtils.buildUserPlantsEcOptions(rows, selectedEc);
      ecSelect.value = selectedEc;
    };

    addBtn.addEventListener('click', () => {
      const ec = String(ecSelect.value || '').trim();
      if (ec) AdminData.adminMemberEcSet.add(ec);
    });

    removeBtn.addEventListener('click', () => {
      const ec = String(ecSelect.value || '').trim();
      if (ec) AdminData.adminMemberEcSet.delete(ec);
    });

    filterInput.addEventListener('input', applyFilter);
    filterInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addBtn.click(); } });
    applyFilter();
  }

  return { render, bind };
})();

AdminRouter.register('admin_member', AdminMemberView);
