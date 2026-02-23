/**
 * User Email View — Manage user email addresses
 */
const UserEmailView = (() => {
    'use strict';

    function render() {
        return `
      ${AdminUtils.renderTopBar('User Email Address')}
      <div class="admin-card">
        <h3 class="font-18px fw-bold color-primary text-center mb-4">User Email Address</h3>
        <div class="admin-form-row-3 max-w-3xl mx-auto">
          <div>
            <label for="userEmailFilter" class="admin-form-label">Filter</label>
            <input id="userEmailFilter" type="text" class="admin-input" placeholder="Search...">
          </div>
          <div>
            <label for="userEmailSelect" class="admin-form-label">EC Number</label>
            <select id="userEmailSelect" class="admin-select">
              <option value="">Select EC Number</option>
            </select>
          </div>
        </div>
        <div class="max-w-3xl mx-auto mt-3">
          <label for="userEmailInput" class="admin-form-label">Email</label>
          <input id="userEmailInput" type="email" class="admin-input" placeholder="Enter email address...">
        </div>
        <div class="admin-btn-row mt-4">
          <button id="userEmailUpdateBtn" type="button" class="admin-btn admin-btn-primary">
            <i class="ph ph-envelope"></i> Update
          </button>
        </div>
      </div>
    `;
    }

    function bind() {
        const filterInput = document.getElementById('userEmailFilter');
        const ecSelect = document.getElementById('userEmailSelect');
        const emailInput = document.getElementById('userEmailInput');
        const updateBtn = document.getElementById('userEmailUpdateBtn');
        if (!filterInput || !ecSelect || !emailInput || !updateBtn) return;

        const syncEmail = () => {
            const ec = String(ecSelect.value || '').trim();
            emailInput.value = ec ? String(AdminData.userEmailByEc.get(ec) || '') : '';
        };

        const applyFilter = () => {
            const rows = AdminUtils.filterUserPlantsDirectoryRows(filterInput.value);
            const preferred = String(ecSelect.value || '').trim();
            const hasPreferred = rows.some(r => r.ec === preferred);
            const selectedEc = hasPreferred ? preferred : (rows[0]?.ec || '');
            ecSelect.innerHTML = '<option value="">Select EC Number</option>' + AdminUtils.buildUserPlantsEcOptions(rows, selectedEc);
            ecSelect.value = selectedEc;
            syncEmail();
        };

        updateBtn.addEventListener('click', () => {
            const ec = String(ecSelect.value || '').trim();
            if (!ec) return;
            AdminData.userEmailByEc.set(ec, emailInput.value.trim());
        });

        ecSelect.addEventListener('change', syncEmail);
        filterInput.addEventListener('input', applyFilter);
        filterInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); updateBtn.click(); } });
        applyFilter();
    }

    return { render, bind };
})();

AdminRouter.register('user_email', UserEmailView);
