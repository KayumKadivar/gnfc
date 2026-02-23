/**
 * Admin Member View — Add/Remove users from admin group
 */
const AdminMemberView = (() => {
    'use strict';

    function render() {
        return `
      ${AdminUtils.renderTopBar('Admin Member')}
      <div class="admin-card">
        <h3 class="font-18px fw-bold color-primary text-center mb-4">Admin Member</h3>
        <div class="admin-form-row-3 max-w-3xl mx-auto">
          <div>
            <label for="adminMemberFilter" class="admin-form-label">Filter</label>
            <input id="adminMemberFilter" type="text" class="admin-input" placeholder="Search...">
          </div>
          <div>
            <label for="adminMemberSelect" class="admin-form-label">EC Number</label>
            <select id="adminMemberSelect" class="admin-select">
              <option value="">Select EC Number</option>
            </select>
          </div>
        </div>
        <div class="admin-btn-row mt-4">
          <button id="adminMemberAddBtn" type="button" class="admin-btn admin-btn-primary">
            <i class="ph ph-user-plus"></i> Add To Admin Grp
          </button>
          <button id="adminMemberRemoveBtn" type="button" class="admin-btn admin-btn-danger">
            <i class="ph ph-user-minus"></i> Remove From Admin Grp
          </button>
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
