import {
  SY_PM_QUERY_KEYS,
  normalizeFrequency,
  normalizeSystem,
  parsePlantCode,
  toContextKey,
  toSlug
} from "./constants.js";
import { buildFixtureForContext, buildFixtureState } from "./fixtures.js";

const STORAGE_KEY = "gnfc_sy_pm_runtime_v1";
const STORAGE_VERSION = 1;

let memoryState = null;

function nowIso() {
  return new Date().toISOString();
}

function toIsoDate(date) {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function safeClone(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function tryGetStorage() {
  try {
    const key = "__sy_pm_probe__";
    window.sessionStorage.setItem(key, "1");
    window.sessionStorage.removeItem(key);
    return window.sessionStorage;
  } catch (error) {
    return null;
  }
}

function normalizeState(input) {
  const source = input && typeof input === "object" ? input : {};
  const normalized = {
    version: STORAGE_VERSION,
    contexts: {},
    updatedAt: nowIso()
  };

  const sourceContexts = source.contexts && typeof source.contexts === "object" ? source.contexts : {};
  Object.keys(sourceContexts).forEach((key) => {
    const context = sourceContexts[key] || {};
    normalized.contexts[key] = {
      staticRows: Array.isArray(context.staticRows) ? context.staticRows.map((row) => ({ ...row })) : [],
      instruction: {
        text: String(context.instruction?.text || ""),
        updatedAt: context.instruction?.updatedAt || nowIso()
      },
      reports: Array.isArray(context.reports) ? context.reports.map((report) => ({ ...report })) : [],
      updatedAt: context.updatedAt || nowIso()
    };

    normalized.contexts[key].reports = normalized.contexts[key].reports.map((report) => ({
      ...report,
      rows: Array.isArray(report.rows) ? report.rows.map((row) => ({ ...row })) : []
    }));
  });

  return normalized;
}

function loadState() {
  const storage = tryGetStorage();

  if (!storage) {
    if (!memoryState) {
      memoryState = buildFixtureState();
    }
    return safeClone(memoryState);
  }

  const rawValue = storage.getItem(STORAGE_KEY);
  if (!rawValue) {
    const seeded = buildFixtureState();
    storage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return safeClone(seeded);
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (!parsed || parsed.version !== STORAGE_VERSION) {
      const seeded = buildFixtureState();
      storage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return safeClone(seeded);
    }

    const normalized = normalizeState(parsed);
    storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return safeClone(normalized);
  } catch (error) {
    const seeded = buildFixtureState();
    storage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return safeClone(seeded);
  }
}

function saveState(nextState) {
  const normalized = normalizeState(nextState);
  const storage = tryGetStorage();

  if (!storage) {
    memoryState = normalized;
    return safeClone(normalized);
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return safeClone(normalized);
}

function updateState(mutatorFn) {
  const current = loadState();
  mutatorFn(current);
  return saveState(current);
}

function normalizeContext(input, options = {}) {
  const source = input || {};
  const allowDefaultFrequency = options.allowDefaultFrequency === true;

  const systemCode = normalizeSystem(source.systemCode || source.system || "");
  const frequencyInput = source.frequencyCode || source.frequency || source.freq || "";
  const frequencyCode = normalizeFrequency(frequencyInput);
  const plantCode = parsePlantCode(source.plantCode || source.plant || "AA");

  const resolvedFrequencyCode = frequencyCode || (allowDefaultFrequency ? "daily" : "");

  return {
    plantCode,
    systemCode,
    frequencyCode: resolvedFrequencyCode
  };
}

function assertValidContext(context) {
  if (!context.systemCode || !context.frequencyCode) {
    throw new Error("SY_PM context requires valid systemCode and frequencyCode.");
  }
}

function ensureContextBucket(state, context) {
  const key = toContextKey(context);
  if (!state.contexts[key]) {
    state.contexts[key] = buildFixtureForContext(context);
  }

  const bucket = state.contexts[key];
  if (!Array.isArray(bucket.staticRows)) bucket.staticRows = [];
  if (!bucket.instruction || typeof bucket.instruction !== "object") {
    bucket.instruction = { text: "", updatedAt: nowIso() };
  }
  if (!Array.isArray(bucket.reports)) bucket.reports = [];
  return { key, bucket };
}

function withReadContext(contextInput, readerFn) {
  const context = normalizeContext(contextInput);
  assertValidContext(context);
  const state = loadState();
  const { bucket } = ensureContextBucket(state, context);
  return readerFn(bucket, context);
}

function withWriteContext(contextInput, writerFn) {
  const context = normalizeContext(contextInput);
  assertValidContext(context);

  let output = null;
  updateState((state) => {
    const { key, bucket } = ensureContextBucket(state, context);
    output = writerFn(bucket, context, state, key);
    bucket.updatedAt = nowIso();
  });

  return safeClone(output);
}

function sortStaticRows(rows) {
  return rows
    .slice()
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
}

function sortReports(reports) {
  return reports
    .slice()
    .sort((a, b) => {
      const dateDiff = new Date(b.reportDate || 0).getTime() - new Date(a.reportDate || 0).getTime();
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime();
    });
}

function buildReportRowsFromStaticRows(staticRows) {
  return sortStaticRows(staticRows).map((row) => ({
    staticRowId: row.id,
    item: row.item,
    action: row.action,
    referenceValue: row.referenceValue,
    observation: "",
    remark: ""
  }));
}

function findReport(bucket, reportId) {
  const index = bucket.reports.findIndex((report) => report.id === reportId);
  if (index < 0) return null;
  return {
    index,
    report: bucket.reports[index]
  };
}

function makeRowId(context, index) {
  return `ST-${toSlug(context.systemCode)}-${toSlug(context.frequencyCode)}-${Date.now()}-${index}`;
}

function makeReportId(context) {
  return `RP-${toSlug(context.systemCode)}-${toSlug(context.frequencyCode)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function getContextFromUrl(searchValue = window.location.search) {
  const params = new URLSearchParams(searchValue || "");
  const rawSystem = params.get(SY_PM_QUERY_KEYS.system) || "";
  const rawFrequency = params.get(SY_PM_QUERY_KEYS.frequency) || "";

  const normalized = normalizeContext({
    systemCode: rawSystem,
    frequencyCode: rawFrequency,
    plantCode: params.get(SY_PM_QUERY_KEYS.plant) || "AA"
  }, { allowDefaultFrequency: true });

  return {
    plantCode: normalized.plantCode,
    systemCode: normalized.systemCode,
    frequencyCode: normalized.frequencyCode,
    rawSystem,
    rawFrequency,
    hasValidSystem: Boolean(normalizeSystem(rawSystem)),
    hasValidFrequency: Boolean(normalizeFrequency(rawFrequency)),
    isValid: Boolean(normalizeSystem(rawSystem) && normalizeFrequency(rawFrequency))
  };
}

export function listStaticRows(context) {
  return withReadContext(context, (bucket) => sortStaticRows(bucket.staticRows));
}

export function createStaticRow(context, payload) {
  return withWriteContext(context, (bucket, normalizedContext) => {
    const item = String(payload?.item || "").trim();
    const action = String(payload?.action || "").trim();
    const referenceValue = String(payload?.referenceValue || "").trim();

    if (!item) {
      throw new Error("Item is required.");
    }

    const nextOrder = bucket.staticRows.length
      ? Math.max(...bucket.staticRows.map((row) => Number(row.order || 0))) + 1
      : 1;

    const row = {
      id: makeRowId(normalizedContext, nextOrder),
      order: nextOrder,
      item,
      action,
      referenceValue,
      updatedAt: nowIso()
    };

    bucket.staticRows.push(row);
    return row;
  });
}

export function updateStaticRow(context, rowId, payload) {
  return withWriteContext(context, (bucket) => {
    const row = bucket.staticRows.find((item) => item.id === rowId);
    if (!row) {
      throw new Error("Static record not found.");
    }

    const item = String(payload?.item || "").trim();
    const action = String(payload?.action || "").trim();
    const referenceValue = String(payload?.referenceValue || "").trim();

    if (!item) {
      throw new Error("Item is required.");
    }

    row.item = item;
    row.action = action;
    row.referenceValue = referenceValue;
    row.updatedAt = nowIso();

    bucket.reports.forEach((report) => {
      report.rows = report.rows.map((reportRow) => {
        if (reportRow.staticRowId !== rowId) return reportRow;
        return {
          ...reportRow,
          item,
          action,
          referenceValue
        };
      });
      report.updatedAt = nowIso();
    });

    return row;
  });
}

export function deleteStaticRow(context, rowId) {
  return withWriteContext(context, (bucket) => {
    const index = bucket.staticRows.findIndex((row) => row.id === rowId);
    if (index < 0) {
      throw new Error("Static record not found.");
    }

    bucket.staticRows.splice(index, 1);
    bucket.staticRows = sortStaticRows(bucket.staticRows).map((row, rowIndex) => ({
      ...row,
      order: rowIndex + 1
    }));

    bucket.reports = bucket.reports.map((report) => ({
      ...report,
      rows: report.rows.filter((row) => row.staticRowId !== rowId),
      updatedAt: nowIso()
    }));

    return true;
  });
}

export function getInstruction(context) {
  return withReadContext(context, (bucket) => ({ ...bucket.instruction }));
}

export function updateInstruction(context, textValue) {
  return withWriteContext(context, (bucket) => {
    const text = String(textValue || "").trim();
    if (!text) {
      throw new Error("Instruction text is required.");
    }

    bucket.instruction = {
      text,
      updatedAt: nowIso()
    };

    return bucket.instruction;
  });
}

export function listReports(context) {
  return withReadContext(context, (bucket) => sortReports(bucket.reports));
}

export function createReport(context, options = {}) {
  return withWriteContext(context, (bucket, normalizedContext) => {
    const staticRows = sortStaticRows(bucket.staticRows);
    if (!staticRows.length) {
      throw new Error("Static data is required before generating report.");
    }

    const reportDate = options.reportDate ? toIsoDate(options.reportDate) : toIsoDate(new Date());
    const report = {
      id: makeReportId(normalizedContext),
      reportDate,
      systemCode: normalizedContext.systemCode,
      frequencyCode: normalizedContext.frequencyCode,
      rows: buildReportRowsFromStaticRows(staticRows),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      createdBy: String(options.createdBy || "Demo User")
    };

    bucket.reports.unshift(report);
    return report;
  });
}

export function getReport(context, reportId) {
  return withReadContext(context, (bucket) => {
    const located = findReport(bucket, reportId);
    return located ? { ...located.report } : null;
  });
}

export function updateReport(context, reportId, rows) {
  return withWriteContext(context, (bucket) => {
    const located = findReport(bucket, reportId);
    if (!located) {
      throw new Error("Report not found.");
    }

    if (!Array.isArray(rows) || !rows.length) {
      throw new Error("Report rows are required.");
    }

    const staticMap = new Map(bucket.staticRows.map((row) => [row.id, row]));

    located.report.rows = rows.map((inputRow) => {
      const staticRowId = String(inputRow?.staticRowId || "").trim();
      const staticRow = staticMap.get(staticRowId);

      return {
        staticRowId,
        item: staticRow ? staticRow.item : String(inputRow?.item || "").trim(),
        action: staticRow ? staticRow.action : String(inputRow?.action || "").trim(),
        referenceValue: staticRow ? staticRow.referenceValue : String(inputRow?.referenceValue || "").trim(),
        observation: String(inputRow?.observation || "").trim(),
        remark: String(inputRow?.remark || "").trim()
      };
    });

    located.report.checkedBy1 = String(rows.checkedBy1 || located.report.checkedBy1 || "PBS"); // Defaulting to legacy value for demo
    located.report.checkedBy2 = String(rows.checkedBy2 || located.report.checkedBy2 || "PNV");

    located.report.updatedAt = nowIso();
    return located.report;
  });
}

export function deleteReport(context, reportId) {
  return withWriteContext(context, (bucket) => {
    const index = bucket.reports.findIndex((report) => report.id === reportId);
    if (index < 0) {
      throw new Error("Report not found.");
    }

    bucket.reports.splice(index, 1);
    return true;
  });
}

export function getBlankFormat(context) {
  return withReadContext(context, (bucket) => buildReportRowsFromStaticRows(bucket.staticRows));
}

export function clearRuntimeState() {
  const storage = tryGetStorage();
  if (storage) {
    storage.removeItem(STORAGE_KEY);
  }
  memoryState = null;
}
