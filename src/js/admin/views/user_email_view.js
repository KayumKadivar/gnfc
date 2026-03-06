/**
 * User Email View — Manage user email addresses
 */
const UserEmailView = (() => {
  'use strict';

  function render() {
    return `
      ${AdminUtils.renderTopBar('User Email Address', 'ph-envelope', 'Email configuration and management')}
      <div class="admin-card">
        <div class="admin-form-section">
          <div class="admin-form-section-header">
            <div class="admin-form-section-icon" style="background: rgba(87,148,242,0.12); color: #5794F2">
              <i class="ph-bold ph-user-focus"></i>
            </div>
            <div>
              <div class="admin-form-section-title">Select Employee</div>
              <div class="admin-form-section-desc">Search and select a user to update their email</div>
            </div>
          </div>
          <div class="admin-form-section-body">
            <div class="admin-form-cols">
              <div class="admin-field-group">
                <label for="userEmailFilter" class="admin-field-label"><i class="ph ph-magnifying-glass"></i> Filter</label>
                <input id="userEmailFilter" type="text" class="admin-input" placeholder="Search by EC or Name...">
              </div>
              <div class="admin-field-group">
                <label for="userEmailSelect" class="admin-field-label"><i class="ph ph-identification-card"></i> EC Number</label>
                <select id="userEmailSelect" class="admin-select">
                  <option value="">Select EC Number</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="admin-form-section">
          <div class="admin-form-section-header">
            <div class="admin-form-section-icon" style="background: rgba(255,153,0,0.12); color: #FF9900">
              <i class="ph-bold ph-envelope-simple"></i>
            </div>
            <div>
              <div class="admin-form-section-title">Email Address</div>
              <div class="admin-form-section-desc">Enter or update the email for the selected user</div>
            </div>
          </div>
          <div class="admin-form-section-body">
            <div class="admin-field-group">
              <label for="userEmailInput" class="admin-field-label"><i class="ph ph-at"></i> Email</label>
              <input id="userEmailInput" type="email" class="admin-input" placeholder="Enter email address...">
            </div>
            <div class="admin-btn-row mt-4">
              <button id="userEmailUpdateBtn" type="button" class="admin-btn admin-btn-primary">
                <i class="ph ph-floppy-disk"></i> Update
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function bind() {
    const filterInput = document.getElementById('userEmailFilter');
    const ecSelect = document.getElementById('userEmailSelect');
    const emailInput = document.getElementById('userEmailInput');
    const updateBtn = document.getElementById('userEmailUpdateBtn');
    if (!filterInput || !ecSelect || !emailInput || !updateBtn) return;

    const syncEmail = () => {
      const ec = String(ecSelect.value || '').trim();
      emailInput.value = ec ? String(AdminData.userEmailByEc.get(ec) || '') : '';
    };

    const applyFilter = () => {
      const rows = AdminUtils.filterUserPlantsDirectoryRows(filterInput.value);
      const preferred = String(ecSelect.value || '').trim();
      const hasPreferred = rows.some(r => r.ec === preferred);
      const selectedEc = hasPreferred ? preferred : (rows[0]?.ec || '');
      ecSelect.innerHTML = '<option value="">Select EC Number</option>' + AdminUtils.buildUserPlantsEcOptions(rows, selectedEc);
      ecSelect.value = selectedEc;
      syncEmail();
    };

    updateBtn.addEventListener('click', () => {
      const ec = String(ecSelect.value || '').trim();
      if (!ec) return;
      AdminData.userEmailByEc.set(ec, emailInput.value.trim());
    });

    ecSelect.addEventListener('change', syncEmail);
    filterInput.addEventListener('input', applyFilter);
    filterInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); updateBtn.click(); } });
    applyFilter();
  }

  return { render, bind };
})();

AdminRouter.register('user_email', UserEmailView);
