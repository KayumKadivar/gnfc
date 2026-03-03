

const JOB_TYPES = [
  "PM",
  "DOCUMENTATION",
  "HOUSE KEEPING",
  "ABNORMALITY",
  "MODIFICATION",
  "ISO14001",
  "FIELD JOB",
  "REVAMP",
  "DEFECT MAINTENANCE",
  "CONFIGURATION",
  "SPARE REPAIR",
  "SCRAP",
  "MATL RETURN",
  "RANGE CHANGE",
  "CARD FAILURE",
  "INST FAILURE",
  "INSPECTION",
  "CASH PURCHASE",
  "PROCESS REQMT",
  "N.A.",
];
const INST_TYPES = [
  "ANALYZER",
  "C/V",
  "TX",
  "SWITCH",
  "PRIMARY ELEMENT",
  "SCANNER",
  "PCV",
  "ROTAMETER",
  "ENVIRON MONITORING",
  "MACHINE MONITORING",
  "PA SYSTEM",
  "PC",
  "N.A.",
];

const INITIAL_JOB_DATA = [
  {
    sr: 1,
    system: "MAX DCS",
    hwType: "IO MODULES",
    category: "HARDWARE PROBLEM",
    date: "2025-12-19",
    desc: "AUX: C2PCI RJMH A2B card was failed.\nNew card arranged from store.\nIts jumpers and address settings done.\nReplaced card.\nWorking ok.\nRemoved card kept with tag.\nSame checked with M(MND),ID(TRC),IE(ARP).",
    tech: "PYS",
    eng: "PMP",
    attach: false,
    remark: "",
    execRemark: "",
    status: "",
  },
  {
    sr: 2,
    system: "MAX DCS",
    hwType: "IO MODULES",
    category: "HARDWARE PROBLEM",
    date: "2025-12-16",
    desc: "All input of 2CJH01RLM4 were indicating faulty values.\nDetail checked found card in fault, Analog Input card removed, clean and fixed back.\nValue indicating normal.",
    tech: "V+M",
    eng: "PMP",
    attach: false,
    remark: "",
    execRemark: "",
    status: "",
  },
  {
    sr: 3,
    system: "MAX DCS",
    hwType: "STATIONS",
    category: "HARDWARE PROBLEM",
    date: "2025-12-16",
    desc: "Operator station HMI display replaced with spare one.",
    tech: "V+M",
    eng: "PMP",
    attach: false,
    remark: "",
    execRemark: "",
    status: "",
  },
  {
    sr: 4,
    system: "MAX DCS",
    hwType: "STATIONS",
    category: "HARDWARE PROBLEM",
    date: "2025-12-15",
    desc: "Engineering station HMI does not power on so replaced with spare one.\nDefective HMI kept at CPU room with tag.",
    tech: "V+M",
    eng: "PMP",
    attach: false,
    remark: "",
    execRemark: "",
    status: "",
  },
  {
    sr: 5,
    system: "ESD",
    hwType: "CONTROL MODULES",
    category: "MAJOR UPGRADE",
    date: "2025-10-02",
    desc: "Cable laying job taken...\nLoop simulation taken with electrical.",
    tech: "BSU",
    eng: "PMP",
    attach: false,
    remark: "",
    execRemark: "",
    status: "",
  },
  {
    sr: 6,
    system: "ESD",
    hwType: "IO MODULES",
    category: "HARDWARE PROBLEM",
    date: "2025-08-29",
    desc: "TK fan and mass flow indication to DCS related logics.\nVarious exercises done.",
    tech: "PYS",
    eng: "PMP",
    attach: false,
    remark: "",
    execRemark: "",
    status: "",
  },
];

const DateUtils = {
  formatDisplay: (iso) =>
    iso ? new Date(iso).toLocaleDateString("en-GB") : "",
  formatInput: (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
  getFilters: (year) => ({
    default: {
      start: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
      end: new Date(),
    },
    prev: { start: new Date(year - 1, 0, 1), end: new Date(year - 1, 11, 31) },
    this: { start: new Date(year, 0, 1), end: new Date(year, 11, 31) },
    next: { start: new Date(year + 1, 0, 1), end: new Date(year + 1, 11, 31) },
  }),
};

const FileUtils = {
  formatSize: (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024,
      sizes = ["Bytes", "KB", "MB", "GB"],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },
};

const DataUtils = {
  getUniqueTags: (data) => [
    ...new Set(data.map((item) => item.tag).filter(Boolean)),
  ],
};

class AttachmentManager {
  constructor() {
    this.currentSlot = null;
  }
  getElements() {
    return {
      modal: document.getElementById("attachment-modal"),
      fileInput: document.getElementById("upload-file-input"),
      uploadZone: document.getElementById("upload-zone"),
      filePreview: document.getElementById("file-preview"),
      previewFilename: document.getElementById("preview-filename"),
      previewFilesize: document.getElementById("preview-filesize"),
    };
  }
  open(slot) {
    this.currentSlot = slot;
    this.clearSelection();
    const { modal } = this.getElements();
    modal?.classList.add("is-open");
    modal?.setAttribute("aria-hidden", "false");
  }
  close() {
    const { modal } = this.getElements();
    modal?.classList.remove("is-open");
    modal?.setAttribute("aria-hidden", "true");
    this.currentSlot = null;
  }
  handleFileSelect(input) {
    if (input.files?.[0]) {
      const file = input.files[0],
        els = this.getElements();
      els.uploadZone?.classList.add("hidden");
      els.filePreview?.classList.remove("hidden");
      els.filePreview?.classList.add("flex");
      if (els.previewFilename) els.previewFilename.textContent = file.name;
      if (els.previewFilesize)
        els.previewFilesize.textContent = FileUtils.formatSize(file.size);
    }
  }
  clearSelection() {
    const els = this.getElements();
    if (els.fileInput) els.fileInput.value = "";
    els.uploadZone?.classList.remove("hidden");
    els.filePreview?.classList.add("hidden");
    els.filePreview?.classList.remove("flex");
  }
  save() {
    const els = this.getElements();
    if (els.fileInput?.files?.length > 0 && this.currentSlot) {
      const displayEl = document.getElementById(
        `display-attach-${this.currentSlot}`,
      );
      if (displayEl) {
        displayEl.textContent = els.fileInput.files[0].name;
        displayEl.classList.add("text-blue-600", "fw-bold");
      }
    }
    this.close();
  }
}

class JobHistoryApp {
  constructor() {
    this.jobData = [...INITIAL_JOB_DATA];
    this.dataTable = null;
    this.currentJobId = null;
    this.attachmentManager = new AttachmentManager();
    this.loadExportedData();
    this.init();
  }
  loadExportedData() {
    try {
      const exported = JSON.parse(
        localStorage.getItem("gnfc_job_history") || "[]",
      );
      const exportedMapped = exported.map((r) => ({
        sr: 0,
        area: r.area || "",
        loop: r.loop || "",
        tag: r.tag || r.instTag || "",
        instType: r.instType || "",
        jobType: r.jobType || "",
        date: r.date || "",
        desc: r.desc || "",
        tech: r.tech || "",
        eng: r.eng || "",
        attach: false,
        remark: `<span class="font-12px px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-sm fw-bold">${r.type === "system" ? "System" : "General"} </span>`,
        isExported: true,
      }));
      this.jobData = [...this.jobData, ...exportedMapped].map((job, idx) => ({
        ...job,
        sr: idx + 1,
      }));
    } catch (e) {
      console.error("Failed to load localStorage Data", e);
    }
  }
  init() {
    this.populateDropdowns();
    this.renderTable();
    this.bindEvents();
  }
  bindEvents() {
    document.addEventListener("click", (e) => {
      if (e.target.id === "job-detail-overlay") this.closeJobDetailModal();
      if (e.target.id === "attachment-modal") this.attachmentManager.close();
    });
  }
  populateDropdowns() {
    const populate = (id, opts, addAll = false) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = addAll ? '<option value="">ALL</option>' : "";
      opts.forEach((opt) =>
        el.insertAdjacentHTML(
          "beforeend",
          `<option value="${opt}">${opt}</option>`,
        ),
      );
    };
    populate("tagSelect", DataUtils.getUniqueTags(this.jobData), true);
    populate("filter-jobtype", JOB_TYPES, true);
    populate("filter-insttype", INST_TYPES, true);
  }
  setDateFilter(type) {
    const filters = DateUtils.getFilters(new Date().getFullYear());
    const { start, end } = filters[type];
    document.getElementById("filter-start-date").value =
      DateUtils.formatInput(start);
    document.getElementById("filter-end-date").value =
      DateUtils.formatInput(end);
    ["default", "prev", "this", "next"].forEach((btnType) => {
      const btn = document.getElementById(`filter-btn-${btnType}`);
      if (btn) {
        const isActive = btnType === type;
        btn.className = `font-12px px-2 py-1 rounded-sm transition-colors ${isActive ? "bg-blue-500/10 border border-gnfc-blue color-blue" : "bg-dark-bg border border-dark-border hover:border-gnfc-blue color-secondary"}`;
      }
    });
  }
  renderTable() {
    const tableElement = document.querySelector(".gnfc-table");
    if (!tableElement) return;
    if (this.dataTable) this.dataTable.destroy();
    const tbody = document.getElementById("jobTableBody");
    const recordCount = document.getElementById("recordCount");
    if (recordCount)
      recordCount.innerText = `${this.jobData.length} Records Found`;

    const renderRow = (item) => {
      const formattedDesc = (item.desc || "")
        .replace(/\\n/g, "<br>")
        .replace(/\n/g, "<br>");
      const attachIcon = item.attach
        ? '<i class="ph-bold ph-paperclip text-blue-600 cursor-pointer" onclick="event.stopPropagation();"></i>'
        : '<span class="opacity-30">-</span>';
      return `
                <tr class="gnfc-tr group align-top cursor-pointer transition-colors" onclick="openJobDetailModal(${item.sr})">
                    <td class="gnfc-td text-center text-blue-600 fw-bold border-r border-gray-300 sticky left-0 z-10 bg-dark-bg group-hover:bg-dark-panel shadow-[1px_0_0_0_#e5e7eb]">${item.sr}</td>
                    <td class="gnfc-td text-center font-13px text-black border-r border-gray-300">${item.system}</td>
                    <td class="gnfc-td border-r border-gray-300">
                        <div class="font-13px text-black">${item.hwType}</div>
                        <div class="border-b border-gray-300 mt-1"></div>
                        <div class="font-13px text-black mt-1">${item.category}</div>
                    </td>
                    <td class="gnfc-td whitespace-nowrap border-r border-gray-300 font-13px">${DateUtils.formatDisplay(item.date)}</td>
                    <td class="gnfc-td text-black leading-relaxed font-13px border-r border-gray-300">${formattedDesc}</td>
                    <td class="gnfc-td border-r border-gray-300">
                        <div class="font-13px text-black">${item.tech}</div>
                        <div class="border-b border-gray-300 mt-1"></div>
                        <div class="font-13px text-black fw-bold mt-1">${item.eng}</div>
                    </td>
                    <td class="gnfc-td text-center border-r border-gray-300 font-13px">${attachIcon}</td>
                    <td class="gnfc-td border-r border-gray-300">
                        <div class="font-13px text-black">${item.remark || ""}</div>
                        <div class="border-b border-gray-300 mt-1 mb-1"></div>
                        <div class="font-13px text-black">${item.execRemark || ""}</div>
                    </td>
                    <td class="gnfc-td border-r border-gray-300 text-center font-13px">${item.status || ""}</td>
                </tr>`;
    };
    tbody.innerHTML = this.jobData.map(renderRow).join("");

    if (this.jobData.length > 0 && typeof simpleDatatables !== "undefined") {
      this.dataTable = new simpleDatatables.DataTable(tableElement, {
        perPage: 10,
        perPageSelect: [10, 25, 50, 100],
        searchable: false,
        fixedHeight: false,
        labels: {
          placeholder: "Search...",
          perPage: "{select} entries per page",
          noRows: "No entries found",
          info: "Showing {start} to {end} of {rows} entries",
        },
      });
    }
  }
  setModalValues(values) {
    Object.entries(values).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    });
  }
  getModalValues() {
    return {
      system: document.getElementById("modal-system")?.value || "",
      category: document.getElementById("modal-category")?.value || "",
      hwType: document.getElementById("modal-hwtype")?.value || "",
      desc: document.getElementById("modal-description")?.value || "",
      date: document.getElementById("modal-date")?.value || "",
      tech: document.getElementById("modal-tech")?.value || "",
      eng: document.getElementById("modal-eng")?.value || "",
      status: document.getElementById("modal-status")?.value || "",
      remark: document.getElementById("modal-eng-remark")?.value || "",
      execRemark: document.getElementById("modal-exec-remark")?.value || "",
    };
  }
  toggleModal(isOpen) {
    const overlay = document.getElementById("job-detail-overlay");
    overlay?.classList.toggle("is-open", isOpen);
    overlay?.setAttribute("aria-hidden", (!isOpen).toString());
  }
  toggleAttachmentsMode(isEdit) {
    ["1", "2"].forEach((slot) => {
      document
        .getElementById(`attach-card-${slot}`)
        ?.classList.toggle("hidden", !isEdit);
      document
        .getElementById(`attach-msg-${slot}`)
        ?.classList.toggle("hidden", isEdit);
    });
  }
  openAddJobModal() {
    this.currentJobId = null;
    this.setModalValues({
      "modal-system": "",
      "modal-category": "",
      "modal-hwtype": "",
      "modal-description": "",
      "modal-date": DateUtils.formatInput(new Date()),
      "modal-tech": "",
      "modal-eng": "",
      "modal-status": "",
      "modal-eng-remark": "",
      "modal-exec-remark": "",
    });
    document.getElementById("display-attach-1").textContent = "-";
    document.getElementById("display-attach-2").textContent = "-";
    document.querySelector(".gnfc-modal-title").textContent = "Add New Job";
    document.getElementById("modal-delete-btn").style.display = "none";
    document.getElementById("modal-save-btn").textContent = "Add Job";
    this.toggleAttachmentsMode(false);
    this.toggleModal(true);
  }
  openJobDetailModal(srNumber) {
    const job = this.jobData.find((j) => String(j.sr) === String(srNumber));
    if (!job) return;
    this.currentJobId = srNumber;
    this.setModalValues({
      "modal-system": job.system || "",
      "modal-category": job.category || "",
      "modal-hwtype": job.hwType || "",
      "modal-description": job.desc || "",
      "modal-date": job.date || "",
      "modal-tech": job.tech || "",
      "modal-eng": job.eng || "",
      "modal-status": job.status || "",
      "modal-eng-remark": job.remark || "",
      "modal-exec-remark": job.execRemark || "",
    });
    document.getElementById("display-attach-1").textContent = job.attach
      ? "Report.pdf"
      : "-";
    document.getElementById("display-attach-2").textContent = "-";
    document.querySelector(".gnfc-modal-title").textContent =
      "Job History Detail";
    document.getElementById("modal-delete-btn").style.display = "block";
    document.getElementById("modal-save-btn").textContent = "Save Changes";
    this.toggleAttachmentsMode(true);
    this.toggleModal(true);
  }
  closeJobDetailModal() {
    this.toggleModal(false);
    this.currentJobId = null;
  }
  saveJobDetails() {
    const formValues = this.getModalValues();
    const isAttached =
      document.getElementById("display-attach-1")?.textContent !== "-";
    if (this.currentJobId !== null) {
      this.jobData = this.jobData.map((j) =>
        j.sr === this.currentJobId
          ? { ...j, ...formValues, attach: isAttached }
          : j,
      );
      this.showNotification("Updated!", "Job details have been updated.");
    } else {
      const newSr = this.jobData.reduce((max, j) => Math.max(max, j.sr), 0) + 1;
      this.jobData.push({ sr: newSr, ...formValues, attach: isAttached });
      this.showNotification("Added!", "New job has been added.");
    }
    this.toggleModal(false);
    this.renderTable();
  }
  async deleteJob() {
    if (!Swal) return;
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this job entry?",
      icon: "warning",
      width: 400,
      padding: "1em",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      customClass: {
        title: "font-18px",
        htmlContainer: "font-14px",
        popup: "font-12px",
      },
    });
    if (result.isConfirmed) {
      this.jobData = this.jobData.filter((j) => j.sr !== this.currentJobId);
      this.toggleModal(false);
      this.renderTable();
      this.showNotification(
        "Deleted!",
        "The job entry has been deleted.",
        "success",
        400,
      );
    }
  }
  showNotification(title, text, icon = "success", width = 300) {
    if (!Swal) return;
    Swal.fire({
      icon,
      title,
      text,
      timer: 1500,
      showConfirmButton: false,
      width,
      padding: "1em",
      customClass: { popup: "font-12px" },
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const app = new JobHistoryApp();
  Object.assign(window, {
    openAddJobModal: () => app.openAddJobModal(),
    openJobDetailModal: (sr) => app.openJobDetailModal(sr),
    closeJobDetailModal: () => app.closeJobDetailModal(),
    saveJobDetails: () => app.saveJobDetails(),
    deleteJob: () => app.deleteJob(),
    renderTable: () => app.renderTable(),
    setDateFilter: (type) => app.setDateFilter(type),
    openAttachmentModal: (slot) => app.attachmentManager.open(slot),
    closeAttachmentModal: () => app.attachmentManager.close(),
    handleFileSelect: (input) => app.attachmentManager.handleFileSelect(input),
    clearFileSelection: () => app.attachmentManager.clearSelection(),
    saveAttachment: () => app.attachmentManager.save(),
  });
});
