/**
 * Change Password View — Admin password change form
 */
const ChangePasswordView = (() => {
  'use strict';

  function render() {
    return `
      ${AdminUtils.renderTopBar('Change Password', 'ph-key', 'Update admin credentials securely')}
      <div class="admin-card">
        <div class="admin-form-section">
          <div class="admin-form-section-header">
            <div class="admin-form-section-icon" style="background: rgba(255,153,0,0.12); color: #FF9900">
              <i class="ph-bold ph-key"></i>
            </div>
            <div>
              <div class="admin-form-section-title">Change Admin Password</div>
              <div class="admin-form-section-desc">Update the admin account password securely</div>
            </div>
          </div>
          <div class="admin-form-section-body">
            <div style="max-width: 500px">
              <div class="admin-field-group mb-4">
                <label class="admin-field-label"><i class="ph ph-user"></i> User</label>
                <input type="text" value="admin" readonly class="admin-input opacity-60">
              </div>
              <div class="admin-field-group mb-4">
                <label for="adminOldPassword" class="admin-field-label"><i class="ph ph-lock-key"></i> Old Password</label>
                <input id="adminOldPassword" type="password" class="admin-input" placeholder="Enter current password...">
              </div>
              <div class="admin-field-group mb-4">
                <label for="adminNewPassword" class="admin-field-label"><i class="ph ph-lock"></i> New Password</label>
                <input id="adminNewPassword" type="password" class="admin-input" placeholder="Enter new password...">
              </div>
              <div class="admin-field-group">
                <label for="adminConfirmPassword" class="admin-field-label"><i class="ph ph-check-circle"></i> Confirm New Password</label>
                <input id="adminConfirmPassword" type="password" class="admin-input" placeholder="Re-enter new password...">
              </div>
            </div>
            <div class="admin-btn-row mt-5" style="justify-content: flex-start">
              <button id="adminChangeSubmitBtn" type="button" class="admin-btn admin-btn-primary">
                <i class="ph ph-check-circle"></i> Submit
              </button>
              <button id="adminChangeResetBtn" type="button" class="admin-btn admin-btn-secondary">
                <i class="ph ph-arrow-counter-clockwise"></i> Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function bind() {
    const oldPass = document.getElementById('adminOldPassword');
    const newPass = document.getElementById('adminNewPassword');
    const confirmPass = document.getElementById('adminConfirmPassword');
    const submitBtn = document.getElementById('adminChangeSubmitBtn');
    const resetBtn = document.getElementById('adminChangeResetBtn');
    if (!oldPass || !newPass || !confirmPass || !submitBtn || !resetBtn) return;

    const clearForm = () => { oldPass.value = ''; newPass.value = ''; confirmPass.value = ''; oldPass.focus(); };

    submitBtn.addEventListener('click', () => {
      if (!oldPass.value || oldPass.value !== AdminData.adminCurrentPassword) { oldPass.focus(); return; }
      if (!newPass.value) { newPass.focus(); return; }
      if (newPass.value !== confirmPass.value) { confirmPass.focus(); return; }
      AdminData.adminCurrentPassword = newPass.value;
      clearForm();
    });

    resetBtn.addEventListener('click', clearForm);
  }

  return { render, bind };
})();

AdminRouter.register('change_password', ChangePasswordView);
