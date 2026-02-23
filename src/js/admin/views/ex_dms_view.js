/**
 * Ex-DMS View — Ex-DMS Space management
 */
const ExDmsView = (() => {
    'use strict';

    function buildUserOptions(selectedEc) {
        const selected = String(selectedEc || '').trim();
        const rows = AdminUtils.getUserPlantsDirectoryRows();
        return rows.map(row => {
            const label = `${row.ec}:${String(row.userName || '').replace(/-/g, '').trim().toUpperCase()}`;
            const isSel = row.ec === selected ? ' selected' : '';
            return `<option value="${AdminUtils.escapeHtml(row.ec)}"${isSel}>${AdminUtils.escapeHtml(label)}</option>`;
        }).join('');
    }

    function render() {
        const selectedEc = AdminData.exDmsSelectedUserEc || AdminUtils.getUserPlantsDirectoryRows()[0]?.ec || '';
        return `
      ${AdminUtils.renderTopBar('Ex-DMS Space')}
      <div class="admin-card text-center">
        <h3 class="font-22px fw-extrabold color-blue mb-4">Ex-DMS Space</h3>
        <div class="max-w-xs mx-auto">
          <select id="exDmsUserSelect" class="admin-select w-full">${buildUserOptions(selectedEc)}</select>
        </div>
        <div class="admin-btn-row mt-4">
          <button id="exDmsCreateBtn" type="button" class="admin-btn admin-btn-primary">
            <i class="ph ph-folder-plus"></i> Create
          </button>
        </div>
        <p class="font-22px fw-bold color-label mt-8">Instrument WebWorld</p>
        <p id="exDmsStatus" class="font-13px fw-semibold color-green mt-3 opacity-0 transition-opacity">Space created.</p>
      </div>
    `;
    }

    function bind() {
        const userSelect = document.getElementById('exDmsUserSelect');
        const createBtn = document.getElementById('exDmsCreateBtn');
        const status = document.getElementById('exDmsStatus');
        if (!userSelect || !createBtn) return;

        userSelect.addEventListener('change', () => {
            AdminData.exDmsSelectedUserEc = userSelect.value.trim();
        });

        createBtn.addEventListener('click', () => {
            AdminData.exDmsSelectedUserEc = userSelect.value.trim();
            if (status) {
                const opt = userSelect.options[userSelect.selectedIndex];
                status.textContent = `Space created for ${opt ? opt.text : AdminData.exDmsSelectedUserEc}`;
                status.classList.remove('opacity-0');
                setTimeout(() => status.classList.add('opacity-0'), 1800);
            }
        });
    }

    return { render, bind };
})();

AdminRouter.register('ex_dms_space', ExDmsView);
