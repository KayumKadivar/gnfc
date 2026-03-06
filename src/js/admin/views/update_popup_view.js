/**
 * Update Popup View — Login popup YES/NO toggle
 */
const UpdatePopupView = (() => {
  'use strict';

  function render() {
    return `
      ${AdminUtils.renderTopBar('Login Popup', 'ph-bell', 'Login notification settings')}
      <div class="admin-card">
        <div class="admin-form-section">
          <div class="admin-form-section-header">
            <div class="admin-form-section-icon" style="background: rgba(87,148,242,0.12); color: #5794F2">
              <i class="ph-bold ph-bell-ringing"></i>
            </div>
            <div>
              <div class="admin-form-section-title">Login Notification</div>
              <div class="admin-form-section-desc">Enable or disable the popup notification shown at user login</div>
            </div>
          </div>
          <div class="admin-form-section-body">
            <div class="admin-field-group" style="max-width: 400px">
              <label for="newUpdatePopupSelect" class="admin-field-label"><i class="ph ph-toggle-left"></i> Show Login Popup</label>
              <select id="newUpdatePopupSelect" class="admin-select">
                <option value="yes"${AdminData.adminLoginPopupSelection === 'yes' ? ' selected' : ''}>YES — Show popup at login</option>
                <option value="no"${AdminData.adminLoginPopupSelection === 'no' ? ' selected' : ''}>NO — Do not show popup</option>
              </select>
            </div>
            <div class="admin-btn-row mt-4" style="justify-content: flex-start">
              <button id="newUpdatePopupOkBtn" type="button" class="admin-btn admin-btn-primary">
                <i class="ph ph-check-circle"></i> Save
              </button>
            </div>
            <p id="newUpdatePopupSavedText" class="admin-status-badge success mt-3 opacity-0 transition-opacity"><i class="ph ph-check"></i> Saved successfully</p>
          </div>
        </div>
      </div>
    `;
  }

  function bind() {
    const select = document.getElementById('newUpdatePopupSelect');
    const okBtn = document.getElementById('newUpdatePopupOkBtn');
    const savedText = document.getElementById('newUpdatePopupSavedText');
    if (!select || !okBtn) return;

    okBtn.addEventListener('click', () => {
      AdminData.adminLoginPopupSelection = select.value === 'yes' ? 'yes' : 'no';
      AdminUtils.setStoredValue(AdminData.STORAGE_KEYS.LOGIN_POPUP, AdminData.adminLoginPopupSelection);
      if (savedText) {
        savedText.classList.remove('opacity-0');
        setTimeout(() => savedText.classList.add('opacity-0'), 1200);
      }
    });
  }

  return { render, bind };
})();

AdminRouter.register('new_update_popup', UpdatePopupView);
