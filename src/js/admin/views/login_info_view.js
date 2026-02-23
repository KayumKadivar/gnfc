/**
 * Login Info View — Read-only login information table
 */
const LoginInfoView = (() => {
    'use strict';

    function buildRows() {
        const rows = AdminUtils.getUserPlantsDirectoryRows();
        return rows.map((row, i) => {
            const fallbackOctet3 = 70 + (i % 26);
            const fallbackOctet4 = 20 + ((i * 7) % 200);
            const fallbackTime = `23/02/2026 ${String(8 + (i % 12)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}:${String((i * 11) % 60).padStart(2, '0')}`;
            const userName = String(row.userName || '').replace(/-/g, '').trim().toUpperCase() || 'USER';
            return {
                sr: i + 1,
                userName,
                ec: row.ec,
                groupCode: AdminUtils.getUserInfoGroupCode(row.group),
                lastLogin: AdminData.LOGIN_INFO_LAST_LOGIN_SEED[i] || fallbackTime,
                machineAddress: AdminData.LOGIN_INFO_MACHINE_SEED[i] || `10.10.${fallbackOctet3}.${fallbackOctet4}`,
                hitCount: AdminData.LOGIN_INFO_HIT_COUNT_SEED[i] || (1000 + (i * 173))
            };
        });
    }

    function render() {
        const rows = buildRows();
        return `
      ${AdminUtils.renderTopBar('Login Information')}
      <div class="admin-card">
        <div class="admin-table-scroll" style="max-height:68vh">
          <table class="admin-table">
            <thead>
              <tr>
                <th class="admin-table-head w-16 text-center">Sr</th>
                <th class="admin-table-head">User</th>
                <th class="admin-table-head">ECNO</th>
                <th class="admin-table-head w-20 text-center">Group</th>
                <th class="admin-table-head">Last Login</th>
                <th class="admin-table-head">Machine Address</th>
                <th class="admin-table-head w-24 text-center">Hit Count</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map(row => `
                <tr class="admin-table-row">
                  <td class="admin-table-cell text-center">${AdminUtils.escapeHtml(row.sr)}</td>
                  <td class="admin-table-cell fw-semibold">${AdminUtils.escapeHtml(row.userName)}</td>
                  <td class="admin-table-cell typo-mono">${AdminUtils.escapeHtml(row.ec)}</td>
                  <td class="admin-table-cell text-center">${AdminUtils.escapeHtml(row.groupCode)}</td>
                  <td class="admin-table-cell typo-mono">${AdminUtils.escapeHtml(row.lastLogin)}</td>
                  <td class="admin-table-cell typo-mono">${AdminUtils.escapeHtml(row.machineAddress)}</td>
                  <td class="admin-table-cell text-center">${AdminUtils.escapeHtml(row.hitCount)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    }

    function bind() { /* Read-only — no bindings needed */ }

    return { render, bind };
})();

AdminRouter.register('login_info', LoginInfoView);
