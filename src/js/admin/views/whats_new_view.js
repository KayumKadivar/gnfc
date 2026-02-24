/**
 * What's New View — editable text area saved to localStorage
 */
const WhatsNewView = (() => {
  'use strict';

  function render() {
    return `
      ${AdminUtils.renderTopBar("What's New", 'ph-sparkle', 'Release notes and updates')}
      <div class="admin-card">
        <div class="admin-form-section">
          <div class="admin-form-section-header">
            <div class="admin-form-section-icon" style="background: rgba(255,153,0,0.12); color: #FF9900">
              <i class="ph-bold ph-sparkle"></i>
            </div>
            <div>
              <div class="admin-form-section-title">What's New Content</div>
              <div class="admin-form-section-desc">Edit the release notes and update information shown to users</div>
            </div>
          </div>
          <div class="admin-form-section-body">
            <div class="admin-field-group">
              <label class="admin-field-label"><i class="ph ph-note-pencil"></i> Content</label>
              <textarea id="whatsNewTextarea" rows="11" class="admin-textarea">${AdminUtils.escapeHtml(AdminData.whatsNewContent)}</textarea>
            </div>
            <div class="admin-btn-row mt-4" style="justify-content: flex-start">
              <button id="whatsNewSaveBtn" type="button" class="admin-btn admin-btn-primary">
                <i class="ph ph-floppy-disk"></i> Save
              </button>
            </div>
            <p id="whatsNewSavedText" class="admin-status-badge success mt-3 opacity-0 transition-opacity"><i class="ph ph-check"></i> Saved successfully</p>
          </div>
        </div>
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
