/**
 * User Info View — User CRUD (Add / View / Update / Delete)
 */
const UserInfoView = (() => {
  'use strict';

  function buildTableRows(rows) {
    if (!rows.length) return `<tr><td colspan="5" class="admin-table-cell text-center color-hint py-4">No user records found.</td></tr>`;
    return rows.map((row, i) => `
      <tr class="admin-table-row">
        <td class="admin-table-cell text-center">
          <input type="radio" name="userInfoModalSelected" value="${AdminUtils.escapeHtml(row.ec)}" class="admin-radio"${i === 0 ? ' checked' : ''}>
        </td>
        <td class="admin-table-cell font-15px fw-semibold ">${AdminUtils.escapeHtml(row.ec)}</td>
        <td class="admin-table-cell fw-semibold">${AdminUtils.escapeHtml(row.userName)}</td>
        <td class="admin-table-cell">${AdminUtils.escapeHtml(row.group)}</td>
      </tr>
    `).join('');
  }

  function getSelectedUser(rows) {
    if (!rows?.length) return null;
    const ec = String($('input[name="userInfoModalSelected"]:checked').val() || '').trim();
    if (ec) { const r = rows.find(x => x.ec === ec); if (r) return r; }
    return rows[0] || null;
  }

  function openUpdateModal(user, sourceRows) {
    const source = sourceRows?.length ? sourceRows : AdminData.userInfoRows;
    const html = `
      <div class="admin-modal-overlay" data-close-modal></div>
      <div class="admin-modal-center">
        <div class="admin-modal-box w-full max-w-3xl">
          <div class="admin-modal-header">
            <h3>User Information [ Update ]</h3>
            <button type="button" class="admin-btn admin-btn-sm" data-close-modal><i class="ph-bold ph-x text-lg"></i></button>
          </div>
          <div class="admin-modal-body">
            <div class="admin-form-grid">
              <label class="admin-form-label">EC Number</label>
              <input type="text" value="${AdminUtils.escapeHtml(user.ec)}" readonly class="admin-input opacity-60">
              <label for="userInfoUpdateName" class="admin-form-label">User Name</label>
              <input id="userInfoUpdateName" type="text" value="${AdminUtils.escapeHtml(user.userName)}" class="admin-input">
              <label for="userInfoUpdatePassword" class="admin-form-label">Password</label>
              <input id="userInfoUpdatePassword" type="text" value="${AdminUtils.escapeHtml(user.password || '')}" class="admin-input">
              <label for="userInfoUpdateGroup" class="admin-form-label">Group</label>
              <select id="userInfoUpdateGroup" class="admin-select">
                ${AdminData.userInfoGroupOptions.map(g =>
      `<option value="${AdminUtils.escapeHtml(g)}"${g === user.group ? ' selected' : ''}>${AdminUtils.escapeHtml(g)}</option>`
    ).join('')}
              </select>
            </div>
            <div class="admin-btn-row mt-4">
              <button id="userInfoUpdateSaveBtn" type="button" class="admin-btn admin-btn-primary">
                <i class="ph ph-floppy-disk"></i> Update
              </button>
              <button id="userInfoUpdateBackBtn" type="button" class="admin-btn admin-btn-secondary">
                <i class="ph ph-arrow-left"></i> Back
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const $root = AdminUtils.openModal(html);
    if (!$root.length) return;

    const goBack = () => openListModal(source.map(r => ({ ...r })));

    $('#userInfoUpdateBackBtn').on('click', goBack);
    $('#userInfoUpdateSaveBtn').on('click', () => {
      const $nameInput = $('#userInfoUpdateName');
      const $passInput = $('#userInfoUpdatePassword');
      const $groupSelect = $('#userInfoUpdateGroup');
      const nextName = String($nameInput.val() || '').trim();
      if (!nextName) { $nameInput.trigger('focus'); return; }

      const userRow = AdminData.userInfoRows.find(r => r.ec === user.ec);
      if (userRow) {
        userRow.userName = nextName;
        userRow.password = String($passInput.val() || '');
        userRow.group = String($groupSelect.val() || user.group);
        AdminUtils.upsertUserPrivilegeRowFromUserInfo(userRow);
      }
      goBack();
    });
  }

  function openListModal(rows) {
    const html = `
      <div class="admin-modal-overlay" data-close-modal></div>
      <div class="admin-modal-center">
        <div class="admin-modal-box w-full max-w-4xl">
          <div class="admin-modal-header">
            <h3>User Information [ View ]</h3>
            <button type="button" class="admin-btn admin-btn-sm" data-close-modal><i class="ph-bold ph-x text-lg"></i></button>
          </div>
          <div class="admin-modal-body">
            <div class="admin-table-scroll" style="max-height:400px">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th class="admin-table-head w-12"></th>
                    <th class="admin-table-head">EC Number</th>
                    <th class="admin-table-head">User Name</th>
                    <th class="admin-table-head">Group</th>
                  </tr>
                </thead>
                <tbody>${buildTableRows(rows)}</tbody>
              </table>
            </div>
            <div class="admin-btn-row mt-4">
              <button id="userInfoModalUpdateBtn" type="button" class="admin-btn admin-btn-secondary">
                <i class="ph ph-pencil"></i> Update
              </button>
              <button id="userInfoModalDeleteBtn" type="button" class="admin-btn admin-btn-danger">
                <i class="ph ph-trash"></i> Delete
              </button>
              <button type="button" class="admin-btn admin-btn-secondary" data-close-modal>Close</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const $root = AdminUtils.openModal(html);
    if (!$root.length) return;

    $('#userInfoModalUpdateBtn').on('click', () => {
      const selected = getSelectedUser(rows);
      if (selected) openUpdateModal({ ...selected }, rows);
    });

    $('#userInfoModalDeleteBtn').on('click', () => {
      const selected = getSelectedUser(rows);
      if (!selected) return;
      const idx = AdminData.userInfoRows.findIndex(r => r.ec === selected.ec);
      if (idx !== -1) {
        AdminData.userInfoRows.splice(idx, 1);
        AdminUtils.removeUserPrivilegeRowByEc(selected.ec);
      }
      openListModal(AdminData.userInfoRows.map(r => ({ ...r })));
    });
  }

  function render() {
    return `
      ${AdminUtils.renderTopBar('User Information', 'ph-user-circle', 'User accounts and profile management')}
      <div class="admin-card">
        <div class="admin-form-section">
          <div class="admin-form-section-header">
            <div class="admin-form-section-icon" style="background: rgba(87,148,242,0.12); color: #5794F2">
              <i class="ph-bold ph-user-plus"></i>
            </div>
            <div>
              <div class="admin-form-section-title">Add New User</div>
              <div class="admin-form-section-desc">Create a new user account with their credentials and group</div>
            </div>
          </div>
          <div class="admin-form-section-body">
            <div class="admin-form-cols">
              <div class="admin-field-group">
                <label for="userInfoEc" class="admin-field-label"><i class="ph ph-identification-card"></i> EC Number</label>
                <input id="userInfoEc" type="text" class="admin-input" placeholder="Enter EC Number...">
              </div>
              <div class="admin-field-group">
                <label for="userInfoName" class="admin-field-label"><i class="ph ph-user"></i> User Name</label>
                <input id="userInfoName" type="text" class="admin-input" placeholder="Enter full name...">
              </div>
              <div class="admin-field-group">
                <label for="userInfoPassword" class="admin-field-label"><i class="ph ph-lock"></i> Password</label>
                <input id="userInfoPassword" type="text" class="admin-input" placeholder="Enter password...">
              </div>
              <div class="admin-field-group">
                <label for="userInfoGroup" class="admin-field-label"><i class="ph ph-users"></i> Group</label>
                <select id="userInfoGroup" class="admin-select">
                  ${AdminData.userInfoGroupOptions.map(g =>
      `<option value="${AdminUtils.escapeHtml(g)}">${AdminUtils.escapeHtml(g)}</option>`
    ).join('')}
                </select>
              </div>
            </div>
            <div class="admin-btn-row mt-4" style="justify-content: flex-start">
              <button id="userInfoAddBtn" type="button" class="admin-btn admin-btn-primary">
                <i class="ph ph-plus-circle"></i> Add
              </button>
              <button id="userInfoViewBtn" type="button" class="admin-btn admin-btn-secondary">
                <i class="ph ph-list-magnifying-glass"></i> View All Users
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function bind() {
    const $ecInput = $('#userInfoEc');
    const $nameInput = $('#userInfoName');
    const $passInput = $('#userInfoPassword');
    const $groupSelect = $('#userInfoGroup');
    const $addBtn = $('#userInfoAddBtn');
    const $viewBtn = $('#userInfoViewBtn');
    if (!$ecInput.length || !$nameInput.length || !$addBtn.length || !$viewBtn.length) return;

    $addBtn.on('click', () => {
      const ec = String($ecInput.val() || '').trim();
      const userName = String($nameInput.val() || '').trim();
      if (!ec || !userName) { $ecInput.trigger('focus'); return; }
      const exists = AdminData.userInfoRows.some(r => r.ec === ec);
      if (!exists) {
        const newRow = { ec, userName, password: String($passInput.val() || ''), group: String($groupSelect.val() || 'Tech') };
        AdminData.userInfoRows.push(newRow);
        AdminUtils.upsertUserPrivilegeRowFromUserInfo(newRow);
      }
      $ecInput.val('');
      $nameInput.val('');
      $passInput.val('');
      $ecInput.trigger('focus');
    });

    $viewBtn.on('click', () => openListModal(AdminData.userInfoRows.map(r => ({ ...r }))));
  }

  return { render, bind };
})();

AdminRouter.register('user', UserInfoView);
