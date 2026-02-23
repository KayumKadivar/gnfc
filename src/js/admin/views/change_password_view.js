/**
 * Change Password View — Admin password change form
 */
const ChangePasswordView = (() => {
    'use strict';

    function render() {
        return `
      ${AdminUtils.renderTopBar('Change Password For Admin')}
      <div class="admin-card">
        <h3 class="font-18px fw-bold color-primary text-center mb-4">Change Password</h3>
        <div class="admin-form-grid max-w-xl mx-auto">
          <label class="admin-form-label">User</label>
          <input type="text" value="admin" readonly class="admin-input opacity-60">
          <label for="adminOldPassword" class="admin-form-label">Old Password</label>
          <input id="adminOldPassword" type="password" class="admin-input" placeholder="••••••••">
          <label for="adminNewPassword" class="admin-form-label">New Password</label>
          <input id="adminNewPassword" type="password" class="admin-input" placeholder="••••••••">
          <label for="adminConfirmPassword" class="admin-form-label">Confirm New</label>
          <input id="adminConfirmPassword" type="password" class="admin-input" placeholder="••••••••">
        </div>
        <div class="admin-btn-row mt-4">
          <button id="adminChangeSubmitBtn" type="button" class="admin-btn admin-btn-primary">
            <i class="ph ph-check-circle"></i> Submit
          </button>
          <button id="adminChangeResetBtn" type="button" class="admin-btn admin-btn-secondary">
            <i class="ph ph-arrow-counter-clockwise"></i> Reset
          </button>
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
