/**
 * What's New View — editable text area saved to localStorage
 */
const WhatsNewView = (() => {
    'use strict';

    function render() {
        return `
      ${AdminUtils.renderTopBar("What's New")}
      <div class="admin-card">
        <h3 class="font-18px fw-bold color-primary text-center mb-4">What's New?</h3>
        <div class="max-w-xl mx-auto">
          <textarea id="whatsNewTextarea" rows="11" class="admin-textarea">${AdminUtils.escapeHtml(AdminData.whatsNewContent)}</textarea>
        </div>
        <div class="admin-btn-row mt-4">
          <button id="whatsNewSaveBtn" type="button" class="admin-btn admin-btn-primary">
            <i class="ph ph-floppy-disk"></i> Save
          </button>
        </div>
        <p id="whatsNewSavedText" class="text-center font-13px fw-semibold color-green mt-3 opacity-0 transition-opacity">Saved.</p>
      </div>
    `;
    }

    function bind() {
        const textarea = document.getElementById('whatsNewTextarea');
        const saveBtn = document.getElementById('whatsNewSaveBtn');
        const savedText = document.getElementById('whatsNewSavedText');
        if (!textarea || !saveBtn) return;

        const save = () => {
            AdminData.whatsNewContent = textarea.value || '';
            AdminUtils.setStoredValue(AdminData.STORAGE_KEYS.WHATS_NEW, AdminData.whatsNewContent);
            if (savedText) {
                savedText.classList.remove('opacity-0');
                setTimeout(() => savedText.classList.add('opacity-0'), 1200);
            }
        };

        saveBtn.addEventListener('click', save);
        textarea.addEventListener('keydown', e => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault(); save();
            }
        });
    }

    return { render, bind };
})();

AdminRouter.register('whats_new', WhatsNewView);
