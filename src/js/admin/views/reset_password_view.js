/**
 * Reset Password View — Reset user passwords
 */
const ResetPasswordView = (() => {
    'use strict';

    function render() {
        return `
      ${AdminUtils.renderTopBar('Reset Password')}
      <div class="admin-card">
        <h3 class="font-18px fw-bold color-primary text-center mb-4">Reset Password</h3>
        <div class="admin-form-row-3 max-w-3xl mx-auto">
          <div>
            <label for="resetPasswordFilter" class="admin-form-label">Filter</label>
            <input id="resetPasswordFilter" type="text" class="admin-input" placeholder="Search...">
          </div>
          <div>
            <label for="resetPasswordSelect" class="admin-form-label">EC Number</label>
            <select id="resetPasswordSelect" class="admin-select">
              <option value="">Select EC Number</option>
            </select>
          </div>
          <div class="flex items-end">
            <button id="resetPasswordBtn" type="button" class="admin-btn admin-btn-danger">
              <i class="ph ph-arrow-counter-clockwise"></i> Reset
            </button>
          </div>
        </div>
      </div>
    `;
    }

    function bind() {
        const filterInput = document.getElementById('resetPasswordFilter');
        const ecSelect = document.getElementById('resetPasswordSelect');
        const resetBtn = document.getElementById('resetPasswordBtn');
        if (!filterInput || !ecSelect || !resetBtn) return;

        const applyFilter = () => {
            const rows = AdminUtils.filterUserPlantsDirectoryRows(filterInput.value);
            const preferred = String(ecSelect.value || '').trim();
            const hasPreferred = rows.some(r => r.ec === preferred);
            const selectedEc = hasPreferred ? preferred : (rows[0]?.ec || '');
            ecSelect.innerHTML = '<option value="">Select EC Number</option>' + AdminUtils.buildUserPlantsEcOptions(rows, selectedEc);
            ecSelect.value = selectedEc;
        };

        resetBtn.addEventListener('click', () => {
            const ec = String(ecSelect.value || '').trim();
            if (!ec) return;
            AdminData.userPasswordByEc.set(ec, '123456');
        });

        filterInput.addEventListener('input', applyFilter);
        filterInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); resetBtn.click(); } });
        applyFilter();
    }

    return { render, bind };
})();

AdminRouter.register('reset_password', ResetPasswordView);
