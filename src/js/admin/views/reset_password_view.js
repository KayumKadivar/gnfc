/**
 * Reset Password View — Reset user passwords
 */
const ResetPasswordView = (() => {
  'use strict';

  function render() {
    return `
      ${AdminUtils.renderTopBar('Reset Password', 'ph-arrow-counter-clockwise', 'Reset user passwords to default')}
      <div class="admin-card">
        <div class="admin-form-section">
          <div class="admin-form-section-header">
            <div class="admin-form-section-icon" style="background: rgba(242,73,92,0.12); color: #F2495C">
              <i class="ph-bold ph-arrow-counter-clockwise"></i>
            </div>
            <div>
              <div class="admin-form-section-title">Reset User Password</div>
              <div class="admin-form-section-desc">Select a user to reset their password to the default value</div>
            </div>
          </div>
          <div class="admin-form-section-body">
            <div class="admin-form-cols-3">
              <div class="admin-field-group">
                <label for="resetPasswordFilter" class="admin-field-label"><i class="ph ph-magnifying-glass"></i> Filter</label>
                <input id="resetPasswordFilter" type="text" class="admin-input" placeholder="Search by EC or Name...">
              </div>
              <div class="admin-field-group">
                <label for="resetPasswordSelect" class="admin-field-label"><i class="ph ph-identification-card"></i> EC Number</label>
                <select id="resetPasswordSelect" class="admin-select">
                  <option value="">Select EC Number</option>
                </select>
              </div>
              <button id="resetPasswordBtn" type="button" class="admin-btn admin-btn-danger">
                <i class="ph ph-arrow-counter-clockwise"></i> Reset
              </button>
            </div>
            <div class="admin-info-box mt-4" style="background: rgba(242,73,92,0.06); border-color: rgba(242,73,92,0.12)">
              <i class="ph ph-warning" style="color: #F2495C"></i>
              This will reset the selected user's password to <strong>123456</strong>. The user must change it on next login.
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function bind() {
    const $filterInput = $('#resetPasswordFilter');
    const $ecSelect = $('#resetPasswordSelect');
    const $resetBtn = $('#resetPasswordBtn');
    if (!$filterInput.length || !$ecSelect.length || !$resetBtn.length) return;

    const applyFilter = () => {
      const rows = AdminUtils.filterUserPlantsDirectoryRows($filterInput.val());
      const preferred = String($ecSelect.val() || '').trim();
      const hasPreferred = rows.some(r => r.ec === preferred);
      const selectedEc = hasPreferred ? preferred : (rows[0]?.ec || '');
      $ecSelect.html('<option value="">Select EC Number</option>' + AdminUtils.buildUserPlantsEcOptions(rows, selectedEc));
      $ecSelect.val(selectedEc);
    };

    $resetBtn.on('click', () => {
      const ec = String($ecSelect.val() || '').trim();
      if (!ec) return;
      AdminData.userPasswordByEc.set(ec, '123456');
    });

    $filterInput.on('input', applyFilter);
    $filterInput.on('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $resetBtn.trigger('click'); } });
    applyFilter();
  }

  return { render, bind };
})();

AdminRouter.register('reset_password', ResetPasswordView);
