import {
  SY_PM_FREQUENCIES,
  SY_PM_SYSTEMS,
  getFrequencyLabel,
  getSystemMeta,
  toContextKey,
  toSlug
} from "./constants.js";

const BASE_STATIC_ITEMS = [
  {
    item: "Cabinet room AC health",
    action: "Verify all cooling units are operating without alarm.",
    referenceValue: "Nominal"
  },
  {
    item: "Cabinet door status",
    action: "Inspect and lock all control cabinet doors.",
    referenceValue: "Closed"
  },
  {
    item: "Power supply modules",
    action: "Check BPS health LEDs and acknowledge failures.",
    referenceValue: "All healthy"
  },
  {
    item: "System alarm summary",
    action: "Review active alarms and acknowledge per SOP.",
    referenceValue: "No critical alarms"
  },
  {
    item: "FAN running indication",
    action: "Inspect fan cards and airflow paths.",
    referenceValue: "Running"
  },
  {
    item: "Printer / event logger",
    action: "Confirm paper and ribbon quality.",
    referenceValue: "Available"
  }
];

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

function createStaticRows(systemCode, frequencyCode) {
  const systemMeta = getSystemMeta(systemCode);
  const systemShort = systemMeta?.shortCode || "SYSTEM";
  const frequencyLabel = getFrequencyLabel(frequencyCode);
  const baseSlug = `${toSlug(systemCode)}-${toSlug(frequencyCode)}`;

  return BASE_STATIC_ITEMS.map((row, index) => ({
    id: `ST-${baseSlug}-${index + 1}`,
    order: index + 1,
    item: `${row.item} (${systemShort})`,
    action: row.action,
    referenceValue: row.referenceValue,
    updatedAt: nowIso(),
    tag: `${systemShort}-${frequencyLabel.toUpperCase()}-${String(index + 1).padStart(2, "0")}`
  }));
}

function createInstruction(systemCode, frequencyCode) {
  const systemMeta = getSystemMeta(systemCode);
  const frequencyLabel = getFrequencyLabel(frequencyCode);

  return {
    text: `Follow ${systemMeta?.shortCode || "system"} ${frequencyLabel.toLowerCase()} checklist. Any deviation beyond SOP limits must be highlighted in report remark before shift handover.`,
    updatedAt: nowIso()
  };
}

function createSampleReport(systemCode, frequencyCode, staticRows) {
  const reportDate = toIsoDate(new Date());
  const baseSlug = `${toSlug(systemCode)}-${toSlug(frequencyCode)}`;

  const rows = staticRows.map((row, index) => ({
    staticRowId: row.id,
    item: row.item,
    action: row.action,
    referenceValue: row.referenceValue,
    observation: index < 2 ? "Within acceptable operating range." : "",
    remark: index === 2 ? "Monitor trend for next cycle." : ""
  }));

  return {
    id: `RP-${baseSlug}-1`,
    reportDate,
    systemCode,
    frequencyCode,
    rows,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    createdBy: "Demo User"
  };
}

function createFixtureContextBundle(systemCode, frequencyCode) {
  const staticRows = createStaticRows(systemCode, frequencyCode);
  const includeSample = frequencyCode === "daily" || frequencyCode === "weekly";

  return {
    staticRows,
    instruction: createInstruction(systemCode, frequencyCode),
    reports: includeSample ? [createSampleReport(systemCode, frequencyCode, staticRows)] : [],
    updatedAt: nowIso()
  };
}

export function buildFixtureState() {
  const contexts = {};

  SY_PM_SYSTEMS.forEach((system) => {
    SY_PM_FREQUENCIES.forEach((frequency) => {
      const key = toContextKey({
        systemCode: system.code,
        frequencyCode: frequency.code
      });
      contexts[key] = createFixtureContextBundle(system.code, frequency.code);
    });
  });

  return {
    version: 1,
    contexts,
    createdAt: nowIso()
  };
}

export function buildFixtureForContext(context) {
  return createFixtureContextBundle(context.systemCode, context.frequencyCode);
}
