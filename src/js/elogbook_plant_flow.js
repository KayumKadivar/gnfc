/* global PlantLogTable, renderHeader */

var currentView = "today";
var plantLogTable;

const ELOGBOOK_VIEWS = ["today", "tomorrow", "prev", "weekly", "monthly"];
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const STATUS_FILTER_ALL = "__all__";

const elogbookState = {
  selectedPlant: "AA",
  activeUser: {
    name: "PHS",
    role: "engineer",
  },
  pendingOnlyMode: false,
  selectedStatus: "",
  modalMode: "assign",
  modalTargetView: "today",
  jobsByView: {},
  technicians: ["PHS", "NRK", "DPB", "AMS", "PHB", "IT", "KBP"],
  engineers: ["PHS", "AMS", "PHB", "MIV", "VAA"],
  areas: ["FA", "MF", "DCS", "UTIL", "AA", "INST"],
  jobTypes: ["Routine Check", "Calibration", "Breakdown", "Abnormality", "ISO14001", "Shutdown"],
  instrumentTypes: ["TRANSMITTER", "CONTROL VALVE", "SWITCH", "ANALYZER", "DCS", "OTHERS"],
  loopTagMap: {
    "Loop-202": ["PT5087K", "PT5082A", "PT5091F"],
    "Loop-101": ["FT5021A", "FT5021B", "FT5023K"],
    "Loop-DCS": ["SYS-1", "SYS-MAIN", "ESD-CHK"],
    "Loop-UTIL": ["AIR-COMP", "COND-VALVE", "LT38358"],
  },
  ojrPending: [],
  jobPlannerDue: [],
};

function normalizeView(viewName) {
  return ELOGBOOK_VIEWS.includes(viewName) ? viewName : "today";
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function formatDateSlash(date) {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function formatDateDot(date) {
  return `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}.${date.getFullYear()}`;
}

function formatDateIso(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function parseSlashDate(dateText) {
  if (!dateText) return null;
  const [dd, mm, yyyy] = dateText.split("/").map(Number);
  if (!dd || !mm || !yyyy) return null;
  return new Date(yyyy, mm - 1, dd);
}

function dateOffsetFromNow(days) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return new Date(now.getTime() + days * ONE_DAY_MS);
}

function viewTitle(viewName) {
  const map = {
    today: "Today Log Book",
    tomorrow: "Tomorrow Log Book",
    prev: "Prev Day Log Book",
    weekly: "Weekly Log Book",
    monthly: "Monthly Log Book",
  };
  return map[viewName] || map.today;
}

function viewDateText(viewName) {
  const today = dateOffsetFromNow(0);
  const tomorrow = dateOffsetFromNow(1);
  const prev = dateOffsetFromNow(-1);
  if (viewName === "today") return formatDateDot(today);
  if (viewName === "tomorrow") return formatDateDot(tomorrow);
  if (viewName === "prev") return formatDateDot(prev);
  if (viewName === "weekly") return `${formatDateDot(dateOffsetFromNow(-6))} - ${formatDateDot(today)}`;
  return today.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
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

  const bgClass =
    tone === "error"
      ? "bg-red-600/90 border-red-500"
      : tone === "warn"
      ? "bg-amber-600/90 border-amber-500"
      : "bg-blue-600/90 border-blue-500";
  const toast = document.createElement("div");
  toast.className = `text-xs font-bold border ${bgClass} text-white px-3 py-2 rounded shadow-lg`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

function makeInitials(name) {
  const tokenized = String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t[0].toUpperCase());
  return tokenized.slice(0, 3).join("") || "NA";
}

function makeJob(partial) {
  const payload = partial || {};
  const id = payload.id || `J-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const remarks = Array.isArray(payload.remarks) ? payload.remarks : [];
  return {
    id,
    sr: payload.sr || "00",
    date: payload.date || formatDateSlash(new Date()),
    area: payload.area || "N.A",
    loop: payload.loop || "N.A",
    tag: payload.tag || "N.A",
    tagSubtitle: payload.tagSubtitle || payload.typeOfInst || "NOTAG",
    jobType: payload.jobType || "Routine Check",
    typeOfInst: payload.typeOfInst || "OTHERS",
    jobRef: payload.jobRef || `By:${payload.assignedBy || elogbookState.activeUser.name} : ${payload.date || formatDateSlash(new Date())}`,
    jobLabel: payload.jobLabel || "",
    tech: payload.tech || elogbookState.activeUser.name,
    desc: payload.desc || "",
    engineer: payload.engineer || "",
    engInitials: payload.engInitials || "",
    status: payload.status || "",
    statusColor: payload.statusColor || "",
    remarks,
    pendingWrite: Boolean(payload.pendingWrite),
    emergency: Boolean(payload.emergency),
    abnormality: Boolean(payload.abnormality),
    locked: Boolean(payload.locked),
    extraDutyHours: Number(payload.extraDutyHours || 0),
    assignedBy: payload.assignedBy || elogbookState.activeUser.name,
    source: payload.source || "Manual",
  };
}

function cloneJobForReassign(job) {
  return makeJob({
    date: formatDateSlash(dateOffsetFromNow(0)),
    area: job.area,
    loop: job.loop,
    tag: job.tag,
    tagSubtitle: job.tagSubtitle,
    jobType: job.jobType,
    typeOfInst: job.typeOfInst,
    jobRef: `Re-Assign:${elogbookState.activeUser.name} : ${formatDateSlash(dateOffsetFromNow(0))}`,
    jobLabel: job.jobLabel,
    tech: job.tech,
    desc: "",
    engineer: "",
    engInitials: "",
    status: "",
    statusColor: "",
    remarks: [],
    pendingWrite: true,
    emergency: false,
    abnormality: job.jobType === "Abnormality",
    locked: false,
    assignedBy: elogbookState.activeUser.name,
    source: "Re-Assigned",
  });
}

function seedMockData() {
  const today = formatDateSlash(dateOffsetFromNow(0));
  const prev = formatDateSlash(dateOffsetFromNow(-1));
  const older = formatDateSlash(dateOffsetFromNow(-2));
  const oldMonth = formatDateSlash(dateOffsetFromNow(-18));

  const jobs = {
    today: [
      makeJob({
        id: "J-1001",
        date: today,
        area: "FA",
        loop: "Loop-202",
        tag: "PT5087K",
        tagSubtitle: "TRANSMITTER",
        jobType: "Routine Check",
        typeOfInst: "TRANSMITTER",
        jobRef: `By:PHS : ${today}`,
        tech: "NRK",
        pendingWrite: true,
        source: "Assign(Today)",
      }),
      makeJob({
        id: "J-1002",
        date: today,
        area: "MF",
        loop: "Loop-101",
        tag: "FT5021A",
        tagSubtitle: "CONTROL VALVE",
        jobType: "Abnormality",
        typeOfInst: "CONTROL VALVE",
        jobRef: `By:AMS : ${today}`,
        tech: "DPB",
        desc: "Valve position hunting observed near 44%.",
        engineer: "AMS",
        engInitials: "AMS",
        status: "IN PROGRESS",
        statusColor: "orange",
        abnormality: true,
      }),
      makeJob({
        id: "J-1003",
        date: today,
        area: "DCS",
        loop: "Loop-DCS",
        tag: "SYS-1",
        tagSubtitle: "DCS",
        jobType: "ISO14001",
        typeOfInst: "SWITCH",
        jobRef: `By:PHB : ${today}`,
        tech: "KBP",
        desc: "Routine ISO check complete.",
        engineer: "PHB",
        engInitials: "PHB",
        status: "✓ OVER",
        statusColor: "green",
        locked: true,
        remarks: [
          {
            id: "RMK-1",
            type: "executive",
            text: "Check acknowledgement from technician.",
            author: "VAA",
            date: `${today} 08:40`,
            ackTech: true,
            ackEng: true,
            ackByTech: false,
            ackByEng: false,
          },
        ],
      }),
    ],
    tomorrow: [
      makeJob({
        id: "J-2001",
        date: formatDateSlash(dateOffsetFromNow(1)),
        area: "AA",
        loop: "Loop-UTIL",
        tag: "AIR-COMP",
        tagSubtitle: "ANALYZER",
        jobType: "Calibration",
        typeOfInst: "ANALYZER",
        jobRef: `By:PHS : ${today}`,
        tech: "AMS",
        pendingWrite: true,
        source: "Assign(Tomorrow)",
      }),
    ],
    prev: [
      makeJob({
        id: "J-3001",
        date: prev,
        area: "FA",
        loop: "Loop-101",
        tag: "FT5021B",
        tagSubtitle: "TRANSMITTER",
        jobType: "Breakdown",
        typeOfInst: "TRANSMITTER",
        jobRef: `Ref:PHS : ${prev}`,
        tech: "NRK",
        desc: "Process alarm was due to loose cable. Tightened and tested.",
        engineer: "PHS",
        engInitials: "PHS",
        status: "✓ OVER",
        statusColor: "green",
        locked: true,
      }),
      makeJob({
        id: "J-3002",
        date: prev,
        area: "MF",
        loop: "Loop-202",
        tag: "PT5091F",
        tagSubtitle: "TRANSMITTER",
        jobType: "Routine Check",
        typeOfInst: "TRANSMITTER",
        jobRef: `Ref:AMS : ${prev}`,
        tech: "DPB",
        pendingWrite: true,
        source: "Pending",
      }),
    ],
    weekly: [
      makeJob({
        id: "J-4001",
        date: prev,
        area: "DCS",
        loop: "Loop-DCS",
        tag: "ESD-CHK",
        tagSubtitle: "DCS",
        jobType: "Shutdown",
        typeOfInst: "DCS",
        jobRef: `Ref:PHB : ${prev}`,
        tech: "IT",
        desc: "Shutdown interlock simulation completed.",
        engineer: "PHB",
        engInitials: "PHB",
        status: "✓ OVER",
        statusColor: "green",
        locked: true,
      }),
      makeJob({
        id: "J-4002",
        date: older,
        area: "UTIL",
        loop: "Loop-UTIL",
        tag: "COND-VALVE",
        tagSubtitle: "CONTROL VALVE",
        jobType: "Routine Check",
        typeOfInst: "CONTROL VALVE",
        jobRef: `Ref:PHS : ${older}`,
        tech: "NRK",
        pendingWrite: true,
        source: "Weekly Pending",
      }),
    ],
    monthly: [
      makeJob({
        id: "J-5001",
        date: oldMonth,
        area: "AA",
        loop: "Loop-202",
        tag: "PT5082A",
        tagSubtitle: "TRANSMITTER",
        jobType: "Calibration",
        typeOfInst: "TRANSMITTER",
        jobRef: `Ref:PHS : ${oldMonth}`,
        tech: "AMS",
        desc: "Monthly loop calibration done and documented.",
        engineer: "PHS",
        engInitials: "PHS",
        status: "✓ OVER",
        statusColor: "green",
        locked: true,
      }),
    ],
  };

  Object.keys(jobs).forEach((view) => resequenceJobs(view, jobs));

  elogbookState.ojrPending = [
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
  ];

  elogbookState.jobPlannerDue = [
    {
      id: "JP-1",
      area: "MF",
      loop: "Loop-202",
      tag: "PT5087K",
      jobType: "ISO14001",
      instType: "TRANSMITTER",
      dueDate: formatDateSlash(dateOffsetFromNow(0)),
      desc: "ISO planned PM due today.",
    },
    {
      id: "JP-2",
      area: "DCS",
      loop: "Loop-DCS",
      tag: "SYS-MAIN",
      jobType: "ISO14001",
      instType: "SWITCH",
      dueDate: formatDateSlash(dateOffsetFromNow(1)),
      desc: "Switch panel compliance check due tomorrow.",
    },
  ];

  return jobs;
}

function resequenceJobs(viewName, store) {
  const container = store || elogbookState.jobsByView;
  const jobs = container[viewName] || [];
  jobs.forEach((job, index) => {
    job.sr = pad2(index + 1);
  });
}

function parseQueryContext() {
  const params = new URLSearchParams(window.location.search);
  const plant = (params.get("plant") || "").trim();
  if (plant) elogbookState.selectedPlant = plant;
  currentView = normalizeView(params.get("view") || "today");
}

function initHeaderAndChips() {
  document.title = `GNFC | ${elogbookState.selectedPlant} Logbook`;

  if (typeof renderHeader === "function") {
    renderHeader({
      title: `${elogbookState.selectedPlant} Logbook`,
      breadcrumbs: [
        { label: "Technician Log", href: "/src/pages/technician_logbook.html" },
        { label: `${elogbookState.selectedPlant} Plant Detail` },
      ],
      backLink: "/src/pages/technician_logbook.html",
    });
  }

  const chipLabel = document.querySelector("#plant-unit-chip span:last-child");
  if (chipLabel) chipLabel.textContent = `Plant: ${elogbookState.selectedPlant}`;
}

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getStatusClass(statusColor) {
  if (statusColor === "green") return "text-gnfc-green bg-gnfc-green/10 border-gnfc-green/20";
  if (statusColor === "orange") return "text-gnfc-orange bg-gnfc-orange/10 border-gnfc-orange/20";
  return "text-slate-500 dark:text-dark-muted bg-slate-100 dark:bg-dark-bg border-slate-300 dark:border-dark-border";
}

function hasPendingAckForUser(job) {
  if (!Array.isArray(job.remarks) || !job.remarks.length) return false;
  return job.remarks.some((remark) => {
    if (elogbookState.activeUser.role === "technician") {
      return remark.ackTech && !remark.ackByTech;
    }
    return remark.ackEng && !remark.ackByEng;
  });
}

function renderJobRow(job) {
  const rowTint = job.emergency ? "bg-amber-500/10" : "";
  const srTint = job.pendingWrite ? "bg-pink-500/20 text-pink-200 cursor-pointer" : "";
  const descWrapClass = job.abnormality ? "border border-red-500/60 rounded-sm px-1.5 py-1 text-red-200" : "";
  const statusClass = getStatusClass(job.statusColor);
  const canEdit = !job.locked;
  const remarksCount = Array.isArray(job.remarks) ? job.remarks.length : 0;
  const pendingAck = hasPendingAckForUser(job);
  const srClick = canEdit ? `onclick="openEditModal('${job.id}')"` : "";
  const isPendingStatus = job.pendingWrite && !job.desc;

  return `
    <tr class="hover:bg-white/5 transition-colors border-b border-dark-border group ${rowTint}">
      <td class="p-2 text-center font-mono border-r border-dark-border ${srTint}" ${srClick}>${escapeHTML(job.sr)}</td>
      <td class="p-2 font-bold text-slate-700 dark:text-white border-r border-dark-border">${escapeHTML(job.area)}</td>
      <td class="p-2 border-r border-dark-border">
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="text-xs text-blue-600 dark:text-gnfc-blue font-bold">${escapeHTML(job.loop)}</div>
            <span class="inline-block mt-1 text-[10px] text-slate-500 dark:text-dark-muted bg-slate-100 dark:bg-dark-bg px-1.5 py-0.5 rounded border border-dark-border font-mono">${escapeHTML(job.tag)}</span>
          </div>
          ${job.pendingWrite ? `<button onclick="event.stopPropagation(); reassignJob('${job.id}')" class="text-[10px] px-1 py-0.5 border border-red-500/50 text-red-300 rounded-sm hover:bg-red-500/20" title="Re-Assign Same Job">^^</button>` : ""}
        </div>
      </td>
      <td class="p-2 border-r border-dark-border">
        <div class="font-medium text-slate-600 dark:text-gray-300">${escapeHTML(job.jobType)}</div>
        <div class="text-[10px] text-slate-400 dark:text-dark-muted mt-0.5">${escapeHTML(job.jobRef)}</div>
        ${job.jobLabel ? `<span class="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-gnfc-blue/10 text-blue-600 dark:text-gnfc-blue border border-dark-border">${escapeHTML(job.jobLabel)}</span>` : ""}
      </td>
      <td class="p-2 text-center font-bold text-slate-500 dark:text-dark-muted border-r border-dark-border">${escapeHTML(job.tech)}</td>
      <td class="p-2 text-slate-500 dark:text-gray-300 border-r border-dark-border leading-relaxed">
        <div class="${descWrapClass}">${escapeHTML(job.desc || (isPendingStatus ? "Assigned. Awaiting technician log entry." : ""))}</div>
      </td>
      <td class="p-2 text-center border-r border-dark-border">
        <div class="font-bold text-slate-600 dark:text-gray-300">${escapeHTML(job.engineer || "--")}</div>
        <div class="text-[10px] text-slate-400 dark:text-dark-muted">${escapeHTML(job.engInitials || "--")}</div>
      </td>
      <td class="p-2 text-center border-r border-dark-border">
        ${job.status ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold border ${statusClass}">${escapeHTML(job.status)}</span>` : `<span class="text-[10px] text-pink-300">ASSIGNED</span>`}
        ${canEdit ? `<button onclick="event.stopPropagation(); openEditModal('${job.id}')" class="mt-1 text-[10px] px-1.5 py-0.5 rounded border border-dark-border text-slate-400 hover:text-white hover:border-gnfc-blue">Edit</button>` : `<div class="mt-1 text-[10px] text-slate-500">Locked</div>`}
      </td>
      <td class="p-2 text-slate-600 dark:text-gray-400">
        <button onclick="openRemarkModal('${job.id}')" class="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 border border-dark-border rounded-sm hover:border-gnfc-blue hover:text-white">
          <i class="ph-bold ph-chat-circle-dots"></i> ${remarksCount}
        </button>
        ${pendingAck ? `<div class="mt-1 text-[10px] text-amber-300">Ack pending</div>` : ""}
      </td>
    </tr>
  `;
}

function getCurrentViewJobs() {
  return elogbookState.jobsByView[currentView] || [];
}

function getFilteredJobs(includeStatus) {
  let rows = [...getCurrentViewJobs()];
  const selectedType = document.getElementById("job-type-select")?.value || "";
  const startDate = document.getElementById("start-date")?.value || "";
  const endDate = document.getElementById("end-date")?.value || "";

  if (elogbookState.pendingOnlyMode) {
    rows = rows.filter((job) => job.pendingWrite);
  }

  if (selectedType) {
    rows = rows.filter((job) => job.jobType === selectedType);
  }

  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    rows = rows.filter((job) => {
      const d = parseSlashDate(job.date);
      if (!d) return false;
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });
  }

  if (includeStatus && elogbookState.selectedStatus) {
    rows = rows.filter((job) => job.status === elogbookState.selectedStatus);
  }

  return rows.map((job, index) => ({
    ...job,
    sr: pad2(index + 1),
  }));
}

function refreshTable() {
  if (!plantLogTable) return;
  const rows = getFilteredJobs(true);
  plantLogTable.setData(rows);

  const searchValue = document.getElementById("table-search")?.value || "";
  plantLogTable.setSearch(searchValue);
  populateStatusDropdown();
  updatePendingModeButton();
  updateAcknowledgeButton();
}

function updatePendingModeButton() {
  const button = document.getElementById("toggle-pending-btn");
  if (!button) return;
  if (elogbookState.pendingOnlyMode) {
    button.textContent = "Pending Log (ON)";
    button.classList.add("bg-gnfc-orange/20");
  } else {
    button.textContent = "Pending Log";
    button.classList.remove("bg-gnfc-orange/20");
  }
}

function initTable() {
  plantLogTable = new PlantLogTable({
    containerId: "#plant-table",
    data: getFilteredJobs(true),
    itemsPerPage: 6,
    onRender: renderJobRow,
  });
  refreshTable();
}

function populateJobTypeDropdown() {
  const select = document.getElementById("job-type-select");
  if (!select) return;
  const unique = [...new Set(elogbookState.jobTypes)].sort();
  select.innerHTML = '<option value="">All Jobs</option>';
  unique.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    select.appendChild(option);
  });
}

function populateStatusDropdown() {
  const dropdown = document.getElementById("status-filter-dropdown");
  if (!dropdown) return;
  const statuses = [...new Set(getFilteredJobs(false).map((row) => row.status).filter(Boolean))].sort();

  let html = `<button class="w-full text-left px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-dark-border ${elogbookState.selectedStatus ? "" : "text-blue-600 dark:text-gnfc-blue"}" onclick="filterStatus('${STATUS_FILTER_ALL}')">All</button>`;
  statuses.forEach((status) => {
    const escaped = escapeHTML(status);
    const active = elogbookState.selectedStatus === status ? "text-blue-600 dark:text-gnfc-blue" : "";
    html += `<button class="w-full text-left px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-dark-border ${active}" onclick="filterStatus('${escaped}')">${escaped}</button>`;
  });

  dropdown.innerHTML = html;
}

function toggleStatusFilter(event) {
  event.stopPropagation();
  const dropdown = document.getElementById("status-filter-dropdown");
  if (!dropdown) return;
  dropdown.classList.toggle("hidden");

  if (!dropdown.classList.contains("hidden")) {
    const closeDropdown = (e) => {
      if (!e.target.closest("#status-filter-dropdown") && !e.target.closest('button[onclick="toggleStatusFilter(event)"]')) {
        dropdown.classList.add("hidden");
        document.removeEventListener("click", closeDropdown);
      }
    };
    document.addEventListener("click", closeDropdown);
  }
}

function filterStatus(statusValue) {
  const normalized = statusValue === STATUS_FILTER_ALL ? "" : statusValue;
  elogbookState.selectedStatus = normalized;
  const dropdown = document.getElementById("status-filter-dropdown");
  if (dropdown) dropdown.classList.add("hidden");
  refreshTable();
}

function applyFilters() {
  refreshTable();
}

function toggleJobFilter() {
  const filterBar = document.getElementById("job-filter-bar");
  if (!filterBar) return;
  filterBar.classList.toggle("hidden");
}

function activateView(viewName, activeButton) {
  currentView = normalizeView(viewName);
  window.currentView = currentView;
  elogbookState.pendingOnlyMode = false;

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.className = "tab-btn px-4 py-1 text-xs font-medium text-slate-500 dark:text-dark-muted hover:text-slate-700 dark:hover:text-white transition-colors";
  });

  if (activeButton) {
    activeButton.className =
      "tab-btn px-4 py-1 text-xs font-bold text-blue-600 dark:text-gnfc-orange bg-white dark:bg-[#323232] shadow-sm border border-slate-200 dark:border-dark-border rounded-sm transition-colors";
  }

  const viewTitleEl = document.getElementById("view-title");
  const viewDateEl = document.getElementById("view-date");
  if (viewTitleEl) viewTitleEl.textContent = viewTitle(currentView);
  if (viewDateEl) viewDateEl.textContent = viewDateText(currentView);

  document.getElementById("table-search").value = "";
  refreshTable();
}

function switchView(btn, viewName) {
  activateView(viewName, btn);
}

function togglePendingMode() {
  elogbookState.pendingOnlyMode = !elogbookState.pendingOnlyMode;
  refreshTable();
}

function getJobById(jobId) {
  for (const viewName of ELOGBOOK_VIEWS) {
    const found = (elogbookState.jobsByView[viewName] || []).find((job) => job.id === jobId);
    if (found) return { job: found, viewName };
  }
  return null;
}

function renderOjrPendingList() {
  const listEl = document.getElementById("ojr-pending-list");
  if (!listEl) return;

  const weeklyPending = (elogbookState.jobsByView.weekly || []).filter((job) => job.pendingWrite);
  const allRows = [
    ...elogbookState.ojrPending.map((item) => ({ ...item, rowType: "ojr" })),
    ...weeklyPending.map((item) => ({
      id: item.id,
      area: item.area,
      loop: item.loop,
      tag: item.tag,
      jobType: item.jobType,
      instType: item.typeOfInst,
      desc: item.desc || "Pending from weekly logbook",
      rowType: "weekly",
    })),
  ];

  if (!allRows.length) {
    listEl.innerHTML = '<div class="px-3 py-2 text-xs text-dark-muted">No OJR / Weekly pending jobs.</div>';
    return;
  }

  listEl.innerHTML = allRows
    .map(
      (item) => `
      <div class="px-3 py-2 text-xs flex items-start justify-between gap-3">
        <div class="space-y-0.5">
          <div class="font-bold text-white">${escapeHTML(item.tag)} <span class="text-dark-muted">(${escapeHTML(item.loop)})</span></div>
          <div class="text-dark-muted">${escapeHTML(item.jobType)} | ${escapeHTML(item.desc)}</div>
        </div>
        <button onclick="assignFromPendingSource('${item.id}', '${item.rowType}')" class="shrink-0 text-[10px] px-2 py-0.5 border border-gnfc-blue/40 text-gnfc-blue rounded-sm hover:bg-gnfc-blue/20">Assign</button>
      </div>`
    )
    .join("");
}

function populateJobModalLookups() {
  const techSelect = document.getElementById("job-tech");
  const loopSelect = document.getElementById("job-loop");
  const areaSelect = document.getElementById("job-area");
  const typeSelect = document.getElementById("job-type");
  const instSelect = document.getElementById("job-inst");
  const editEng = document.getElementById("edit-job-engineer");
  const editArea = document.getElementById("edit-job-area");

  if (techSelect) {
    techSelect.innerHTML = elogbookState.technicians.map((name) => `<option value="${escapeHTML(name)}">${escapeHTML(name)}</option>`).join("");
  }

  if (loopSelect) {
    loopSelect.innerHTML = Object.keys(elogbookState.loopTagMap)
      .map((loopName) => `<option value="${escapeHTML(loopName)}">${escapeHTML(loopName)}</option>`)
      .join("");
  }

  if (areaSelect) {
    areaSelect.innerHTML = elogbookState.areas.map((name) => `<option value="${escapeHTML(name)}">${escapeHTML(name)}</option>`).join("");
  }

  if (typeSelect) {
    typeSelect.innerHTML = elogbookState.jobTypes.map((name) => `<option value="${escapeHTML(name)}">${escapeHTML(name)}</option>`).join("");
  }

  if (instSelect) {
    instSelect.innerHTML = elogbookState.instrumentTypes
      .map((name) => `<option value="${escapeHTML(name)}">${escapeHTML(name)}</option>`)
      .join("");
  }

  if (editEng) {
    editEng.innerHTML = elogbookState.engineers.map((name) => `<option value="${escapeHTML(name)}">${escapeHTML(name)}</option>`).join("");
  }

  if (editArea) {
    editArea.innerHTML = elogbookState.areas.map((name) => `<option value="${escapeHTML(name)}">${escapeHTML(name)}</option>`).join("");
  }

  filterTagsForLoop();
  renderOjrPendingList();
}

function filterTagsForLoop() {
  const loopName = document.getElementById("job-loop")?.value;
  const tagSelect = document.getElementById("job-tag");
  if (!tagSelect) return;
  const tags = elogbookState.loopTagMap[loopName] || [];
  tagSelect.innerHTML = tags.map((tag) => `<option value="${escapeHTML(tag)}">${escapeHTML(tag)}</option>`).join("");
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
  const effectivePrefill = prefill || {};

  const title = document.getElementById("job-modal-title");
  if (title) {
    title.textContent = elogbookState.modalMode === "add" ? "Add Job By Technician" : `Assign Job (${elogbookState.modalTargetView})`;
  }

  const dateInput = document.getElementById("job-date");
  if (dateInput) {
    const targetDate = elogbookState.modalTargetView === "tomorrow" ? dateOffsetFromNow(1) : dateOffsetFromNow(0);
    dateInput.value = `${formatDateSlash(targetDate)} (server stamp)`;
  }

  document.getElementById("job-tech-custom").value = "";
  document.getElementById("job-desc").value = "";

  document.getElementById("job-tech").value = effectivePrefill.tech || elogbookState.technicians[0];
  document.getElementById("job-loop").value = effectivePrefill.loop || Object.keys(elogbookState.loopTagMap)[0];
  filterTagsForLoop();
  document.getElementById("job-tag").value = effectivePrefill.tag || (elogbookState.loopTagMap[document.getElementById("job-loop").value] || [])[0];
  document.getElementById("job-area").value = effectivePrefill.area || elogbookState.areas[0];
  document.getElementById("job-type").value = effectivePrefill.jobType || elogbookState.jobTypes[0];
  document.getElementById("job-inst").value = effectivePrefill.instType || elogbookState.instrumentTypes[0];
  document.getElementById("job-desc").value = effectivePrefill.desc || "";

  const techSelect = document.getElementById("job-tech");
  const techCustom = document.getElementById("job-tech-custom");
  const ojrPanel = document.getElementById("job-modal-ojr");
  if (elogbookState.modalMode === "add") {
    techSelect.value = elogbookState.activeUser.name;
    techSelect.disabled = true;
    techCustom.disabled = true;
    ojrPanel.classList.add("hidden");
  } else {
    techSelect.disabled = false;
    techCustom.disabled = false;
    ojrPanel.classList.remove("hidden");
  }

  openOverlay("job-modal");
}

function closeJobModal() {
  closeOverlay("job-modal");
}

function assignFromPendingSource(sourceId, rowType) {
  let payload = null;
  if (rowType === "ojr") {
    payload = elogbookState.ojrPending.find((row) => row.id === sourceId);
  } else {
    const weeklyRow = (elogbookState.jobsByView.weekly || []).find((row) => row.id === sourceId);
    if (weeklyRow) {
      payload = {
        area: weeklyRow.area,
        loop: weeklyRow.loop,
        tag: weeklyRow.tag,
        jobType: weeklyRow.jobType,
        instType: weeklyRow.typeOfInst,
        desc: weeklyRow.desc || "Re-assigned from weekly pending",
        tech: weeklyRow.tech,
      };
    }
  }

  if (!payload) return;
  openJobModal("assign", "today", payload);
}

function saveJobFromModal(event) {
  event.preventDefault();

  const techFromList = document.getElementById("job-tech").value;
  const techFromInput = document.getElementById("job-tech-custom").value.trim();
  const techName = (techFromInput || techFromList || "").trim();
  const loopName = document.getElementById("job-loop").value;
  const tagName = document.getElementById("job-tag").value;
  const areaName = document.getElementById("job-area").value;
  const typeName = document.getElementById("job-type").value;
  const instName = document.getElementById("job-inst").value;
  const description = document.getElementById("job-desc").value.trim();

  if (!techName || !loopName || !tagName || !areaName || !typeName || !instName || !description) {
    showNotice("All fields are compulsory for job save.", "error");
    return;
  }

  const targetDate = elogbookState.modalTargetView === "tomorrow" ? dateOffsetFromNow(1) : dateOffsetFromNow(0);
  const dateText = formatDateSlash(targetDate);
  const mode = elogbookState.modalMode;

  const newJob = makeJob({
    date: dateText,
    area: areaName,
    loop: loopName,
    tag: tagName,
    tagSubtitle: instName,
    jobType: typeName,
    typeOfInst: instName,
    tech: techName,
    desc: mode === "assign" ? "" : description,
    jobRef: `By:${elogbookState.activeUser.name} : ${formatDateSlash(dateOffsetFromNow(0))}`,
    pendingWrite: mode === "assign",
    status: mode === "assign" ? "" : "IN PROGRESS",
    statusColor: mode === "assign" ? "" : "orange",
    abnormality: typeName === "Abnormality",
    locked: false,
    source: mode === "assign" ? `Assign(${elogbookState.modalTargetView})` : "Technician Add",
    assignedBy: elogbookState.activeUser.name,
  });

  elogbookState.jobsByView[elogbookState.modalTargetView].push(newJob);
  resequenceJobs(elogbookState.modalTargetView);
  closeJobModal();

  if (currentView === elogbookState.modalTargetView) refreshTable();
  showNotice(mode === "assign" ? "Job assigned successfully." : "Job added successfully.", "info");
}

function reassignJob(jobId) {
  const located = getJobById(jobId);
  if (!located) return;
  const cloned = cloneJobForReassign(located.job);
  elogbookState.jobsByView.today.push(cloned);
  resequenceJobs("today");
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

  const warningEl = document.getElementById("edit-warning");
  if (warningEl) {
    if (job.tech !== elogbookState.activeUser.name) {
      warningEl.classList.remove("hidden");
      warningEl.textContent = `Warning: this job is assigned to ${job.tech}. Continue only if required.`;
    } else {
      warningEl.classList.add("hidden");
      warningEl.textContent = "";
    }
  }

  document.getElementById("edit-job-id").value = job.id;
  document.getElementById("edit-job-ref").textContent = `${job.loop} / ${job.tag}`;
  document.getElementById("edit-job-tech").textContent = job.tech;
  document.getElementById("edit-job-desc").value = job.desc || "";
  document.getElementById("edit-job-status").value = job.status || "IN PROGRESS";
  document.getElementById("edit-job-engineer").value = job.engineer || elogbookState.engineers[0];
  document.getElementById("edit-job-area").value = job.area || elogbookState.areas[0];
  document.getElementById("edit-job-extra-hours").value = String(job.extraDutyHours || 0);
  document.getElementById("edit-job-emergency").checked = Boolean(job.emergency);

  openOverlay("edit-modal");
}

function closeEditModal() {
  closeOverlay("edit-modal");
}

function saveEditedJob(event) {
  event.preventDefault();
  const jobId = document.getElementById("edit-job-id").value;
  const located = getJobById(jobId);
  if (!located) return;

  const job = located.job;
  if (job.locked) {
    showNotice("This job is already locked.", "warn");
    return;
  }

  const newDesc = document.getElementById("edit-job-desc").value.trim();
  const status = document.getElementById("edit-job-status").value;
  const engineer = document.getElementById("edit-job-engineer").value;
  const area = document.getElementById("edit-job-area").value;
  const extraHours = Number(document.getElementById("edit-job-extra-hours").value || 0);
  const emergency = document.getElementById("edit-job-emergency").checked;

  if (!newDesc) {
    showNotice("Description is required before save.", "error");
    return;
  }

  job.desc = newDesc;
  job.status = status;
  job.statusColor = status === "✓ OVER" ? "green" : "orange";
  job.engineer = engineer;
  job.engInitials = makeInitials(engineer);
  job.area = area;
  job.extraDutyHours = Number.isFinite(extraHours) ? Math.max(0, Math.trunc(extraHours)) : 0;
  job.pendingWrite = false;
  job.emergency = emergency;
  job.abnormality = job.jobType === "Abnormality";
  if (status === "✓ OVER") {
    job.locked = true;
  }

  closeEditModal();
  refreshTable();

  const instUpper = String(job.typeOfInst || "").toUpperCase();
  const pmForms = ["TRANSMITTER", "CONTROL VALVE", "SWITCH", "ANALYZER"];
  if (job.jobType === "ISO14001" && status === "✓ OVER" && pmForms.includes(instUpper)) {
    showNotice(`PM detail form popup (${instUpper}) is required in backend flow.`, "warn");
  }
}

function openRemarkModal(jobId) {
  const located = getJobById(jobId);
  if (!located) return;

  document.getElementById("remark-job-id").value = jobId;
  document.getElementById("remark-text").value = "";
  document.getElementById("remark-ack-tech").checked = false;
  document.getElementById("remark-ack-eng").checked = false;
  renderRemarkHistory(located.job);
  openOverlay("remark-modal");
}

function closeRemarkModal() {
  closeOverlay("remark-modal");
}

function remarkToneClass(type) {
  return type === "executive" ? "text-green-300" : "text-purple-300";
}

function renderRemarkHistory(job) {
  const container = document.getElementById("remark-history");
  if (!container) return;

  if (!Array.isArray(job.remarks) || !job.remarks.length) {
    container.innerHTML = '<div class="px-3 py-2 text-xs text-dark-muted">No remarks yet.</div>';
    return;
  }

  container.innerHTML = job.remarks
    .map((remark) => {
      const ackFlags = [];
      if (remark.ackTech && !remark.ackByTech) ackFlags.push("Tech Ack Pending");
      if (remark.ackEng && !remark.ackByEng) ackFlags.push("Eng Ack Pending");
      const ackText = ackFlags.length ? ackFlags.join(" | ") : "Acknowledged";
      return `
        <div class="px-3 py-2 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-bold ${remarkToneClass(remark.type)}">${escapeHTML(remark.type.toUpperCase())}</span>
            <span class="text-dark-muted">${escapeHTML(remark.author)} | ${escapeHTML(remark.date)}</span>
          </div>
          <div class="mt-1">${escapeHTML(remark.text)}</div>
          <div class="mt-1 text-[10px] text-amber-300">${escapeHTML(ackText)}</div>
        </div>`;
    })
    .join("");
}

function appendRemark(event) {
  event.preventDefault();
  const jobId = document.getElementById("remark-job-id").value;
  const located = getJobById(jobId);
  if (!located) return;

  const text = document.getElementById("remark-text").value.trim();
  const type = document.getElementById("remark-type").value;
  const ackTech = document.getElementById("remark-ack-tech").checked;
  const ackEng = document.getElementById("remark-ack-eng").checked;

  if (!text) {
    showNotice("Remark text is required.", "error");
    return;
  }

  const now = new Date();
  const stamp = `${formatDateSlash(now)} ${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  located.job.remarks.push({
    id: `RMK-${Date.now()}`,
    type,
    text,
    author: elogbookState.activeUser.name,
    date: stamp,
    ackTech,
    ackEng,
    ackByTech: false,
    ackByEng: false,
  });

  renderRemarkHistory(located.job);
  document.getElementById("remark-text").value = "";
  refreshTable();
  showNotice("Remark appended. Existing remarks remain immutable.", "info");
}

function collectPendingAcks() {
  const pending = [];
  ELOGBOOK_VIEWS.forEach((viewName) => {
    (elogbookState.jobsByView[viewName] || []).forEach((job) => {
      (job.remarks || []).forEach((remark) => {
        if (elogbookState.activeUser.role === "technician") {
          if (remark.ackTech && !remark.ackByTech) pending.push({ viewName, job, remark });
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
  if (pending.length) {
    button.classList.remove("hidden");
    button.textContent = `Pending Acknowledgement (${pending.length})`;
  } else {
    button.classList.add("hidden");
  }
}

function openAckModal() {
  const pending = collectPendingAcks();
  const list = document.getElementById("ack-list");
  if (!list) return;

  if (!pending.length) {
    list.innerHTML = '<div class="px-3 py-2 text-xs text-dark-muted">No pending acknowledgements.</div>';
    openOverlay("ack-modal");
    return;
  }

  list.innerHTML = pending
    .map(
      ({ job, remark }) => `
      <label class="flex items-start gap-2 px-3 py-2 text-xs">
        <input type="checkbox" class="mt-0.5 ack-check" data-job-id="${escapeHTML(job.id)}" data-remark-id="${escapeHTML(remark.id)}">
        <div>
          <div class="font-bold text-white">${escapeHTML(job.tag)} | ${escapeHTML(job.jobType)}</div>
          <div class="text-dark-muted mt-0.5">${escapeHTML(remark.text)}</div>
          <div class="text-[10px] text-amber-300 mt-1">${escapeHTML(remark.author)} | ${escapeHTML(remark.date)}</div>
        </div>
      </label>`
    )
    .join("");

  openOverlay("ack-modal");
}

function closeAckModal() {
  closeOverlay("ack-modal");
}

function acknowledgeSelectedRemarks() {
  const checks = Array.from(document.querySelectorAll(".ack-check:checked"));
  if (!checks.length) {
    showNotice("Select at least one remark to acknowledge.", "warn");
    return;
  }

  checks.forEach((checkbox) => {
    const jobId = checkbox.getAttribute("data-job-id");
    const remarkId = checkbox.getAttribute("data-remark-id");
    const located = getJobById(jobId);
    if (!located) return;
    const remark = (located.job.remarks || []).find((r) => r.id === remarkId);
    if (!remark) return;

    if (elogbookState.activeUser.role === "technician") {
      remark.ackByTech = true;
    } else {
      remark.ackByEng = true;
    }
  });

  closeAckModal();
  refreshTable();
  showNotice("Selected remarks acknowledged.", "info");
}

function openReminderModal() {
  const list = document.getElementById("reminder-list");
  if (!list) return;

  if (!elogbookState.jobPlannerDue.length) {
    list.innerHTML = '<div class="text-xs text-dark-muted">No due jobs from Job Planner.</div>';
  } else {
    list.innerHTML = elogbookState.jobPlannerDue
      .map(
        (job) => `
        <div class="border border-dark-border rounded-sm p-3 flex items-start justify-between gap-3">
          <div>
            <div class="text-xs font-bold text-white">${escapeHTML(job.tag)} <span class="text-purple-300">(${escapeHTML(job.jobType)})</span></div>
            <div class="text-xs text-dark-muted mt-1">${escapeHTML(job.desc)}</div>
            <div class="text-[10px] text-amber-300 mt-1">Due: ${escapeHTML(job.dueDate)}</div>
          </div>
          <button onclick="assignReminder('${job.id}')" class="text-[10px] px-2 py-1 rounded-sm border border-purple-500/40 text-purple-200 hover:bg-purple-500/20">Assign</button>
        </div>`
      )
      .join("");
  }

  openOverlay("reminder-modal");
}

function closeReminderModal() {
  closeOverlay("reminder-modal");
}

function assignReminder(reminderId) {
  const reminder = elogbookState.jobPlannerDue.find((job) => job.id === reminderId);
  if (!reminder) return;
  closeReminderModal();
  openJobModal("assign", "today", reminder);
}

function initModalEvents() {
  document.getElementById("job-modal-form").addEventListener("submit", saveJobFromModal);
  document.getElementById("edit-modal-form").addEventListener("submit", saveEditedJob);
  document.getElementById("remark-modal-form").addEventListener("submit", appendRemark);

  ["job-modal", "edit-modal", "remark-modal", "ack-modal", "reminder-modal"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", (event) => {
      if (event.target !== el) return;
      if (id === "job-modal") closeJobModal();
      if (id === "edit-modal") closeEditModal();
      if (id === "remark-modal") closeRemarkModal();
      if (id === "ack-modal") closeAckModal();
      if (id === "reminder-modal") closeReminderModal();
    });
  });
}

function initReportNavState() {
  const navButtons = Array.from(document.querySelectorAll(".report-nav-btn[data-target]"));
  if (!navButtons.length) return;

  const currentFile = (window.location.pathname.split("/").pop() || "").toLowerCase();
  const lastSelected = (sessionStorage.getItem("plantDetailReportNav") || "").toLowerCase();
  let hasExactMatch = false;

  navButtons.forEach((btn) => {
    const target = (btn.dataset.target || "").toLowerCase();
    const isActive = target && target === currentFile;
    if (isActive) {
      btn.classList.add("is-active");
      btn.setAttribute("aria-current", "page");
      hasExactMatch = true;
    } else {
      btn.classList.remove("is-active");
      btn.removeAttribute("aria-current");
    }

    btn.addEventListener("click", () => {
      sessionStorage.setItem("plantDetailReportNav", target);
    });
  });

  if (!hasExactMatch && currentFile === "plant_detail.html" && lastSelected) {
    const remembered = navButtons.find((btn) => (btn.dataset.target || "").toLowerCase() === lastSelected);
    if (remembered) remembered.classList.add("is-active");
  }
}

function initInitialView() {
  const targetId = currentView === "prev" ? "btn-prev" : `btn-${currentView}`;
  const button = document.getElementById(targetId) || document.getElementById("btn-today");
  if (button) {
    activateView(currentView, button);
  } else {
    refreshTable();
  }
}

function maybePromptPendingAck() {
  const pending = collectPendingAcks();
  if (!pending.length) return;
  setTimeout(() => {
    openAckModal();
  }, 500);
}

function checkPendingThresholdAlerts() {
  const pendingCount = ELOGBOOK_VIEWS.reduce((acc, viewName) => {
    return acc + (elogbookState.jobsByView[viewName] || []).filter((job) => job.pendingWrite).length;
  }, 0);

  if (pendingCount > 150) {
    showNotice("Pending jobs exceeded 150. Pending log should be reviewed immediately.", "error");
    elogbookState.pendingOnlyMode = true;
    refreshTable();
    return;
  }
  if (pendingCount > 50) {
    showNotice("Pending jobs exceeded 50.", "warn");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  parseQueryContext();
  elogbookState.jobsByView = seedMockData();
  window.currentView = currentView;

  initHeaderAndChips();
  initReportNavState();
  populateJobTypeDropdown();
  populateJobModalLookups();
  initModalEvents();
  initTable();
  initInitialView();
  updateAcknowledgeButton();
  maybePromptPendingAck();
  checkPendingThresholdAlerts();
});
