/**
 * Mail Schedule View — List & Form for mail scheduling
 */
const MailScheduleView = (() => {
    'use strict';

    function persistRows() {
        AdminUtils.setStoredValue(AdminData.STORAGE_KEYS.MAIL_SCHEDULE, JSON.stringify(AdminData.mailScheduleRows));
    }

    function createEmptyDraft() {
        return {
            id: '', title: '', nextDue: '', toType: 'All', toAddress: '',
            sender: AdminData.MAIL_SCHEDULE_SENDER_OPTIONS[0], frequencyDays: '0',
            onDay: '', onMonth: '', onYear: '', report: '', subject: '', message: ''
        };
    }

    function calculateNextDue(draft) {
        const day = Number(draft.onDay), month = Number(draft.onMonth), year = Number(draft.onYear);
        const hasOn = Number.isInteger(day) && day > 0 && Number.isInteger(month) && month > 0 && Number.isInteger(year) && year > 0;
        if (hasOn) {
            const d = new Date(year, month - 1, day);
            if (!isNaN(d.getTime())) return AdminUtils.formatDateDDMMYYYY(d);
        }
        const freq = Number(draft.frequencyDays);
        if (Number.isFinite(freq) && freq > 0) {
            const d = new Date(); d.setDate(d.getDate() + freq);
            return AdminUtils.formatDateDDMMYYYY(d);
        }
        return String(draft.nextDue || '-');
    }

    function buildDropdown(options, selectedValue, placeholder) {
        const items = options.map(opt =>
            `<option value="${AdminUtils.escapeHtml(opt)}"${opt === String(selectedValue || '') ? ' selected' : ''}>${AdminUtils.escapeHtml(opt)}</option>`
        ).join('');
        if (!placeholder) return items;
        const hasVal = String(selectedValue || '').trim().length > 0;
        return `<option value=""${hasVal ? '' : ' selected'}>${AdminUtils.escapeHtml(placeholder)}</option>${items}`;
    }

    function renderListView() {
        const defaultId = AdminData.mailScheduleEditingId || AdminData.mailScheduleRows[0]?.id || '';
        const options = AdminData.mailScheduleRows.length
            ? AdminData.mailScheduleRows.map(row => {
                const label = `${row.title || 'Untitled'}    Next due:${row.nextDue || '-'}`;
                const isSel = row.id === defaultId ? ' selected' : '';
                return `<option value="${AdminUtils.escapeHtml(row.id)}"${isSel}>${AdminUtils.escapeHtml(label)}</option>`;
            }).join('')
            : '<option value="">No schedule available</option>';

        return `
      ${AdminUtils.renderTopBar('Mail Schedule')}
      <div class="admin-card">
        <div class="max-w-2xl mx-auto">
          <select id="mailScheduleSelect" class="admin-select w-full">${options}</select>
          <div class="admin-btn-row mt-3">
            <button id="mailScheduleEditBtn" type="button" class="admin-btn admin-btn-secondary">
              <i class="ph ph-pencil"></i> Edit
            </button>
            <button id="mailScheduleAddBtn" type="button" class="admin-btn admin-btn-primary">
              <i class="ph ph-plus-circle"></i> Add New
            </button>
          </div>
        </div>
      </div>
    `;
    }

    function renderFormView() {
        const draft = AdminData.mailScheduleDraft || createEmptyDraft();
        const isEditing = Boolean(AdminData.mailScheduleEditingId);
        const dayOpts = Array.from({ length: 31 }, (_, i) => String(i + 1));
        const monthOpts = Array.from({ length: 12 }, (_, i) => String(i + 1));
        const yearOpts = Array.from({ length: 12 }, (_, i) => String(new Date().getFullYear() + i));

        return `
      ${AdminUtils.renderTopBar('Mail Schedule')}
      <div class="admin-card">
        <div class="admin-form-table">
          <div class="admin-form-table-row">
            <label class="admin-form-table-label">To:</label>
            <div class="admin-form-table-value">
              <select id="mailScheduleToType" class="admin-select">${buildDropdown(AdminData.MAIL_SCHEDULE_TO_OPTIONS, draft.toType, '')}</select>
              <input id="mailScheduleToAddress" type="text" value="${AdminUtils.escapeHtml(draft.toAddress)}" class="admin-input mt-2" placeholder="Email address...">
            </div>
          </div>
          <div class="admin-form-table-row">
            <label class="admin-form-table-label">Sender:</label>
            <div class="admin-form-table-value">
              <select id="mailScheduleSender" class="admin-select">${buildDropdown(AdminData.MAIL_SCHEDULE_SENDER_OPTIONS, draft.sender, '')}</select>
            </div>
          </div>
          <div class="admin-form-table-row">
            <label class="admin-form-table-label">Frequency:</label>
            <div class="admin-form-table-value flex items-center gap-2">
              <input id="mailScheduleFrequency" type="number" min="0" value="${AdminUtils.escapeHtml(draft.frequencyDays)}" class="admin-input w-24">
              <span class="font-13px fw-semibold color-label">Days</span>
            </div>
          </div>
          <div class="admin-form-table-row">
            <label class="admin-form-table-label">ON:</label>
            <div class="admin-form-table-value flex flex-wrap items-center gap-2">
              <span class="font-13px fw-semibold color-label">D</span>
              <select id="mailScheduleDay" class="admin-select w-20">${buildDropdown(dayOpts, draft.onDay, '-')}</select>
              <span class="font-13px fw-semibold color-label">M</span>
              <select id="mailScheduleMonth" class="admin-select w-20">${buildDropdown(monthOpts, draft.onMonth, '-')}</select>
              <span class="font-13px fw-semibold color-label">Y</span>
              <select id="mailScheduleYear" class="admin-select w-24">${buildDropdown(yearOpts, draft.onYear, '-')}</select>
              <span class="font-13px fw-bold color-label ml-2">Report:</span>
              <input id="mailScheduleReport" type="text" value="${AdminUtils.escapeHtml(draft.report)}" class="admin-input flex-1 min-w-[140px]">
            </div>
          </div>
          <div class="admin-form-table-row">
            <label class="admin-form-table-label">Subject:</label>
            <div class="admin-form-table-value">
              <input id="mailScheduleSubject" type="text" value="${AdminUtils.escapeHtml(draft.subject)}" class="admin-input">
            </div>
          </div>
          <div class="admin-form-table-row">
            <label class="admin-form-table-label">Message:</label>
            <div class="admin-form-table-value">
              <textarea id="mailScheduleMessage" rows="5" class="admin-textarea">${AdminUtils.escapeHtml(draft.message)}</textarea>
            </div>
          </div>
        </div>
        <div class="admin-btn-row mt-4">
          <button id="mailScheduleSaveBtn" type="button" class="admin-btn admin-btn-primary">
            <i class="ph ph-floppy-disk"></i> ${isEditing ? 'Update' : 'Add'}
          </button>
          <button id="mailScheduleBackBtn" type="button" class="admin-btn admin-btn-secondary">
            <i class="ph ph-arrow-left"></i> Back
          </button>
        </div>
      </div>
    `;
    }

    function render() {
        return AdminData.mailScheduleMode === 'form' ? renderFormView() : renderListView();
    }

    function bindListView() {
        const select = document.getElementById('mailScheduleSelect');
        const editBtn = document.getElementById('mailScheduleEditBtn');
        const addBtn = document.getElementById('mailScheduleAddBtn');
        if (!select || !editBtn || !addBtn) return;

        addBtn.addEventListener('click', () => {
            AdminData.mailScheduleEditingId = '';
            AdminData.mailScheduleDraft = createEmptyDraft();
            AdminData.mailScheduleMode = 'form';
            window.renderAdminContent('mail_schedule');
        });

        editBtn.addEventListener('click', () => {
            const id = String(select.value || '').trim();
            if (!id) return;
            const row = AdminData.mailScheduleRows.find(r => r.id === id);
            if (!row) return;
            AdminData.mailScheduleEditingId = id;
            AdminData.mailScheduleDraft = { ...row };
            AdminData.mailScheduleMode = 'form';
            window.renderAdminContent('mail_schedule');
        });
    }

    function bindFormView() {
        const els = {
            toType: document.getElementById('mailScheduleToType'),
            toAddr: document.getElementById('mailScheduleToAddress'),
            sender: document.getElementById('mailScheduleSender'),
            freq: document.getElementById('mailScheduleFrequency'),
            day: document.getElementById('mailScheduleDay'),
            month: document.getElementById('mailScheduleMonth'),
            year: document.getElementById('mailScheduleYear'),
            report: document.getElementById('mailScheduleReport'),
            subject: document.getElementById('mailScheduleSubject'),
            message: document.getElementById('mailScheduleMessage'),
            save: document.getElementById('mailScheduleSaveBtn'),
            back: document.getElementById('mailScheduleBackBtn'),
        };
        if (!els.save || !els.back) return;

        els.save.addEventListener('click', () => {
            const draft = {
                ...(AdminData.mailScheduleDraft || createEmptyDraft()),
                toType: els.toType?.value || 'All',
                toAddress: els.toAddr?.value.trim() || '',
                sender: els.sender?.value || '',
                frequencyDays: els.freq?.value.trim() || '0',
                onDay: els.day?.value.trim() || '',
                onMonth: els.month?.value.trim() || '',
                onYear: els.year?.value.trim() || '',
                report: els.report?.value.trim() || '',
                subject: els.subject?.value.trim() || '',
                message: els.message?.value.trim() || '',
            };
            if (!draft.title) draft.title = draft.report ? `${draft.report.toUpperCase()} REPORT` : 'MAIL REPORT';
            draft.nextDue = calculateNextDue(draft);

            if (AdminData.mailScheduleEditingId) {
                AdminData.mailScheduleRows = AdminData.mailScheduleRows.map(r => r.id === AdminData.mailScheduleEditingId ? { ...draft, id: r.id } : r);
            } else {
                draft.id = `mail-schedule-${Date.now()}`;
                AdminData.mailScheduleRows = [draft, ...AdminData.mailScheduleRows];
            }

            persistRows();
            AdminData.mailScheduleMode = 'list';
            AdminData.mailScheduleEditingId = '';
            AdminData.mailScheduleDraft = null;
            window.renderAdminContent('mail_schedule');
        });

        els.back.addEventListener('click', () => {
            AdminData.mailScheduleMode = 'list';
            AdminData.mailScheduleEditingId = '';
            AdminData.mailScheduleDraft = null;
            window.renderAdminContent('mail_schedule');
        });
    }

    function bind() {
        AdminData.mailScheduleMode === 'form' ? bindFormView() : bindListView();
    }

    return { render, bind };
})();

AdminRouter.register('mail_schedule', MailScheduleView);
