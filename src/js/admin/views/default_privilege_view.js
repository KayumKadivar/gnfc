/**
 * Default Privilege View — Permission grid for Tech and IE/SIE groups
 */
const DefaultPrivilegeView = (() => {
    'use strict';

    function render() {
        return `
      ${AdminUtils.renderTopBar('Default Privilege')}
      <div class="admin-card">
        <h3 class="font-15px fw-bold color-primary mb-3">Default Privilege – Tech</h3>
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

      <div class="admin-card mt-4">
        <h3 class="font-15px fw-bold color-primary mb-3">Default Privilege – IE / SIE</h3>
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

        <div class="admin-btn-row mt-4">
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
