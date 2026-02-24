/**
 * Default Privilege View — Permission grid for Tech and IE/SIE groups
 */
const DefaultPrivilegeView = (() => {
  'use strict';

  function render() {
    return `
      ${AdminUtils.renderTopBar('Default Privilege', 'ph-shield-star', 'Set default permissions per user group')}
      <div class="admin-card">
        <div class="admin-form-section">
          <div class="admin-form-section-header">
            <div class="admin-form-section-icon" style="background: rgba(87,148,242,0.12); color: #5794F2">
              <i class="ph-bold ph-wrench"></i>
            </div>
            <div>
              <div class="admin-form-section-title">Tech Group Permissions</div>
              <div class="admin-form-section-desc">Default privileges for technical users</div>
            </div>
          </div>
          <div class="admin-form-section-body" style="padding: 0">
            <div class="admin-table-scroll" style="max-height:52vh">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th class="admin-table-head">Module</th>
                    <th class="admin-table-head text-center">Add</th>
                    <th class="admin-table-head text-center">Modify</th>
                    <th class="admin-table-head text-center">Delete</th>
                    <th class="admin-table-head text-center">Eng. Remark</th>
                    <th class="admin-table-head text-center">Ex. Remark</th>
                  </tr>
                </thead>
                <tbody>${AdminUtils.renderPermissionRows(AdminData.defaultPrivilegeRowsTech)}</tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="admin-form-section">
          <div class="admin-form-section-header">
            <div class="admin-form-section-icon" style="background: rgba(255,153,0,0.12); color: #FF9900">
              <i class="ph-bold ph-clipboard-text"></i>
            </div>
            <div>
              <div class="admin-form-section-title">IE / SIE Group Permissions</div>
              <div class="admin-form-section-desc">Default privileges for inspection and engineering users</div>
            </div>
          </div>
          <div class="admin-form-section-body" style="padding: 0">
            <div class="admin-table-scroll" style="max-height:30vh">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th class="admin-table-head">Module</th>
                    <th class="admin-table-head text-center">Add</th>
                    <th class="admin-table-head text-center">Modify</th>
                    <th class="admin-table-head text-center">Delete</th>
                    <th class="admin-table-head text-center">Eng. Remark</th>
                    <th class="admin-table-head text-center">Ex. Remark</th>
                  </tr>
                </thead>
                <tbody>${AdminUtils.renderPermissionRows(AdminData.defaultPrivilegeRowsIeSie)}</tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="admin-btn-row mt-4" style="justify-content: flex-start">
          <button id="defaultPrivilegeSaveBtn" type="button" class="admin-btn admin-btn-primary">
            <i class="ph ph-floppy-disk"></i> Save
          </button>
        </div>
      </div>
    `;
  }

  function bind() {
    const saveBtn = document.getElementById('defaultPrivilegeSaveBtn');
    if (saveBtn) saveBtn.addEventListener('click', () => saveBtn.blur());
  }

  return { render, bind };
})();

AdminRouter.register('default_privilege', DefaultPrivilegeView);
