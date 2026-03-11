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
    const $oldPass = $('#adminOldPassword');
    const $newPass = $('#adminNewPassword');
    const $confirmPass = $('#adminConfirmPassword');
    const $submitBtn = $('#adminChangeSubmitBtn');
    const $resetBtn = $('#adminChangeResetBtn');
    if (!$oldPass.length || !$newPass.length || !$confirmPass.length || !$submitBtn.length || !$resetBtn.length) return;

    const clearForm = () => {
      $oldPass.val('');
      $newPass.val('');
      $confirmPass.val('');
      $oldPass.trigger('focus');
    };

    $submitBtn.on('click', () => {
      const oldValue = String($oldPass.val() || '');
      const newValue = String($newPass.val() || '');
      const confirmValue = String($confirmPass.val() || '');
      if (!oldValue || oldValue !== AdminData.adminCurrentPassword) { $oldPass.trigger('focus'); return; }
      if (!newValue) { $newPass.trigger('focus'); return; }
      if (newValue !== confirmValue) { $confirmPass.trigger('focus'); return; }
      AdminData.adminCurrentPassword = newValue;
      clearForm();
    });

    $resetBtn.on('click', clearForm);
  }

  return { render, bind };
})();

AdminRouter.register('change_password', ChangePasswordView);
