(function initCalibrationModal(global) {
  "use strict";

  const MODAL_ID = "calibration-due-modal";
  const SESSION_KEY = "gnfc_calibration_modal_shown";
  const LOGIN_SESSION_KEY = "gnfc_login_session_id";
  const SHOWN_LOGIN_KEY = "gnfc_calibration_modal_shown_for_login";
  const DAY_MS = 24 * 60 * 60 * 1000;

  function getLoginSessionId() {
    return (localStorage.getItem(LOGIN_SESSION_KEY) || "").trim();
  }

  function hasShownForCurrentLogin(loginSessionId) {
    if (!loginSessionId) {
      // Backward-compatible fallback when login id is unavailable.
      return sessionStorage.getItem(SESSION_KEY) === "true";
    }
    return localStorage.getItem(SHOWN_LOGIN_KEY) === loginSessionId;
  }

  function markShownForCurrentLogin(loginSessionId) {
    if (loginSessionId) {
      localStorage.setItem(SHOWN_LOGIN_KEY, loginSessionId);
    }
    sessionStorage.setItem(SESSION_KEY, "true");
  }

  function consumeFromLoginFlag() {
    try {
      const url = new URL(window.location.href);
      const hasFlag = url.searchParams.get("fromLogin") === "1";
      if (!hasFlag) return false;

      url.searchParams.delete("fromLogin");
      const nextUrl = `${url.pathname}${url.search}${url.hash}`;
      if (window.history && typeof window.history.replaceState === "function") {
        window.history.replaceState({}, "", nextUrl);
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (char) => {
      if (char === "&") return "&amp;";
      if (char === "<") return "&lt;";
      if (char === ">") return "&gt;";
      if (char === '"') return "&quot;";
      return "&#39;";
    });
  }

  function parseDDMMYYYY(value) {
    const parts = String(value || "").split("/");
    if (parts.length !== 3) return null;

    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);
    if (!day || !month || !year) return null;

    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function getDueStatus(calDueDate) {
    const dueDate = parseDDMMYYYY(calDueDate);
    if (!dueDate) {
      return {
        label: "Date N/A",
        className: "caldue-status--na"
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayDiff = Math.floor((today.getTime() - dueDate.getTime()) / DAY_MS);

    if (dayDiff > 0) {
      return {
        label: `Overdue ${dayDiff}d`,
        className: "caldue-status--overdue"
      };
    }

    if (dayDiff === 0) {
      return {
        label: "Due Today",
        className: "caldue-status--today"
      };
    }

    return {
      label: `Due in ${Math.abs(dayDiff)}d`,
      className: "caldue-status--upcoming"
    };
  }

  function createModalHTML(itemsByPlant) {
    const plants = Object.keys(itemsByPlant).sort((a, b) => a.localeCompare(b));
    const totalItems = plants.reduce((count, plant) => count + (itemsByPlant[plant] || []).length, 0);
    const totalPlants = plants.length;

    const plantSections = plants.map((plant) => {
      const items = itemsByPlant[plant] || [];

      return `
        <section class="caldue-card">
          <div class="caldue-card-head">
            <div>
              <h3 class="caldue-plant-title">${escapeHTML(plant)}</h3>
              <p class="caldue-plant-subtitle">${items.length} equipment item(s) pending review</p>
            </div>
          </div>

          <div class="caldue-table-wrap">
            <table class="caldue-table gnfc-table">
              <thead class="gnfc-thead">
                <tr>
                  <th class="gnfc-th p-2 text-start" style="width:44px;">#</th>
                  <th class="gnfc-th p-2 text-start" style="min-width:260px;">Equipment Item</th>
                  <th class="gnfc-th p-2 text-start" style="width:120px;">Make</th>
                  <th class="gnfc-th p-2 text-start" style="width:120px;">Model</th>
                  <th class="gnfc-th p-2 text-start" style="width:140px;">Serial No.</th>
                  <th class="gnfc-th p-2 text-start" style="width:120px;">Last Cal</th>
                  <th class="gnfc-th p-2 text-start" style="width:120px;">Due Date</th>
                  <th class="gnfc-th p-2 text-start" style="width:130px;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((item, index) => {
        const status = getDueStatus(item.calDueDate);
        return `
                    <tr>
                      <td>${index + 1}</td>
                      <td>
                        <div class="caldue-item-title">${escapeHTML(item.item || "-")}</div>
                        <div class="caldue-item-meta">ID: ${escapeHTML(item.id || "-")}</div>
                      </td>
                      <td>${escapeHTML(item.make || "-")}</td>
                      <td>${escapeHTML(item.modelNo || "-")}</td>
                      <td class="caldue-mono">${escapeHTML(item.srNo || "-")}</td>
                      <td class="caldue-mono">${escapeHTML(item.lastCalibrated || "-")}</td>
                      <td class="caldue-mono caldue-due-date">${escapeHTML(item.calDueDate || "-")}</td>
                      <td>
                        <span class="caldue-status ${status.className}">${escapeHTML(status.label)}</span>
                      </td>
                    </tr>
                  `;
      }).join("")}
              </tbody>
            </table>
          </div>
        </section>
      `;
    }).join("");

    return `
      <div id="${MODAL_ID}" class="gnfc-modal-overlay is-open caldue-overlay"
           onclick="if(event.target === this) CalibrationModal.close();">
        <style>
          #${MODAL_ID}.caldue-overlay {
            padding: 1.25rem;
            backdrop-filter: blur(4px);
          }

          #${MODAL_ID} .caldue-shell {
            border-radius: 12px;
            border-color: var(--app-border, #2c3235);
          }

          #${MODAL_ID} .caldue-header {
            padding: 1rem 1.25rem;
          }

          #${MODAL_ID} .caldue-summary {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            align-items: center;
            justify-content: flex-end;
          }

          #${MODAL_ID} .caldue-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            border-radius: 999px;
            padding: 0.22rem 0.65rem;
            border: 1px solid rgba(87, 148, 242, 0.35);
            background: rgba(87, 148, 242, 0.12);
            color: #93c5fd;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.02em;
            text-transform: uppercase;
          }

          #${MODAL_ID} .caldue-pill--alert {
            border-color: rgba(249, 115, 22, 0.4);
            background: rgba(249, 115, 22, 0.12);
            color: #fdba74;
          }

          #${MODAL_ID} .caldue-body {
            background: linear-gradient(180deg, rgba(148, 163, 184, 0.06), rgba(148, 163, 184, 0.02));
            display: grid;
            gap: 0.95rem;
          }

          #${MODAL_ID} .caldue-card {
            border: 1px solid var(--app-border, #2c3235);
            border-radius: 10px;
            background: var(--app-panel, #181b1f);
            overflow: hidden;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
          }

          #${MODAL_ID} .caldue-card-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.8rem;
            padding: 0.8rem 1rem;
            border-bottom: 1px solid var(--app-border, #2c3235);
            background: var(--app-panel-alt, #22252b);
          }

          #${MODAL_ID} .caldue-plant-title {
            margin: 0;
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #f8fafc;
          }

          #${MODAL_ID} .caldue-plant-subtitle {
            margin: 2px 0 0;
            font-size: 11px;
            color: var(--app-muted, #94a3b8);
            font-weight: 600;
          }

          #${MODAL_ID} .caldue-chip {
            border: 1px solid rgba(248, 113, 113, 0.35);
            color: #fca5a5;
            background: rgba(248, 113, 113, 0.12);
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            border-radius: 999px;
            padding: 0.28rem 0.62rem;
            white-space: nowrap;
          }

          #${MODAL_ID} .caldue-table-wrap {
            overflow: auto;
            max-height: min(44vh, 420px);
          }

          #${MODAL_ID} .caldue-table {
            width: 100%;
            min-width: 930px;
            border-collapse: separate;
            border-spacing: 0;
            font-size: 12px;
            line-height: 1.35;
          }

          #${MODAL_ID} .caldue-table thead th {
            backdrop-filter: blur(5px);
          }

          #${MODAL_ID} .caldue-table tbody td {
            color: var(--app-text, #e2e8f0);
            padding: 0.62rem 0.7rem;
            border-bottom: 1px solid var(--app-border, #2c3235);
            vertical-align: top;
            background: transparent;
          }

          #${MODAL_ID} .caldue-table tbody tr:nth-child(even) td {
            background: rgba(148, 163, 184, 0.05);
          }

          #${MODAL_ID} .caldue-table tbody tr:hover td {
            background: rgba(87, 148, 242, 0.12);
          }

          #${MODAL_ID} .caldue-table tbody tr:last-child td {
            border-bottom: none;
          }

          #${MODAL_ID} .caldue-item-title {
            font-weight: 700;
            color: var(--app-text, #f8fafc);
          }

          #${MODAL_ID} .caldue-item-meta {
            margin-top: 2px;
            font-size: 10px;
            color: var(--app-muted, #94a3b8);
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }

          #${MODAL_ID} .caldue-mono {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            font-size: 11px;
          }

          #${MODAL_ID} .caldue-due-date {
            font-weight: 700;
          }

          #${MODAL_ID} .caldue-status {
            display: inline-flex;
            align-items: center;
            border: 1px solid transparent;
            border-radius: 999px;
            padding: 0.18rem 0.52rem;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.03em;
            text-transform: uppercase;
            white-space: nowrap;
          }

          #${MODAL_ID} .caldue-status--overdue {
            border-color: rgba(239, 68, 68, 0.35);
            background: rgba(239, 68, 68, 0.14);
            color: #ff0524;
          }

          #${MODAL_ID} .caldue-status--today {
            border-color: rgba(245, 158, 11, 0.35);
            background: rgba(245, 158, 11, 0.14);
            color: #fcd34d;
          }

          #${MODAL_ID} .caldue-status--upcoming {
            border-color: rgba(59, 130, 246, 0.35);
            background: rgba(59, 130, 246, 0.14);
            color: #93c5fd;
          }

          #${MODAL_ID} .caldue-status--na {
            border-color: rgba(148, 163, 184, 0.35);
            background: rgba(148, 163, 184, 0.14);
            color: #cbd5e1;
          }

          html[data-theme-mode="light"] #${MODAL_ID} .caldue-body {
            background: linear-gradient(180deg, rgba(148, 163, 184, 0.09), rgba(148, 163, 184, 0.04));
          }

          html[data-theme-mode="light"] #${MODAL_ID} .caldue-card {
            background: #ffffff;
            box-shadow: 0 8px 18px -14px rgba(15, 23, 42, 0.45);
          }

          html[data-theme-mode="light"] #${MODAL_ID} .caldue-card-head {
            background: #f8fafc;
          }

          html[data-theme-mode="light"] #${MODAL_ID} .caldue-plant-title {
            color: #0f172a;
          }

          html[data-theme-mode="light"] #${MODAL_ID} .caldue-plant-subtitle {
            color: #64748b;
          }

          html[data-theme-mode="light"] #${MODAL_ID} .caldue-table thead th {
            background: rgba(241, 245, 249, 0.95);
            color: #1d4ed8;
          }

          html[data-theme-mode="light"] #${MODAL_ID} .caldue-table tbody td {
            color: #0f172a;
          }

          html[data-theme-mode="light"] #${MODAL_ID} .caldue-table tbody tr:nth-child(even) td {
            background: rgba(226, 232, 240, 0.42);
          }

          html[data-theme-mode="light"] #${MODAL_ID} .caldue-table tbody tr:hover td {
            background: rgba(191, 219, 254, 0.55);
          }

          html[data-theme-mode="light"] #${MODAL_ID} .caldue-item-meta {
            color: #64748b;
          }

          @media (max-width: 768px) {
            #${MODAL_ID}.caldue-overlay {
              padding: 0.75rem;
            }

            #${MODAL_ID} .caldue-header {
              padding: 0.8rem 0.9rem;
            }

            #${MODAL_ID} .caldue-summary {
              justify-content: flex-start;
            }

            #${MODAL_ID} .caldue-card-head {
              align-items: flex-start;
              flex-direction: column;
            }
          }
        </style>

        <div class="gnfc-modal-shell gnfc-modal-shell--wide caldue-shell animate-in zoom-in-95 duration-300">
          <div class="gnfc-modal-header caldue-header">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-md bg-gnfc-red/10 border border-gnfc-red/20 flex items-center justify-center">
                <i class="ph-bold ph-warning-diamond font-20px color-red"></i>
              </div>
              <div>
                <h1 class="gnfc-modal-title">Calibration Alerts</h1>
                <p class="gnfc-modal-subtitle">Mandatory equipment review required</p>
              </div>
            </div>

          <!--  <div class="caldue-summary">
              <span class="caldue-pill"><i class="ph-bold ph-list-checks"></i>${totalItems} due items</span>
              <span class="caldue-pill caldue-pill--alert"><i class="ph-bold ph-factory"></i>${totalPlants} plant${totalPlants === 1 ? "" : "s"}</span>
              <button onclick="CalibrationModal.close()" class="gnfc-modal-close" aria-label="Close">
                <i class="ph-bold ph-x font-16px pointer-events-none"></i>
              </button>
            </div>  -->
          </div>

          <div class="gnfc-modal-body caldue-body">
            ${plantSections}
          </div>

          <div class="gnfc-modal-footer gnfc-modal-footer--space-between">
            <div class="flex items-center gap-1.5 color-muted fw-bold font-10px uppercase tracking-wider italic">
              <i class="ph-bold ph-info"></i>
              Verify physical condition and update calibration records.
            </div>
            <button onclick="CalibrationModal.close()" class="gnfc-modal-btn gnfc-modal-btn-primary font-12px">
              <i class="ph-bold ph-check-circle text-lg"></i>
              ACKNOWLEDGE
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function show(force = false) {
    const isManualOpen = force === "manual";
    let dueItems = global.CalibrationStore ? global.CalibrationStore.getDueItems() : [];

    // Filter by active plants in ElogbookStore
    if (global.ElogbookStore) {
      const state = global.ElogbookStore.loadState();
      const activePlants = Object.keys(state.plants || {});
      dueItems = dueItems.filter(item => activePlants.includes(item.plant));
    }

    if (dueItems.length === 0) {
      if (global.NotificationManager) global.NotificationManager.removeNotification('cal-alert');
      return;
    }

    // Always update Notification Manager if there are items
    if (global.NotificationManager) {
      global.NotificationManager.addNotification({
        id: 'cal-alert',
        type: 'calibration',
        title: 'Calibration Due',
        message: `${dueItems.length} equipment items require mandatory calibration review.`,
        action: "CalibrationModal.show('manual')"
      });
    }

    // Logic for showing the popup modal
    if (!isManualOpen) {
      // Only auto-show on Dashboard
      if (window.activePage !== 'dashboard') return;
      // Auto-show only when dashboard is opened from login.
      const openedFromLogin = consumeFromLoginFlag();
      if (!openedFromLogin) return;
      // Only show once per login.
      const loginSessionId = getLoginSessionId();
      if (hasShownForCurrentLogin(loginSessionId)) return;

      // Mark as shown immediately to prevent race conditions or re-triggers.
      markShownForCurrentLogin(loginSessionId);
    }

    // Group by plant for the modal content
    const grouped = dueItems.reduce((acc, item) => {
      if (!acc[item.plant]) acc[item.plant] = [];
      acc[item.plant].push(item);
      return acc;
    }, {});

    // Check if modal already exists to avoid duplicates
    if (document.getElementById(MODAL_ID)) return;

    const template = document.createElement("template");
    template.innerHTML = createModalHTML(grouped).trim();
    const modal = template.content.firstElementChild;
    if (modal) {
      document.body.appendChild(modal);
    }
  }

  function close() {
    const modal = document.getElementById(MODAL_ID);
    if (modal) {
      modal.remove();
    }
  }

  global.CalibrationModal = {
    show,
    close
  };

  // Auto-trigger on dashboard load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', show);
  } else {
    show();
  }

})(window);
