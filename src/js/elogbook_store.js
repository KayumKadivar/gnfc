(function initElogbookStore(global) {
  "use strict";

  const STORAGE_KEY = "gnfc_elogbook_v1";
  const STORAGE_VERSION = 1;
  const BACKUP_PREFIX = "gnfc_elogbook_v1_backup_";
  const DAY_MS = 24 * 60 * 60 * 1000;
  const DEFAULT_PLANTS = [
    "AA", "AAQM", "AMM", "ANIPF", "ANITDI",
    "ASGP", "BAGG", "BOILER", "CMS", "CPSU",
    "DM", "EA", "FA", "INST WS", "M1", "M2", "UREA", "UTIL", "DCS", "MF"
  ];

  let memoryState = null;

  function safeClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function tryGetStorage() {
    try {
      const probe = "__elogbook_probe__";
      global.localStorage.setItem(probe, "1");
      global.localStorage.removeItem(probe);
      return global.localStorage;
    } catch (err) {
      return null;
    }
  }

  function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function toIsoDate(date) {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function parseIsoDate(value) {
    if (!value) return null;
    const parts = String(value).split("-").map(Number);
    if (parts.length !== 3) return null;
    const [yyyy, mm, dd] = parts;
    if (!yyyy || !mm || !dd) return null;
    return new Date(yyyy, mm - 1, dd);
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function shiftToTime(shift) {
    if (shift === "A") return "06:00 - 14:00";
    if (shift === "B") return "14:00 - 22:00";
    return "22:00 - 06:00";
  }

  function inferShift(value) {
    if (!value) return "A";
    const input = String(value).toUpperCase();
    if (input.includes("06:00") || input === "A" || input.includes("SHIFT A")) return "A";
    if (input.includes("14:00") || input === "B" || input.includes("SHIFT B")) return "B";
    if (input.includes("22:00") || input === "C" || input.includes("SHIFT C")) return "C";
    return "A";
  }

  function buildSeedJobsForPlant(plant) {
    const today = startOfDay(new Date());
    const prev = new Date(today.getTime() - DAY_MS);
    const tomorrow = new Date(today.getTime() + DAY_MS);
    const older = new Date(today.getTime() - 4 * DAY_MS);
    const oldMonth = new Date(today.getTime() - 21 * DAY_MS);

    const base = [
      {
        id: `J-${plant}-1001`,
        targetDate: toIsoDate(today),
        createdAt: nowIso(),
        updatedAt: nowIso(),
        area: "FA",
        loop: "Loop-202",
        tag: "PT5087K",
        typeOfInst: "TRANSMITTER",
        jobType: "Routine Check",
        tech: "NRK",
        engineer: "",
        status: "",
        pendingWrite: true,
        emergency: false,
        abnormality: false,
        extraDutyHours: 0,
        shift: "A",
        source: "Assign(Today)",
        remarks: []
      },
      {
        id: `J-${plant}-1002`,
        targetDate: toIsoDate(today),
        createdAt: nowIso(),
        updatedAt: nowIso(),
        area: "MF",
        loop: "Loop-101",
        tag: "FT5021A",
        typeOfInst: "CONTROL VALVE",
        jobType: "Abnormality",
        tech: "DPB",
        engineer: "AMS",
        status: "IN PROGRESS",
        pendingWrite: false,
        emergency: false,
        abnormality: true,
        extraDutyHours: 0,
        shift: "B",
        source: "Manual",
        desc: "Valve position hunting observed near 44%.",
        remarks: []
      },
      {
        id: `J-${plant}-1003`,
        targetDate: toIsoDate(tomorrow),
        createdAt: nowIso(),
        updatedAt: nowIso(),
        area: "AA",
        loop: "Loop-UTIL",
        tag: "AIR-COMP",
        typeOfInst: "ANALYZER",
        jobType: "Calibration",
        tech: "AMS",
        engineer: "",
        status: "",
        pendingWrite: true,
        emergency: false,
        abnormality: false,
        extraDutyHours: 0,
        shift: "A",
        source: "Assign(Tomorrow)",
        remarks: []
      },
      {
        id: `J-${plant}-1004`,
        targetDate: toIsoDate(prev),
        createdAt: nowIso(),
        updatedAt: nowIso(),
        area: "DCS",
        loop: "Loop-DCS",
        tag: "SYS-1",
        typeOfInst: "DCS",
        jobType: "Shutdown",
        tech: "IT",
        engineer: "PHB",
        status: "✓ OVER",
        pendingWrite: false,
        emergency: false,
        abnormality: false,
        extraDutyHours: 1,
        shift: "B",
        source: "Manual",
        desc: "Shutdown interlock simulation completed.",
        remarks: [
          {
            id: `RMK-${plant}-1`,
            type: "executive",
            text: "Check acknowledgement from technician.",
            author: "VAA",
            date: nowIso(),
            ackTech: true,
            ackEng: true,
            ackByTech: false,
            ackByEng: false
          }
        ]
      },
      {
        id: `J-${plant}-1005`,
        targetDate: toIsoDate(older),
        createdAt: nowIso(),
        updatedAt: nowIso(),
        area: "UTIL",
        loop: "Loop-UTIL",
        tag: "COND-VALVE",
        typeOfInst: "CONTROL VALVE",
        jobType: "Routine Check",
        tech: "NRK",
        engineer: "",
        status: "",
        pendingWrite: true,
        emergency: false,
        abnormality: false,
        extraDutyHours: 0,
        shift: "A",
        source: "Weekly Pending",
        remarks: []
      },
      {
        id: `J-${plant}-1006`,
        targetDate: toIsoDate(oldMonth),
        createdAt: nowIso(),
        updatedAt: nowIso(),
        area: "AA",
        loop: "Loop-202",
        tag: "PT5082A",
        typeOfInst: "TRANSMITTER",
        jobType: "Calibration",
        tech: "AMS",
        engineer: "PHS",
        status: "✓ OVER",
        pendingWrite: false,
        emergency: false,
        abnormality: false,
        extraDutyHours: 0,
        shift: "A",
        source: "Monthly",
        desc: "Monthly loop calibration done and documented.",
        remarks: []
      }
    ];

    return base.map((job) => normalizeJob(job));
  }

  function normalizeRemark(remark, index) {
    const source = remark || {};
    return {
      id: source.id || `RMK-${Date.now()}-${index}`,
      type: source.type || "engineer",
      text: source.text || "",
      author: source.author || "SYSTEM",
      date: source.date || nowIso(),
      ackTech: Boolean(source.ackTech),
      ackEng: Boolean(source.ackEng),
      ackByTech: Boolean(source.ackByTech),
      ackByEng: Boolean(source.ackByEng)
    };
  }

  function normalizeJob(job, index) {
    const source = job || {};
    const createdAt = source.createdAt || nowIso();
    const shift = inferShift(source.shift || source.time);
    const targetDate = source.targetDate
      || (source.date && source.date.includes("-") ? source.date : null)
      || toIsoDate(new Date());

    return {
      id: source.id || `J-${Date.now()}-${index || 0}`,
      targetDate,
      createdAt,
      updatedAt: source.updatedAt || createdAt,
      area: source.area || "N.A",
      loop: source.loop || "N.A",
      tag: source.tag || source.tagNo || "N.A",
      typeOfInst: source.typeOfInst || source.instType || source.tagSubtitle || "OTHERS",
      jobType: source.jobType || "Routine Check",
      tech: source.tech || source.techName || "N.A",
      engineer: source.engineer || source.engName || "",
      status: source.status || "",
      pendingWrite: Boolean(source.pendingWrite),
      emergency: Boolean(source.emergency),
      abnormality: Boolean(source.abnormality || source.jobType === "Abnormality"),
      extraDutyHours: Number.isFinite(Number(source.extraDutyHours)) ? Math.max(0, Math.trunc(Number(source.extraDutyHours))) : 0,
      shift,
      source: source.source || "Manual",
      desc: source.desc || source.description || "",
      remarks: Array.isArray(source.remarks) ? source.remarks.map(normalizeRemark) : []
    };
  }

  function normalizeOfficerEntry(entry, index) {
    const source = entry || {};
    const shift = inferShift(source.shift || source.time);
    return {
      id: source.id || `S-${Date.now()}-${index || 0}`,
      date: source.date || source.targetDate || toIsoDate(new Date()),
      plant: source.plant || "AA",
      shift,
      time: source.time || shiftToTime(shift),
      tagNo: source.tagNo || source.tag || "N.A",
      jobType: source.jobType || "MAINTENANCE",
      description: source.description || source.desc || "",
      officer: source.officer || source.engineer || "N.A",
      status: source.status || "OVER",
      remarks: source.remarks || "",
      sourceJobId: source.sourceJobId || null,
      updatedAt: source.updatedAt || nowIso()
    };
  }

  function createDefaultState() {
    const plants = {};
    DEFAULT_PLANTS.forEach((plantCode) => {
      plants[plantCode] = { jobs: buildSeedJobsForPlant(plantCode) };
    });

    return {
      version: STORAGE_VERSION,
      plants,
      officer: {
        entries: []
      },
      ui: {
        technicianSelectedView: "today"
      }
    };
  }

  function backupRawValue(storage, rawValue) {
    if (!storage || !rawValue) return;
    try {
      storage.setItem(`${BACKUP_PREFIX}${Date.now()}`, rawValue);
    } catch (err) {
      // no-op
    }
  }

  function normalizeStateShape(input) {
    const source = input || {};
    const normalized = {
      version: STORAGE_VERSION,
      plants: {},
      officer: { entries: [] },
      ui: { technicianSelectedView: "today" }
    };

    const sourcePlants = source.plants || {};
    DEFAULT_PLANTS.forEach((plant) => {
      const plantData = sourcePlants[plant] || { jobs: [] };
      const jobs = Array.isArray(plantData.jobs) ? plantData.jobs.map(normalizeJob) : [];
      normalized.plants[plant] = { jobs };
    });

    Object.keys(sourcePlants).forEach((plant) => {
      if (normalized.plants[plant]) return;
      const plantData = sourcePlants[plant] || { jobs: [] };
      const jobs = Array.isArray(plantData.jobs) ? plantData.jobs.map(normalizeJob) : [];
      normalized.plants[plant] = { jobs };
    });

    if (source.officer && Array.isArray(source.officer.entries)) {
      normalized.officer.entries = source.officer.entries.map(normalizeOfficerEntry);
    }

    if (source.ui && typeof source.ui.technicianSelectedView === "string") {
      normalized.ui.technicianSelectedView = source.ui.technicianSelectedView;
    }

    return normalized;
  }

  function loadState() {
    const storage = tryGetStorage();

    if (!storage) {
      if (!memoryState) memoryState = createDefaultState();
      return safeClone(memoryState);
    }

    const rawValue = storage.getItem(STORAGE_KEY);
    if (!rawValue) {
      const seeded = createDefaultState();
      storage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return safeClone(seeded);
    }

    let parsed;
    try {
      parsed = JSON.parse(rawValue);
    } catch (err) {
      backupRawValue(storage, rawValue);
      const seeded = createDefaultState();
      storage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return safeClone(seeded);
    }

    if (!parsed || parsed.version !== STORAGE_VERSION) {
      backupRawValue(storage, rawValue);
      const seeded = createDefaultState();
      storage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return safeClone(seeded);
    }

    const normalized = normalizeStateShape(parsed);
    storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return safeClone(normalized);
  }

  function saveState(nextState) {
    const storage = tryGetStorage();
    const normalized = normalizeStateShape(nextState);

    if (!storage) {
      memoryState = normalized;
      return safeClone(normalized);
    }

    storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return safeClone(normalized);
  }

  function updateState(mutatorFn) {
    const state = loadState();
    mutatorFn(state);
    return saveState(state);
  }

  function getPlantJobs(plant) {
    const state = loadState();
    const code = plant || "AA";
    if (!state.plants[code]) {
      state.plants[code] = { jobs: [] };
      saveState(state);
    }
    return safeClone(state.plants[code].jobs || []);
  }

  function setPlantJobs(plant, jobs) {
    const code = plant || "AA";
    return updateState((state) => {
      if (!state.plants[code]) state.plants[code] = { jobs: [] };
      state.plants[code].jobs = Array.isArray(jobs) ? jobs.map(normalizeJob) : [];
    });
  }

  function getSeedDateOverride(plantCode, job, referenceDay) {
    if (!job || !job.id || !DEFAULT_PLANTS.includes(plantCode)) return null;

    const prefix = `J-${plantCode}-`;
    if (!String(job.id).startsWith(prefix)) return null;

    const suffix = String(job.id).slice(prefix.length);
    if (suffix === "1001" || suffix === "1002") return startOfDay(referenceDay);
    if (suffix === "1003") return startOfDay(new Date(referenceDay.getTime() + DAY_MS));
    if (suffix === "1004") return startOfDay(new Date(referenceDay.getTime() - DAY_MS));
    if (suffix === "1005") return startOfDay(new Date(referenceDay.getTime() - 4 * DAY_MS));
    if (suffix === "1006") return startOfDay(new Date(referenceDay.getTime() - 21 * DAY_MS));
    return null;
  }

  function getPlantJobsByView(plant, referenceDate) {
    const code = plant || "AA";
    const jobs = getPlantJobs(code);
    const now = startOfDay(referenceDate || new Date());
    const todayText = toIsoDate(now);
    const tomorrowText = toIsoDate(new Date(now.getTime() + DAY_MS));
    const prevText = toIsoDate(new Date(now.getTime() - DAY_MS));
    const weeklyStart = new Date(now.getTime() - 6 * DAY_MS);
    const monthlyStart = new Date(now.getTime() - 90 * DAY_MS);

    const parseDateSafe = (value) => parseIsoDate(value) || startOfDay(new Date());
    const resolveJobTargetDate = (job) => {
      const seedDate = getSeedDateOverride(code, job, now);
      if (seedDate) {
        return {
          date: seedDate,
          usedSeedOverride: true
        };
      }

      return {
        date: parseDateSafe(job.targetDate),
        usedSeedOverride: false
      };
    };

    const sorted = jobs.slice().sort((a, b) => {
      const dateCmp = resolveJobTargetDate(b).date.getTime() - resolveJobTargetDate(a).date.getTime();
      if (dateCmp !== 0) return dateCmp;
      return new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime();
    });

    const result = {
      today: [],
      tomorrow: [],
      prev: [],
      weekly: [],
      monthly: []
    };

    sorted.forEach((job) => {
      const resolved = resolveJobTargetDate(job);
      const targetDate = resolved.date;
      const targetText = toIsoDate(targetDate);
      const jobForView = resolved.usedSeedOverride ? { ...job, targetDate: targetText } : job;

      if (targetText === todayText) result.today.push(jobForView);
      if (targetText === tomorrowText) result.tomorrow.push(jobForView);
      if (targetText === prevText) result.prev.push(jobForView);
      if (targetDate >= weeklyStart && targetDate <= now) result.weekly.push(jobForView);
      if (targetDate >= monthlyStart && targetDate <= now) result.monthly.push(jobForView);
    });

    return result;
  }

  function setTechnicianSelectedView(view) {
    updateState((state) => {
      state.ui.technicianSelectedView = view || "today";
    });
  }

  function getTechnicianSelectedView() {
    return loadState().ui.technicianSelectedView || "today";
  }

  function getOfficerEntries() {
    return loadState().officer.entries || [];
  }

  function getOfficerEntriesByView(view, plant, referenceDate) {
    const entries = getOfficerEntries();
    const now = startOfDay(referenceDate || new Date());
    const today = toIsoDate(now);
    const prev = toIsoDate(new Date(now.getTime() - DAY_MS));
    const weeklyStart = new Date(now.getTime() - 6 * DAY_MS);
    const monthlyStart = new Date(now.getTime() - 90 * DAY_MS);

    return entries
      .filter((entry) => !plant || entry.plant === plant)
      .filter((entry) => {
        const date = parseIsoDate(entry.date);
        if (!date) return false;
        if (view === "today") return entry.date === today;
        if (view === "prev") return entry.date === prev;
        if (view === "weekly") return date >= weeklyStart && date <= now;
        if (view === "monthly") return date >= monthlyStart && date <= now;
        return true;
      })
      .sort((a, b) => {
        const dateCmp = parseIsoDate(b.date).getTime() - parseIsoDate(a.date).getTime();
        if (dateCmp !== 0) return dateCmp;
        return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
      });
  }

  function addOfficerEntry(entry) {
    const normalized = normalizeOfficerEntry(entry);
    updateState((state) => {
      state.officer.entries.unshift(normalized);
    });
    return normalized;
  }

  function upsertOfficerEntryFromJob(plant, job) {
    if (!job || job.status !== "✓ OVER") return null;
    const shift = inferShift(job.shift);
    if (shift !== "A" && shift !== "B") return null;

    const payload = normalizeOfficerEntry({
      id: `S-${job.id}`,
      date: job.targetDate,
      plant: plant || "AA",
      shift,
      time: shiftToTime(shift),
      tagNo: job.tag,
      jobType: job.jobType || "MAINTENANCE",
      description: job.desc || "Completed from technician logbook",
      officer: job.engineer || "N.A",
      status: "OVER",
      remarks: "",
      sourceJobId: job.id,
      updatedAt: nowIso()
    });

    updateState((state) => {
      const entries = state.officer.entries || [];
      const index = entries.findIndex((item) => item.sourceJobId && item.sourceJobId === job.id);
      if (index >= 0) {
        entries[index] = payload;
      } else {
        entries.unshift(payload);
      }
      state.officer.entries = entries;
    });

    return payload;
  }

  function clearState() {
    const storage = tryGetStorage();
    if (storage) storage.removeItem(STORAGE_KEY);
    memoryState = null;
  }

  global.ElogbookStore = {
    STORAGE_KEY,
    STORAGE_VERSION,
    DAY_MS,
    loadState,
    saveState,
    updateState,
    getPlantJobs,
    setPlantJobs,
    getPlantJobsByView,
    setTechnicianSelectedView,
    getTechnicianSelectedView,
    getOfficerEntries,
    getOfficerEntriesByView,
    addOfficerEntry,
    upsertOfficerEntryFromJob,
    toIsoDate,
    parseIsoDate,
    startOfDay,
    shiftToTime,
    inferShift,
    clearState
  };
})(window);
