/**
 * Update Popup View — Login popup YES/NO toggle
 */
const UpdatePopupView = (() => {
    'use strict';

    function render() {
        return `
      ${AdminUtils.renderTopBar('Login Popup')}
      <div class="admin-card">
        <h3 class="font-18px fw-bold color-primary text-center mb-4">Login Popup</h3>
        <div class="admin-form-grid max-w-xl mx-auto">
          <label for="newUpdatePopupSelect" class="admin-form-label">Select YES or NO</label>
          <select id="newUpdatePopupSelect" class="admin-select">
            <option value="yes"${AdminData.adminLoginPopupSelection === 'yes' ? ' selected' : ''}>YES</option>
            <option value="no"${AdminData.adminLoginPopupSelection === 'no' ? ' selected' : ''}>NO</option>
          </select>
        </div>
        <div class="admin-btn-row mt-4">
          <button id="newUpdatePopupOkBtn" type="button" class="admin-btn admin-btn-primary">
            <i class="ph ph-check-circle"></i> OK
          </button>
        </div>
        <p id="newUpdatePopupSavedText" class="text-center font-13px fw-semibold color-green mt-3 opacity-0 transition-opacity">Saved.</p>
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
