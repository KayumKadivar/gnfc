/* global PlantLogTable, renderHeader, ElogbookStore */

(function initElogbookPlantFlow(global) {
  "use strict";

  const DAY_MS = 24 * 60 * 60 * 1000;
  const MONTHLY_WINDOW_DAYS = 40;
  const VIEW_KEYS = ["today", "tomorrow", "prev", "weekly", "monthly"];

  let currentView = "today";
  let plantLogTable = null;

  const elogbookState = {
    selectedPlant: "AA",
    pendingOnlyMode: false,
    modalMode: "assign",
    modalTargetView: "today",
    activeUser: {
      name: "PHS",
      role: "engineer",
    },
    allJobs: [],
    jobsByView: {
      today: [],
      tomorrow: [],
      prev: [],
      weekly: [],
      monthly: [],
    },
    technicians: ["PHS", "NRK", "DPB", "AMS", "PHB", "IT", "KBP"],
    engineers: ["PHS", "AMS", "PHB", "MIV", "VAA"],
    areas: ["FA", "MF", "DCS", "UTIL", "AA", "INST"],
    jobTypes: [
      "Routine Check",
      "Calibration",
      "Breakdown",
      "Abnormality",
      "ISO14001",
      "Shutdown",
    ],
    instrumentTypes: [
      "TRANSMITTER",
      "CONTROL VALVE",
      "SWITCH",
      "ANALYZER",
      "DCS",
      "OTHERS",
    ],
    loopTagMap: {
      "Loop-202": ["PT5087K", "PT5082A", "PT5091F"],
      "Loop-101": ["FT5021A", "FT5021B", "FT5023K"],
      "Loop-DCS": ["SYS-1", "SYS-MAIN", "ESD-CHK"],
      "Loop-UTIL": ["AIR-COMP", "COND-VALVE", "LT38358"],
    },
    ojrPending: [
      {
        id: "OJR-1",
        area: "FA",
        loop: "Loop-101",
        tag: "FT5023K",
        jobType: "Breakdown",
        instType: "TRANSMITTER",
        desc: "Operation observed unstable flow trend in shift A.",
        source: "OJR",
      },
      {
        id: "OJR-2",
        area: "UTIL",
        loop: "Loop-UTIL",
        tag: "AIR-COMP",
        jobType: "Routine Check",
        instType: "ANALYZER",
        desc: "Compressor pressure fluctuations reported by operations.",
        source: "OJR",
      },
    ],
    jobPlannerDue: [],
  };

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function isoDateToSlash(isoDate) {
    if (!isoDate) return "--/--/----";
    const date = ElogbookStore.parseIsoDate(isoDate);
    if (!date) return "--/--/----";
    return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
  }

  function toReadableDate(dateValue) {
    const fallbackDate = isoDateToSlash(toIsoDate(new Date()));
    const raw = String(dateValue || "").trim();
    if (!raw) return fallbackDate;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(raw)) return raw.replaceAll(".", "/");
    const slashDate = isoDateToSlash(raw);
    return slashDate === "--/--/----" ? fallbackDate : slashDate;
  }

  function toIsoDate(date) {
    return ElogbookStore.toIsoDate(date);
  }

  function startOfDay(date) {
    return ElogbookStore.startOfDay(date);
  }

  function normalizeView(viewName) {
    return VIEW_KEYS.includes(viewName) ? viewName : "today";
  }

  function safeText(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function makeInitials(name) {
    const tokenized = String(name || "")
      .split(/\s+/)
      .filter(Boolean)
      .map((token) => token[0].toUpperCase());
    return tokenized.slice(0, 3).join("") || "NA";
  }

  function getStatusClass(color) {
    if (color === "green")
      return "color-green bg-gnfc-green/10 border-gnfc-green/20";
    if (color === "orange")
      return "color-orange bg-gnfc-orange/10 border-gnfc-orange/20";
    return "color-secondary bg-slate-100 dark:bg-dark-bg border-slate-300 dark:border-dark-border";
  }

  function statusColor(status) {
    if (status === "✓ OVER") return "green";
    if (!status) return "";
    return "orange";
  }

  function showNotice(message, intent) {
    const tone = intent || "info";
    const containerId = "elogbook-toast-container";
    let container = document.getElementById(containerId);

    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      container.className = "fixed top-4 right-4 z-[150] flex flex-col gap-2";
      document.body.appendChild(container);
    }

    const toneClass =
      tone === "error"
        ? "bg-red-600/90 border-red-500"
        : tone === "warn"
          ? "bg-amber-600/90 border-amber-500"
          : "bg-blue-600/90 border-blue-500";

    const toast = document.createElement("div");
    toast.className = `font-14px fw-bold border ${toneClass} text-white px-3 py-2 rounded shadow-lg`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
  }

  function parseQueryContext() {
    const params = new URLSearchParams(global.location.search);
    const plant = (params.get("plant") || "").trim();
    if (plant) {
      elogbookState.selectedPlant = plant;
    }

    const queryView = params.get("view");
    if (queryView) {
      currentView = normalizeView(queryView);
    } else {
      currentView = normalizeView(
        ElogbookStore.getTechnicianSelectedView() || "today",
      );
    }

    global.currentView = currentView;
  }

  function refreshLocalData() {
    elogbookState.allJobs = ElogbookStore.getPlantJobs(
      elogbookState.selectedPlant,
    );
    elogbookState.jobsByView = ElogbookStore.getPlantJobsByView(
      elogbookState.selectedPlant,
      new Date(),
    );
  }

  function persistLocalData() {
    ElogbookStore.setPlantJobs(
      elogbookState.selectedPlant,
      elogbookState.allJobs,
    );
    refreshLocalData();
  }

  function getCurrentViewJobs() {
    return elogbookState.jobsByView[currentView] || [];
  }

  function parseDateInput(value) {
    if (!value) return null;
    const parsed = ElogbookStore.parseIsoDate(value);
    return parsed ? startOfDay(parsed) : null;
  }

  function getFilteredJobs() {
    let rows = [...getCurrentViewJobs()];

    const jobType = document.getElementById("job-type-select")?.value || "";
    const startDate = parseDateInput(
      document.getElementById("start-date")?.value || "",
    );
    const endDate = parseDateInput(
      document.getElementById("end-date")?.value || "",
    );

    if (elogbookState.pendingOnlyMode) {
      rows = rows.filter((job) => job.pendingWrite);
    }

    if (jobType) {
      rows = rows.filter((job) => job.jobType === jobType);
    }

    if (startDate || endDate) {
      rows = rows.filter((job) => {
        const date = ElogbookStore.parseIsoDate(job.targetDate);
        if (!date) return false;
        if (startDate && date < startDate) return false;
        if (endDate && date > new Date(endDate.getTime() + DAY_MS - 1))
          return false;
        return true;
      });
    }

    return rows.map((job, index) => ({
      ...job,
      sr: pad2(index + 1),
    }));
  }

  function hasPendingAck(job) {
    if (!Array.isArray(job.remarks) || !job.remarks.length) return false;
    return job.remarks.some((remark) => {
      if (elogbookState.activeUser.role === "technician") {
        return remark.ackTech && !remark.ackByTech;
      }
      return remark.ackEng && !remark.ackByEng;
    });
  }

  function renderJobRow(job, index, rows) {
    const rowClass = job.emergency ? "bg-amber-500/10" : "";
    const srClass = job.pendingWrite ? "bg-pink-500/20 cursor-pointer" : "";
    const descClass = job.abnormality
      ? "border border-red-500/60 rounded-sm px-1.5 py-1"
      : "";
    const badgeClass = getStatusClass(statusColor(job.status));
    const pendingAck = hasPendingAck(job);
    const ref = `By:${job.engineer || elogbookState.activeUser.name} : ${isoDateToSlash(job.targetDate)}`;
    const isGroupedView = currentView === "weekly" || currentView === "monthly";
    const previousRow =
      Array.isArray(rows) && index > 0 ? rows[index - 1] : null;
    const showDaySeparator =
      isGroupedView &&
      (!previousRow || previousRow.targetDate !== job.targetDate);
    const daySeparatorRow = showDaySeparator
      ? `
      <tr class="bg-amber-50/60 dark:bg-amber-500/5 border-y border-gray-200 dark:border-dark-border">
        <td colspan="10" class="px-3 py-2 font-14px fw-bold color-orange">
          <span class="inline-flex items-center gap-1.5">
            <i class="ph-bold ph-folder-simple"></i>
            ${safeText(isoDateToSlash(job.targetDate))}
          </span>
        </td>
      </tr>
    `
      : "";

    return `
      ${daySeparatorRow}
      <tr class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-200 dark:border-dark-border group ${rowClass}">
        <td class="p-2 align-top text-center typo-mono border-r border-gray-200 dark:border-dark-border ${srClass}" ${job.pendingWrite ? `onclick="event.stopPropagation(); openEditModal('${job.id}')"` : ""}>${safeText(job.sr)}</td>
        <td class="p-2 align-top fw-bold color-primary border-r border-gray-200 dark:border-dark-border">${safeText(job.area)}</td>
        <td class="p-2 align-top border-r border-gray-200 dark:border-dark-border">
            <div>
            <div class="flex items-center gap-2">
              <div class="font-14px color-blue fw-semibold">${safeText(job.loop)}</div>
              <div class="flex items-center gap-2">
                ${job.pendingWrite ? `<button onclick="event.stopPropagation(); reassignJob('${job.id}')" class="font-13px px-1 py-0.5 border border-red-500/50 color-red rounded-sm hover:bg-red-500/20" title="Re-Assign Same Job">^^</button>` : ""}
              </div>
              </div>
              <div class="border-b border-gnfc-dark py-1.5 w-100"></div>
              <span class="inline-block mt-1 font-13px color-secondary bg-gray-100 dark:bg-dark-bg px-1.5 py-0.5 rounded border border-gray-200 dark:border-dark-border typo-mono line">${safeText(job.tag)}</span>
            </div>
        </td>
        <td class="p-2 align-top border-r border-gray-200 dark:border-dark-border">
          <div class="fw-medium color-primary">${safeText(job.jobType)}</div>
          <div class="font-13px color-secondary mt-0.5">${safeText(ref)}</div>
          <span class="inline-block mt-1 font-13px color-secondary bg-gray-100 dark:bg-dark-bg px-1.5 py-0.5 rounded border border-gray-200 dark:border-dark-border typo-mono">${safeText(job.typeOfInst)}</span>
        </td>
        <td class="p-2 align-top text-center fw-bold color-secondary border-r border-gray-200 dark:border-dark-border">${safeText(job.tech)}</td>
        <td class="p-2 align-top color-primary border-r border-gray-200 dark:border-dark-border leading-relaxed">
          <div class="${descClass}">${safeText(job.desc || (job.pendingWrite ? "Assigned. Awaiting technician log entry." : ""))}</div>
        </td>
        <td class="p-2 align-top text-center border-r border-gray-200 dark:border-dark-border">
          <div class="fw-bold color-primary">${safeText(job.engineer || "--")}</div>
          <div class="font-13px color-secondary">${safeText(makeInitials(job.engineer || ""))}</div>
        </td>
        <td class="p-2 align-top text-center border-r border-gray-200 dark:border-dark-border">
          ${job.status ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs font-10px fw-bold border whitespace-nowrap ${badgeClass}">${safeText(job.status)}</span>` : `<span class="font-13px color-pink fw-bold">ASSIGNED</span>`}
        </td>

      ${["today", "tomorrow"].includes(currentView) ? `
      <td class="p-2 align-top text-center border-r border-gray-200 dark:border-dark-border cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" onclick="openPriorityModal('${job.id}')">
        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full font-12px fw-bold ${job.priority > 0 ? "bg-purple-100 dark:bg-purple-900/30 color-purple" : "bg-gray-100 dark:bg-dark-bg color-secondary"}">
          ${job.priority || 0}
        </span>
      </td>` : ""}

        <td class="p-2 align-top text-center color-secondary border-r border-gray-200 dark:border-dark-border">
          <div class="flex flex-row items-center">
            <button onclick="openRemarkModal('${job.id}')" class="inline-flex items-center gap-1 font-13px hover-color-blue transition-colors">
              <i class="ph-bold ph-chat-circle-dots"></i>
            </button>
            ${pendingAck ? `<div class="mt-1 font-13px color-orange">Ack pending</div>` : ""}
          </div>
        </td>
        
        ${["today", "tomorrow"].includes(currentView) ? "" : `
        <td class="p-2 align-top text-center">
          ${job.status === "✓ OVER" ? `
          <a href="javascript:void(0)" onclick="event.stopPropagation(); openAddToHistoryModal('${job.id}')" class="color-blue fw-bold font-14px hover:underline cursor-pointer block border-b" title="Add to History">H</a> 
          <a href="javascript:void(0)" onclick="event.stopPropagation(); openAddToHistoryModal('${job.id}')" class="color-blue fw-bold font-14px hover:underline cursor-pointer block" title="Add to History">PM</a>` : ""}
        </td>`}
      </tr>
    `;
  }

  function populateJobTypeDropdown() {
    const select = document.getElementById("job-type-select");
    if (!select) return;
    select.innerHTML = '<option value="">All Jobs</option>';
    elogbookState.jobTypes
      .slice()
      .sort()
      .forEach((type) => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        select.appendChild(option);
      });
  }

  function updatePendingModeButton() {
    const button = document.getElementById("toggle-pending-btn");
    if (!button) return;
    button.textContent = elogbookState.pendingOnlyMode
      ? "Pending Log (ON)"
      : "Pending Log";
    button.classList.toggle("bg-gnfc-orange/20", elogbookState.pendingOnlyMode);
  }

  function collectPendingAcks() {
    const pending = [];
    VIEW_KEYS.forEach((viewName) => {
      (elogbookState.jobsByView[viewName] || []).forEach((job) => {
        (job.remarks || []).forEach((remark) => {
          if (elogbookState.activeUser.role === "technician") {
            if (remark.ackTech && !remark.ackByTech)
              pending.push({ viewName, job, remark });
          } else if (remark.ackEng && !remark.ackByEng) {
            pending.push({ viewName, job, remark });
          }
        });
      });
    });
    return pending;
  }

  function updateAcknowledgeButton() {
    const button = document.getElementById("acknowledge-btn");
    if (!button) return;
    const pending = collectPendingAcks();
    if (!pending.length) {
      button.classList.add("hidden");
      return;
    }

    button.classList.remove("hidden");
    button.textContent = `Pending Acknowledgement (${pending.length})`;
  }

  function refreshTable() {
    if (!plantLogTable) return;
    const rows = getFilteredJobs();
    plantLogTable.setData(rows);

    const searchInput = document.getElementById("table-search");
    if (searchInput) {
      plantLogTable.setSearch(searchInput.value || "");
    }

    updatePendingModeButton();
    updateAcknowledgeButton();
  }

  function getViewTitle(viewName) {
    if (viewName === "today") return "Today Log Book";
    if (viewName === "tomorrow") return "Tomorrow Log Book";
    if (viewName === "prev") return "Prev Day Log Book";
    if (viewName === "weekly") return "Weekly Log Book";
    return "Monthly Log Book";
  }

  function getViewDateText(viewName) {
    const now = startOfDay(new Date());
    if (viewName === "today")
      return isoDateToSlash(toIsoDate(now)).replaceAll("/", ".");
    if (viewName === "tomorrow")
      return isoDateToSlash(
        toIsoDate(new Date(now.getTime() + DAY_MS)),
      ).replaceAll("/", ".");
    if (viewName === "prev")
      return isoDateToSlash(
        toIsoDate(new Date(now.getTime() - DAY_MS)),
      ).replaceAll("/", ".");
    if (viewName === "weekly") {
      const start = new Date(now.getTime() - 6 * DAY_MS);
      return `${isoDateToSlash(toIsoDate(start)).replaceAll("/", ".")} - ${isoDateToSlash(toIsoDate(now)).replaceAll("/", ".")}`;
    }
    if (viewName === "monthly") {
      const start = new Date(
        now.getTime() - (MONTHLY_WINDOW_DAYS - 1) * DAY_MS,
      );
      return `Last ${MONTHLY_WINDOW_DAYS} Days: ${isoDateToSlash(toIsoDate(start)).replaceAll("/", ".")} - ${isoDateToSlash(toIsoDate(now)).replaceAll("/", ".")}`;
    }
    return now.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  }

  function activateView(viewName, buttonEl) {
    currentView = normalizeView(viewName);
    global.currentView = currentView;
    elogbookState.pendingOnlyMode = false;

    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.className =
        "tab-btn px-4 py-1 font-14px fw-medium color-secondary hover-color-primary transition-colors";
    });

    if (buttonEl) {
      buttonEl.className =
        "tab-btn px-4 py-1 font-14px fw-bold color-active bg-white dark:bg-[#323232] shadow-sm border border-slate-200 dark:border-dark-border rounded-sm transition-colors";
    }

    const viewTitleEl = document.getElementById("view-title");
    const viewDateEl = document.getElementById("view-date");
    if (viewTitleEl) viewTitleEl.textContent = getViewTitle(currentView);
    if (viewDateEl) viewDateEl.textContent = getViewDateText(currentView);

    // Toggle Add Column Header based on view
    const addColHeader = document.getElementById("add-column-header");
    if (addColHeader) {
      if (["today", "tomorrow"].includes(currentView)) {
        addColHeader.classList.add("hidden");
      } else {
        addColHeader.classList.remove("hidden");
      }
    }

    // Toggle Priority Column Header based on view
    const prioColHeader = document.getElementById("priority-column-header");
    if (prioColHeader) {
      if (["today", "tomorrow"].includes(currentView)) {
        prioColHeader.classList.remove("hidden");
      } else {
        prioColHeader.classList.add("hidden");
      }
    }

    if (["today", "prev", "weekly"].includes(currentView)) {
      ElogbookStore.setTechnicianSelectedView(currentView);
    }

    const searchInput = document.getElementById("table-search");
    if (searchInput) searchInput.value = "";
    refreshTable();
  }

  function switchView(btn, viewName) {
    activateView(viewName, btn);
  }

  function applyFilters() {
    refreshTable();
  }

  function toggleJobFilter() {
    const bar = document.getElementById("job-filter-bar");
    if (!bar) return;
    bar.classList.toggle("hidden");
  }

  function togglePendingMode() {
    elogbookState.pendingOnlyMode = !elogbookState.pendingOnlyMode;
    refreshTable();
  }

  function getJobById(jobId) {
    const index = elogbookState.allJobs.findIndex((job) => job.id === jobId);
    if (index < 0) return null;
    return {
      index,
      job: elogbookState.allJobs[index],
    };
  }

  function renderOjrPendingList() {
    const listEl = document.getElementById("ojr-pending-list");
    if (!listEl) return;

    const weeklyPending = (elogbookState.jobsByView.weekly || []).filter(
      (job) => job.pendingWrite,
    );
    const rows = [
      ...elogbookState.ojrPending.map((item) => ({ ...item, rowType: "ojr" })),
      ...weeklyPending.map((item) => ({
        id: item.id,
        area: item.area,
        loop: item.loop,
        tag: item.tag,
        jobType: item.jobType,
        instType: item.typeOfInst,
        desc: item.desc || "Pending from weekly logbook",
        tech: item.tech,
        rowType: "weekly",
      })),
    ];

    if (!rows.length) {
      listEl.innerHTML =
        '<div class="px-3 py-2 font-14px color-secondary">No OJR / Weekly pending jobs.</div>';
      return;
    }

    // listEl.innerHTML = rows.map((item) => `
    //   <div class="px-3 py-2 font-14px flex items-start justify-between gap-3">
    //     <div class="space-y-0.5">
    //       <div class="fw-bold text-white">${safeText(item.tag)} <span class="color-secondary">(${safeText(item.loop)})</span></div>
    //       <div class="color-secondary">${safeText(item.jobType)} | ${safeText(item.desc)}</div>
    //     </div>
    //     <button onclick="assignFromPendingSource('${safeText(item.id)}', '${safeText(item.rowType)}')" class="shrink-0 font-13px px-2 py-0.5 border border-gnfc-blue/40 text-gnfc-blue rounded-sm hover:bg-gnfc-blue/20">Assign</button>
    //   </div>
    // `).join("");
  }

  function populateJobModalLookups() {
    const techSelect = document.getElementById("job-tech");
    const loopSelect = document.getElementById("job-loop");
    const areaSelect = document.getElementById("job-area");
    const typeSelect = document.getElementById("job-type");
    const instSelect = document.getElementById("job-inst");
    const editTech = document.getElementById("edit-job-tech");
    const editEngineer = document.getElementById("edit-job-engineer");
    const editArea = document.getElementById("edit-job-area");

    if (techSelect) {
      techSelect.innerHTML = elogbookState.technicians
        .map(
          (tech) =>
            `<option value="${safeText(tech)}">${safeText(tech)}</option>`,
        )
        .join("");
    }

    if (loopSelect) {
      loopSelect.innerHTML = Object.keys(elogbookState.loopTagMap)
        .map(
          (loop) =>
            `<option value="${safeText(loop)}">${safeText(loop)}</option>`,
        )
        .join("");
    }

    if (areaSelect) {
      areaSelect.innerHTML = elogbookState.areas
        .map(
          (area) =>
            `<option value="${safeText(area)}">${safeText(area)}</option>`,
        )
        .join("");
    }

    if (typeSelect) {
      typeSelect.innerHTML = elogbookState.jobTypes
        .map(
          (type) =>
            `<option value="${safeText(type)}">${safeText(type)}</option>`,
        )
        .join("");
    }

    if (instSelect) {
      instSelect.innerHTML = elogbookState.instrumentTypes
        .map(
          (inst) =>
            `<option value="${safeText(inst)}">${safeText(inst)}</option>`,
        )
        .join("");
    }

    if (editTech) {
      editTech.innerHTML = elogbookState.technicians
        .map(
          (tech) =>
            `<option value="${safeText(tech)}">${safeText(tech)}</option>`,
        )
        .join("");
    }

    if (editEngineer) {
      editEngineer.innerHTML = elogbookState.engineers
        .map(
          (engineer) =>
            `<option value="${safeText(engineer)}">${safeText(engineer)}</option>`,
        )
        .join("");
    }

    if (editArea) {
      editArea.innerHTML = elogbookState.areas
        .map(
          (area) =>
            `<option value="${safeText(area)}">${safeText(area)}</option>`,
        )
        .join("");
    }

    filterTagsForLoop();
    renderOjrPendingList();
  }

  function filterTagsForLoop() {
    const loopName = document.getElementById("job-loop")?.value || "";
    const tagSelect = document.getElementById("job-tag");
    if (!tagSelect) return;

    const tags = elogbookState.loopTagMap[loopName] || [];
    tagSelect.innerHTML = tags
      .map(
        (tag) => `<option value="${safeText(tag)}">${safeText(tag)}</option>`,
      )
      .join("");
  }

  function openOverlay(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
  }

  function closeOverlay(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
  }

  function openJobModal(mode, targetView, prefill) {
    elogbookState.modalMode = mode === "add" ? "add" : "assign";
    elogbookState.modalTargetView = normalizeView(targetView || currentView);

    const titleEl = document.getElementById("job-modal-title");
    if (titleEl) {
      titleEl.textContent =
        elogbookState.modalMode === "add"
          ? "Add Job By Technician"
          : `Assign Job (${elogbookState.modalTargetView})`;
    }

    const baseDate = startOfDay(new Date());
    const targetDate =
      elogbookState.modalTargetView === "tomorrow"
        ? new Date(baseDate.getTime() + DAY_MS)
        : baseDate;

    const pre = prefill || {};

    const dateInput = document.getElementById("job-date");
    if (dateInput)
      dateInput.value = `${isoDateToSlash(toIsoDate(targetDate))} (server stamp)`;

    const techSelect = document.getElementById("job-tech");
    const techCustom = document.getElementById("job-tech-custom");
    const loopSelect = document.getElementById("job-loop");
    const areaSelect = document.getElementById("job-area");
    const typeSelect = document.getElementById("job-type");
    const instSelect = document.getElementById("job-inst");
    const descInput = document.getElementById("job-desc");
    const ojrPanel = document.getElementById("job-modal-ojr");

    if (techSelect) techSelect.value = pre.tech || elogbookState.technicians[0];
    if (techCustom) techCustom.value = "";
    if (loopSelect)
      loopSelect.value = pre.loop || Object.keys(elogbookState.loopTagMap)[0];
    filterTagsForLoop();

    const tagSelect = document.getElementById("job-tag");
    if (tagSelect) {
      const defaultTag =
        pre.tag ||
        (elogbookState.loopTagMap[loopSelect?.value || ""] || [])[0] ||
        "";
      tagSelect.value = defaultTag;
    }

    if (areaSelect) areaSelect.value = pre.area || elogbookState.areas[0];
    if (typeSelect) typeSelect.value = pre.jobType || elogbookState.jobTypes[0];
    if (instSelect)
      instSelect.value = pre.instType || elogbookState.instrumentTypes[0];
    if (descInput) descInput.value = pre.desc || "";

    if (elogbookState.modalMode === "add") {
      if (techSelect) {
        techSelect.value = elogbookState.activeUser.name;
        techSelect.disabled = true;
      }
      if (techCustom) techCustom.disabled = true;
      if (ojrPanel) ojrPanel.classList.add("hidden");
    } else {
      if (techSelect) techSelect.disabled = false;
      if (techCustom) techCustom.disabled = false;
      if (ojrPanel) ojrPanel.classList.remove("hidden");
    }

    openOverlay("job-modal");
  }

  function closeJobModal() {
    closeOverlay("job-modal");
  }

  function createJobPayloadFromModal() {
    const techFromList = document.getElementById("job-tech")?.value || "";
    const techFromInput =
      document.getElementById("job-tech-custom")?.value.trim() || "";
    const loop = document.getElementById("job-loop")?.value || "";
    const tag = document.getElementById("job-tag")?.value || "";
    const area = document.getElementById("job-area")?.value || "";
    const jobType = document.getElementById("job-type")?.value || "";
    const inst = document.getElementById("job-inst")?.value || "";
    const desc = document.getElementById("job-desc")?.value.trim() || "";

    return {
      tech: (techFromInput || techFromList || "").trim(),
      loop,
      tag,
      area,
      jobType,
      inst,
      desc,
    };
  }

  function saveJobFromModal(event) {
    event.preventDefault();

    const payload = createJobPayloadFromModal();
    if (
      !payload.tech ||
      !payload.loop ||
      !payload.tag ||
      !payload.area ||
      !payload.jobType ||
      !payload.inst ||
      !payload.desc
    ) {
      showNotice("All fields are compulsory for job save.", "error");
      return;
    }

    const baseDate = startOfDay(new Date());
    const targetDate =
      elogbookState.modalTargetView === "tomorrow"
        ? new Date(baseDate.getTime() + DAY_MS)
        : baseDate;

    const now = new Date().toISOString();
    const newJob = {
      id: `J-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      targetDate: toIsoDate(targetDate),
      createdAt: now,
      updatedAt: now,
      area: payload.area,
      loop: payload.loop,
      tag: payload.tag,
      typeOfInst: payload.inst,
      jobType: payload.jobType,
      tech: payload.tech,
      engineer: "",
      status: elogbookState.modalMode === "assign" ? "" : "IN PROGRESS",
      pendingWrite: elogbookState.modalMode === "assign",
      emergency: false,
      abnormality: payload.jobType === "Abnormality",
      extraDutyHours: 0,
      shift: "A",
      source:
        elogbookState.modalMode === "assign"
          ? `Assign(${elogbookState.modalTargetView})`
          : "Technician Add",
      desc: payload.desc,
      remarks: [],
    };

    elogbookState.allJobs.unshift(newJob);
    persistLocalData();
    closeJobModal();

    if (
      currentView === elogbookState.modalTargetView ||
      elogbookState.modalMode === "add"
    ) {
      refreshTable();
    }

    showNotice(
      elogbookState.modalMode === "assign"
        ? "Job assigned successfully."
        : "Job added successfully.",
      "info",
    );
  }

  function cloneJobForReassign(job) {
    const now = new Date().toISOString();
    return {
      id: `J-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      targetDate: toIsoDate(new Date()),
      createdAt: now,
      updatedAt: now,
      area: job.area,
      loop: job.loop,
      tag: job.tag,
      typeOfInst: job.typeOfInst,
      jobType: job.jobType,
      tech: job.tech,
      engineer: "",
      status: "",
      pendingWrite: true,
      emergency: false,
      abnormality: job.jobType === "Abnormality",
      extraDutyHours: 0,
      shift: job.shift || "A",
      source: "Re-Assigned",
      desc: "",
      remarks: [],
    };
  }

  function reassignJob(jobId) {
    const located = getJobById(jobId);
    if (!located) return;

    elogbookState.allJobs.unshift(cloneJobForReassign(located.job));
    persistLocalData();
    if (currentView === "today") refreshTable();
    showNotice("Pending job re-assigned to same technician.", "info");
  }

  function openEditModal(jobId) {
    const located = getJobById(jobId);
    if (!located) return;
    const job = located.job;

    if (job.locked) {
      showNotice("Saved jobs are locked and cannot be edited.", "warn");
      return;
    }

    // const warning = document.getElementById("edit-warning");
    // if (warning) {
    //   if (job.tech !== elogbookState.activeUser.name) {
    //     warning.classList.remove("hidden");
    //     warning.textContent = `Warning: this job is assigned to ${job.tech}. Continue only if required.`;
    //   } else {
    //     warning.classList.add("hidden");
    //     warning.textContent = "";
    //   }
    // }

    const setVal = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.value = value;
    };
    const setSelect = (id, value) => {
      const el = document.getElementById(id);
      if (!el) return;
      const nextValue = String(value || "");
      const hasOption = Array.from(el.options || []).some(
        (option) => option.value === nextValue,
      );
      if (nextValue && !hasOption) {
        const option = document.createElement("option");
        option.value = nextValue;
        option.textContent = nextValue;
        el.appendChild(option);
      }
      el.value = nextValue || el.options[0]?.value || "";
    };

    const displayDate = toReadableDate(
      job.targetDate || job.date || toIsoDate(new Date()),
    );
    const summaryPrefix = [job.loop, job.tag, job.jobType]
      .filter(Boolean)
      .join(" | ");
    const summaryText =
      summaryPrefix && job.desc
        ? `${summaryPrefix} - ${job.desc}`
        : summaryPrefix || job.desc || "";

    setVal("edit-job-id", job.id);
    const displayId = document.getElementById("edit-job-id-display");
    if (displayId) displayId.textContent = job.id;
    setVal("edit-job-date", displayDate);
    setVal("edit-job-assigned-to", job.tech || "");
    setVal("edit-job-by", job.engineer || elogbookState.activeUser.name);
    setVal("edit-job-summary", summaryText);
    setVal("edit-job-detail-date", displayDate);
    setVal("edit-job-loop-tag", `${job.loop || "N.A"} / ${job.tag || "N.A"}`);
    setVal("edit-job-type", job.jobType || "N.A");
    setVal("edit-job-inst", job.typeOfInst || "N.A");
    setVal("edit-job-desc", job.desc || "");
    setSelect("edit-job-status", job.status || "IN PROGRESS");
    setSelect("edit-job-tech", job.tech || elogbookState.technicians[0]);
    setSelect("edit-job-engineer", job.engineer || elogbookState.engineers[0]);
    setSelect("edit-job-area", job.area || elogbookState.areas[0]);
    setVal("edit-job-extra-hours", String(job.extraDutyHours || 0));

    const emergency = document.getElementById("edit-job-emergency");
    if (emergency) emergency.checked = Boolean(job.emergency);

    openOverlay("edit-modal");
  }

  function closeEditModal() {
    closeOverlay("edit-modal");
  }

  function saveEditedJob(event) {
    event.preventDefault();

    const jobId = document.getElementById("edit-job-id")?.value || "";
    const located = getJobById(jobId);
    if (!located) return;

    const job = located.job;
    if (job.locked) {
      showNotice("This job is already locked.", "warn");
      return;
    }

    const desc = document.getElementById("edit-job-desc")?.value.trim() || "";
    const status =
      document.getElementById("edit-job-status")?.value || "IN PROGRESS";
    const tech =
      document.getElementById("edit-job-tech")?.value || job.tech || "";
    const engineer = document.getElementById("edit-job-engineer")?.value || "";
    const area = document.getElementById("edit-job-area")?.value || "N.A";
    const extraHours = Number(
      document.getElementById("edit-job-extra-hours")?.value || 0,
    );
    const emergency = Boolean(
      document.getElementById("edit-job-emergency")?.checked,
    );

    if (!desc) {
      showNotice("Description is required before save.", "error");
      return;
    }

    job.desc = desc;
    job.status = status;
    job.tech = tech;
    job.engineer = engineer;
    job.area = area;
    job.emergency = emergency;
    job.pendingWrite = false;
    job.extraDutyHours = Number.isFinite(extraHours)
      ? Math.max(0, Math.trunc(extraHours))
      : 0;
    job.abnormality = job.jobType === "Abnormality";
    job.updatedAt = new Date().toISOString();

    if (status === "✓ OVER") {
      job.locked = true;
      ElogbookStore.upsertOfficerEntryFromJob(elogbookState.selectedPlant, job);
    }

    persistLocalData();
    closeEditModal();
    refreshTable();

    if (job.jobType === "ISO14001" && status === "✓ OVER") {
      const instUpper = String(job.typeOfInst || "").toUpperCase();
      if (
        ["TRANSMITTER", "CONTROL VALVE", "SWITCH", "ANALYZER"].includes(
          instUpper,
        )
      ) {
        showNotice(
          `PM detail form popup (${instUpper}) is required in backend flow.`,
          "warn",
        );
      }
    }
  }

  function renderRemarkHistory(job) {
    const history = document.getElementById("remark-history");
    if (!history) return;

    const remarks = Array.isArray(job.remarks) ? job.remarks : [];

    history.innerHTML = remarks
      .map((remark) => {
        const tone =
          remark.type === "executive" ? "color-green" : "color-purple";
        const pending = [];
        if (remark.ackTech && !remark.ackByTech)
          pending.push("Tech Ack Pending");
        if (remark.ackEng && !remark.ackByEng) pending.push("Eng Ack Pending");
        const state = pending.length ? pending.join(" | ") : "Acknowledged";

        return `
        <div class="px-3 py-2 font-14px">
          <div class="flex items-center justify-between">
            <span class="fw-bold ${tone}">${safeText(String(remark.type || "engineer").toUpperCase())}</span>
            <span class="color-secondary">${safeText(remark.author)} | ${safeText(remark.date)}</span>
          </div>
          <div class="mt-1 color-primary">${safeText(remark.text)}</div>
          <div class="mt-1 font-13px color-orange">${safeText(state)}</div>
        </div>
      `;
      })
      .join("");
  }

  function openRemarkModal(jobId) {
    const located = getJobById(jobId);
    if (!located) return;

    const setVal = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.value = value;
    };

    setVal("remark-job-id", jobId);
    setVal("remark-text", "");

    // const plantTitle = document.getElementById("remark-modal-plant");
    // if (plantTitle) plantTitle.textContent = elogbookState.selectedPlant;

    const userLabel = document.getElementById("remark-by-display");
    if (userLabel) userLabel.textContent = elogbookState.activeUser.name;

    const statusOver = document.getElementById("remark-status-over");
    if (statusOver) statusOver.checked = false;

    const ackTech = document.getElementById("remark-ack-tech");
    const ackEng = document.getElementById("remark-ack-eng");
    if (ackTech) ackTech.checked = false;
    if (ackEng) ackEng.checked = false;

    renderRemarkHistory(located.job);
    openOverlay("remark-modal");
  }

  function closeRemarkModal() {
    closeOverlay("remark-modal");
  }

  function appendRemark(event) {
    event.preventDefault();

    const jobId = document.getElementById("remark-job-id")?.value || "";
    const located = getJobById(jobId);
    if (!located) return;

    const text = document.getElementById("remark-text")?.value.trim() || "";
    const type = document.getElementById("remark-type")?.value || "engineer";
    const ackTech = Boolean(
      document.getElementById("remark-ack-tech")?.checked,
    );
    const ackEng = Boolean(document.getElementById("remark-ack-eng")?.checked);
    const markOver = Boolean(
      document.getElementById("remark-status-over")?.checked,
    );

    if (!text) {
      showNotice("Remark text is required.", "error");
      return;
    }

    const remark = {
      id: `RMK-${Date.now()}`,
      type,
      text,
      author: elogbookState.activeUser.name,
      date:
        isoDateToSlash(toIsoDate(new Date())) +
        ` ${pad2(new Date().getHours())}:${pad2(new Date().getMinutes())}`,
      ackTech,
      ackEng,
      ackByTech: false,
      ackByEng: false,
    };

    if (!Array.isArray(located.job.remarks)) {
      located.job.remarks = [];
    }
    located.job.remarks.push(remark);
    located.job.updatedAt = new Date().toISOString();

    if (markOver) {
      located.job.status = "✓ OVER";
      if (!located.job.tech) located.job.tech = elogbookState.activeUser.name; // Auto-assign if empty? Or just ensure it has a tech.
    }

    persistLocalData();
    renderRemarkHistory(located.job);

    const remarkText = document.getElementById("remark-text");
    if (remarkText) remarkText.value = "";

    refreshTable();
    closeRemarkModal(); // Close on SAVE as per legacy flow
    showNotice("Remark saved.", "info");
  }

  function openAckModal() {
    const pending = collectPendingAcks();
    const list = document.getElementById("ack-list");
    if (!list) return;

    if (!pending.length) {
      list.innerHTML =
        '<div class="px-3 py-2 font-14px color-secondary">No pending acknowledgements.</div>';
      openOverlay("ack-modal");
      return;
    }

    list.innerHTML = pending
      .map(
        ({ job, remark }) => `
      <label class="flex items-start gap-2 px-3 py-2 font-14px hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
        <input type="checkbox" class="mt-0.5 ack-check accent-blue-600" data-job-id="${safeText(job.id)}" data-remark-id="${safeText(remark.id)}">
        <div>
          <div class="fw-bold color-primary">${safeText(job.tag)} | ${safeText(job.jobType)}</div>
          <div class="color-secondary mt-0.5">${safeText(remark.text)}</div>
          <div class="font-13px color-orange mt-1">${safeText(remark.author)} | ${safeText(remark.date)}</div>
        </div>
      </label>
    `,
      )
      .join("");

    openOverlay("ack-modal");
  }

  function closeAckModal() {
    closeOverlay("ack-modal");
  }

  function acknowledgeSelectedRemarks() {
    const selected = Array.from(
      document.querySelectorAll(".ack-check:checked"),
    );
    if (!selected.length) {
      showNotice("Select at least one remark to acknowledge.", "warn");
      return;
    }

    selected.forEach((checkbox) => {
      const jobId = checkbox.getAttribute("data-job-id");
      const remarkId = checkbox.getAttribute("data-remark-id");
      const located = getJobById(jobId);
      if (!located || !Array.isArray(located.job.remarks)) return;

      const remark = located.job.remarks.find((item) => item.id === remarkId);
      if (!remark) return;

      if (elogbookState.activeUser.role === "technician") {
        remark.ackByTech = true;
      } else {
        remark.ackByEng = true;
      }
    });

    persistLocalData();
    closeAckModal();
    refreshTable();
    showNotice("Selected remarks acknowledged.", "info");
  }

  function openReminderModal() {
    const list = document.getElementById("reminder-list");
    if (!list) return;

    if (!elogbookState.jobPlannerDue.length) {
      list.innerHTML =
        '<div class="font-14px color-secondary">No due jobs from Job Planner.</div>';
      openOverlay("reminder-modal");
      return;
    }

    list.innerHTML = elogbookState.jobPlannerDue
      .map(
        (job) => `
      <div class="border border-gray-200 dark:border-dark-border rounded-sm p-3 flex items-start justify-between gap-3 bg-gray-50 dark:bg-transparent">
        <div>
          <div class="font-14px fw-bold color-primary">${safeText(job.tag)} <span class="color-purple">(${safeText(job.jobType)})</span></div>
          <div class="font-14px color-secondary mt-1">${safeText(job.desc)}</div>
          <div class="font-13px color-orange mt-1">Due: ${safeText(isoDateToSlash(job.dueDate))}</div>
        </div>
        <button onclick="assignReminder('${safeText(job.id)}')" class="font-13px px-2 py-1 rounded-sm border border-purple-200 dark:border-purple-500/40 color-purple hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors">Assign</button>
      </div>
    `,
      )
      .join("");

    openOverlay("reminder-modal");
  }

  function closeReminderModal() {
    closeOverlay("reminder-modal");
  }

  function assignReminder(reminderId) {
    const reminder = elogbookState.jobPlannerDue.find(
      (item) => item.id === reminderId,
    );
    if (!reminder) return;
    closeReminderModal();
    openJobModal("assign", "today", reminder);
  }

  function assignFromPendingSource(sourceId, rowType) {
    let payload = null;

    if (rowType === "ojr") {
      payload =
        elogbookState.ojrPending.find((item) => item.id === sourceId) || null;
    } else {
      const weekly = (elogbookState.jobsByView.weekly || []).find(
        (item) => item.id === sourceId,
      );
      if (weekly) {
        payload = {
          area: weekly.area,
          loop: weekly.loop,
          tag: weekly.tag,
          jobType: weekly.jobType,
          instType: weekly.typeOfInst,
          desc: weekly.desc || "Re-assigned from weekly pending",
          tech: weekly.tech,
        };
      }
    }

    if (!payload) return;
    openJobModal("assign", "today", payload);
  }

  function checkPendingThresholdAlerts() {
    const pendingCount = elogbookState.allJobs.filter(
      (job) => job.pendingWrite,
    ).length;
    if (pendingCount > 150) {
      showNotice(
        "Pending jobs exceeded 150. Pending log opened automatically.",
        "error",
      );
      elogbookState.pendingOnlyMode = true;
      refreshTable();
      return;
    }
    if (pendingCount > 50) {
      showNotice("Pending jobs exceeded 50.", "warn");
    }
  }

  function initHeaderAndPlantChip() {
    if (typeof renderHeader === "function") {
      renderHeader({
        title: `${elogbookState.selectedPlant} Logbook`,
        breadcrumbs: [
          {
            label: "Technician Log",
            href: "/src/pages/technician_logbook.html",
          },
          { label: `${elogbookState.selectedPlant} Plant Detail` },
        ],
        backLink: "/src/pages/technician_logbook.html",
      });
    }

    const chip = document.getElementById("plant-unit-chip");
    if (chip) {
      chip.textContent = `Plant: ${elogbookState.selectedPlant}`;
    }

    document.title = `GNFC | ${elogbookState.selectedPlant} Logbook`;
  }

  function initReminders() {
    const today = toIsoDate(new Date());
    const tomorrow = toIsoDate(
      new Date(startOfDay(new Date()).getTime() + DAY_MS),
    );
    elogbookState.jobPlannerDue = [
      {
        id: "JP-1",
        area: "MF",
        loop: "Loop-202",
        tag: "PT5087K",
        jobType: "ISO14001",
        instType: "TRANSMITTER",
        dueDate: today,
        desc: "ISO planned PM due today.",
      },
      {
        id: "JP-2",
        area: "DCS",
        loop: "Loop-DCS",
        tag: "SYS-MAIN",
        jobType: "ISO14001",
        instType: "SWITCH",
        dueDate: tomorrow,
        desc: "Switch panel compliance check due tomorrow.",
      },
    ];
  }

  function initModalEvents() {
    const jobForm = document.getElementById("job-modal-form");
    const editForm = document.getElementById("edit-modal-form");
    const remarkForm = document.getElementById("remark-modal-form");
    const editTech = document.getElementById("edit-job-tech");
    const editAssignedTo = document.getElementById("edit-job-assigned-to");
    const editEngineer = document.getElementById("edit-job-engineer");
    const editBy = document.getElementById("edit-job-by");

    if (jobForm) jobForm.addEventListener("submit", saveJobFromModal);
    if (editForm) editForm.addEventListener("submit", saveEditedJob);
    if (remarkForm) remarkForm.addEventListener("submit", appendRemark);
    if (editTech && editAssignedTo) {
      editTech.addEventListener("change", () => {
        editAssignedTo.value = editTech.value || "";
      });
    }
    if (editEngineer && editBy) {
      editEngineer.addEventListener("change", () => {
        editBy.value = editEngineer.value || elogbookState.activeUser.name;
      });
    }

    [
      "job-modal",
      "edit-modal",
      "remark-modal",
      "ack-modal",
      "reminder-modal",
      "history-type-modal",
      "general-history-modal",
    ].forEach((id) => {
      const overlay = document.getElementById(id);
      if (!overlay) return;
      overlay.addEventListener("click", (event) => {
        if (event.target !== overlay) return;
        if (id === "job-modal") closeJobModal();
        if (id === "edit-modal") closeEditModal();
        if (id === "remark-modal") closeRemarkModal();
        if (id === "ack-modal") closeAckModal();
        if (id === "reminder-modal") closeReminderModal();
        if (id === "history-type-modal") closeHistoryTypeModal();
        if (id === "general-history-modal") closeGeneralHistoryModal();
      });
    });
  }

  function initTable() {
    plantLogTable = new PlantLogTable({
      containerId: "#plant-table",
      data: getFilteredJobs(),
      itemsPerPage: 6,
      onRender: renderJobRow,
    });

    global.plantLogTable = plantLogTable;
    refreshTable();
  }

  function initInitialView() {
    const targetId = currentView === "prev" ? "btn-prev" : `btn-${currentView}`;
    const button =
      document.getElementById(targetId) || document.getElementById("btn-today");
    activateView(currentView, button);
  }

  function bootstrap() {
    parseQueryContext();
    refreshLocalData();
    initReminders();
    initHeaderAndPlantChip();
    populateJobTypeDropdown();
    populateJobModalLookups();
    initModalEvents();
    initTable();
    initInitialView();
    updateAcknowledgeButton();
    checkPendingThresholdAlerts();
  }

  /* ── Add To History Flow ───────────────────────── */

  let historyTargetJobId = null;

  function openAddToHistoryModal(jobId) {
    historyTargetJobId = jobId;
    openOverlay("history-type-modal");
  }

  function closeHistoryTypeModal() {
    closeOverlay("history-type-modal");
  }

  function selectHistoryType(type) {
    closeHistoryTypeModal();

    if (type === "system") {
      // System History — auto-export and redirect
      const located = getJobById(historyTargetJobId);
      if (!located) {
        showNotice("Job not found.", "error");
        return;
      }
      const job = located.job;

      const record = {
        id: `SH-${Date.now()}`,
        type: "system",
        area: job.area || "",
        loop: job.loop || "",
        tag: job.tag || "",
        instType: job.typeOfInst || "",
        jobType: job.jobType || "",
        date: job.targetDate || toIsoDate(new Date()),
        desc: job.desc || "",
        tech: job.tech || "",
        eng: job.engineer || elogbookState.activeUser.name,
        status: "OVER",
        exportedAt: new Date().toISOString(),
      };

      const saved = JSON.parse(
        localStorage.getItem("gnfc_job_history") || "[]",
      );
      saved.unshift(record);
      localStorage.setItem("gnfc_job_history", JSON.stringify(saved));
      showNotice("System History record exported successfully.", "info");
      return;
    }

    // General History — open the form modal pre-filled
    const located = getJobById(historyTargetJobId);
    if (!located) {
      showNotice("Job not found.", "error");
      return;
    }
    const job = located.job;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || "";
    };
    const setSelect = (id, val) => {
      const el = document.getElementById(id);
      if (!el) return;
      const v = String(val || "");
      const has = Array.from(el.options).some((o) => o.value === v);
      if (v && !has) {
        const opt = document.createElement("option");
        opt.value = v;
        opt.textContent = v;
        el.appendChild(opt);
      }
      el.value = v || el.options[0]?.value || "";
    };

    setVal("hist-date", job.targetDate || toIsoDate(new Date()));
    setVal("hist-loop", job.loop || "");
    setVal("hist-insttype", job.typeOfInst || "");
    setSelect("hist-insttag", job.typeOfInst || "");
    setSelect("hist-jobtype", job.jobType || "");
    setVal("hist-desc", job.desc || "");
    setSelect("hist-status", "OVER");
    setSelect("hist-tech", job.tech || "");
    setSelect("hist-eng", job.engineer || elogbookState.activeUser.name);
    setSelect("hist-area", job.area || "");

    openOverlay("general-history-modal");
  }

  function closeGeneralHistoryModal() {
    closeOverlay("general-history-modal");
  }

  function addToHistory() {
    const record = {
      id: `GH-${Date.now()}`,
      type: "general",
      date: document.getElementById("hist-date")?.value || "",
      loop: document.getElementById("hist-loop")?.value || "",
      tag: "",
      instType: document.getElementById("hist-insttype")?.value || "",
      instTag: document.getElementById("hist-insttag")?.value || "",
      jobType: document.getElementById("hist-jobtype")?.value || "",
      desc: document.getElementById("hist-desc")?.value || "",
      status: document.getElementById("hist-status")?.value || "",
      tech: document.getElementById("hist-tech")?.value || "",
      eng: document.getElementById("hist-eng")?.value || "",
      area: document.getElementById("hist-area")?.value || "",
      exportedAt: new Date().toISOString(),
    };

    if (!record.desc) {
      showNotice("Job Description is required.", "error");
      return;
    }

    const saved = JSON.parse(localStorage.getItem("gnfc_job_history") || "[]");
    saved.unshift(record);
    localStorage.setItem("gnfc_job_history", JSON.stringify(saved));

    closeGeneralHistoryModal();
    showNotice("General History record added successfully.", "info");
  }

  global.switchView = switchView;
  global.applyFilters = applyFilters;
  global.toggleJobFilter = toggleJobFilter;
  global.togglePendingMode = togglePendingMode;
  global.filterTagsForLoop = filterTagsForLoop;
  global.openJobModal = openJobModal;
  global.closeJobModal = closeJobModal;
  global.assignFromPendingSource = assignFromPendingSource;
  global.reassignJob = reassignJob;
  global.openEditModal = openEditModal;
  global.closeEditModal = closeEditModal;
  global.openRemarkModal = openRemarkModal;
  global.closeRemarkModal = closeRemarkModal;
  global.openAckModal = openAckModal;
  global.closeAckModal = closeAckModal;
  global.acknowledgeSelectedRemarks = acknowledgeSelectedRemarks;
  global.openReminderModal = openReminderModal;
  global.closeReminderModal = closeReminderModal;
  global.assignReminder = assignReminder;
  global.openAddToHistoryModal = openAddToHistoryModal;
  global.closeHistoryTypeModal = closeHistoryTypeModal;
  global.selectHistoryType = selectHistoryType;
  global.closeGeneralHistoryModal = closeGeneralHistoryModal;
  function openPriorityModal(jobId) {
    const located = getJobById(jobId);
    if (!located) return;
    
    const currentPriority = located.job.priority || 0;
    document.getElementById("priority-job-id").value = jobId;
    document.getElementById("priority-value").value = currentPriority;
    
    const grid = document.getElementById("priority-grid");
    if (grid) {
      grid.innerHTML = "";
      for (let i = 0; i <= 25; i++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = i;
        const isSelected = i === currentPriority;
        
        // Base classes
        let classes = "w-full aspect-square flex items-center justify-center rounded-sm font-14px fw-bold border transition-all transform active:scale-95";
        
        // Conditional classes
        if (isSelected) {
          classes += " bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-200 dark:ring-purple-900";
        } else {
          classes += " bg-white dark:bg-dark-elem border-gray-200 dark:border-dark-border color-primary hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300";
        }
        
        btn.className = classes;
        
        // Click handler
        btn.onclick = () => {
          document.getElementById("priority-value").value = i;
          // Update visual state
          Array.from(grid.children).forEach(child => {
            child.className = "w-full aspect-square flex items-center justify-center rounded-sm font-14px fw-bold border transition-all transform active:scale-95 bg-white dark:bg-dark-elem border-gray-200 dark:border-dark-border color-primary hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300";
          });
          btn.className = "w-full aspect-square flex items-center justify-center rounded-sm font-14px fw-bold border transition-all transform active:scale-95 bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-200 dark:ring-purple-900";
        };
        
        grid.appendChild(btn);
      }
    }
    
    openOverlay("priority-modal");
  }

  function closePriorityModal() {
    closeOverlay("priority-modal");
  }

  function savePriority(e) {
    e.preventDefault();
    const jobId = document.getElementById("priority-job-id").value;
    const priority = parseInt(document.getElementById("priority-value").value, 10);
    
    updateJobInState(jobId, { priority });
    closePriorityModal();
    showNotice(`Priority set to ${priority}`, "success");
    refreshTable();
  }

  document.getElementById("priority-modal-form")?.addEventListener("submit", savePriority);

  global.addToHistory = addToHistory;
  global.openPriorityModal = openPriorityModal;
  global.closePriorityModal = closePriorityModal;

  document.addEventListener("DOMContentLoaded", bootstrap);
})(window);
