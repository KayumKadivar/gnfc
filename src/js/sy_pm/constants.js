const SYSTEM_DEFINITIONS = [
  { code: "FOXBORO DCS", shortCode: "FOXBORO", type: "DCS" },
  { code: "YBL DCS", shortCode: "YBL", type: "DCS" },
  { code: "GHH DCS", shortCode: "GHH", type: "DCS" },
  { code: "TRICONEX ESD", shortCode: "TRICONEX", type: "ESD" },
  { code: "HAIL ESD", shortCode: "HAIL", type: "ESD" }
];

const FREQUENCY_DEFINITIONS = [
  { code: "daily", label: "Daily" },
  { code: "weekly", label: "Weekly" },
  { code: "monthly", label: "Monthly" },
  { code: "quarterly", label: "Quarterly" },
  { code: "halfyearly", label: "Half Yearly" },
  { code: "shutdown", label: "Shutdown" }
];

export const SY_PM_SYSTEMS = Object.freeze(SYSTEM_DEFINITIONS.slice());
export const SY_PM_FREQUENCIES = Object.freeze(FREQUENCY_DEFINITIONS.slice());

export const SY_PM_QUERY_KEYS = Object.freeze({
  system: "system",
  frequency: "freq",
  plant: "plant",
  notice: "notice"
});

export const SY_PM_NOTICES = Object.freeze({
  missingContext: "missing_context"
});

export const SY_PM_ROUTES = Object.freeze({
  selection: "/src/pages/Sy_PM.html",
  staticData: "/src/pages/static_data.html",
  reports: "/src/pages/sypm_report.html"
});

const SYSTEM_LOOKUP = new Map();
const FREQUENCY_LOOKUP = new Map();

function normalizeLookupToken(value) {
  return String(value || "")
    .replaceAll("+", " ")
    .replaceAll("%20", " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

SYSTEM_DEFINITIONS.forEach((system) => {
  const normalized = normalizeLookupToken(system.code);
  SYSTEM_LOOKUP.set(normalized, system.code);
  SYSTEM_LOOKUP.set(normalizeLookupToken(system.shortCode), system.code);
  SYSTEM_LOOKUP.set(normalizeLookupToken(`${system.shortCode} ${system.type}`), system.code);
});

const FREQUENCY_ALIASES = {
  daily: ["DAY", "DAILY"],
  weekly: ["WEEK", "WEEKLY"],
  monthly: ["MONTH", "MONTHLY"],
  quarterly: ["QUARTER", "QUARTERLY"],
  halfyearly: ["HALFYEARLY", "HALF YEARLY", "HALF-YEARLY", "HALFYEAR", "HALF YEAR"],
  shutdown: ["SHUTDOWN", "SHUT DOWN"]
};

FREQUENCY_DEFINITIONS.forEach((frequency) => {
  FREQUENCY_LOOKUP.set(normalizeLookupToken(frequency.code), frequency.code);
  FREQUENCY_LOOKUP.set(normalizeLookupToken(frequency.label), frequency.code);
  (FREQUENCY_ALIASES[frequency.code] || []).forEach((alias) => {
    FREQUENCY_LOOKUP.set(normalizeLookupToken(alias), frequency.code);
  });
});

export function normalizeSystem(value) {
  const token = normalizeLookupToken(value);
  return SYSTEM_LOOKUP.get(token) || "";
}

export function normalizeFrequency(value) {
  const token = normalizeLookupToken(value);
  return FREQUENCY_LOOKUP.get(token) || "";
}

export function getSystemMeta(systemCode) {
  const code = normalizeSystem(systemCode);
  return SYSTEM_DEFINITIONS.find((item) => item.code === code) || null;
}

export function getFrequencyMeta(frequencyCode) {
  const code = normalizeFrequency(frequencyCode);
  return FREQUENCY_DEFINITIONS.find((item) => item.code === code) || null;
}

export function getFrequencyLabel(frequencyCode) {
  const frequency = getFrequencyMeta(frequencyCode);
  return frequency ? frequency.label : "Daily";
}

export function getSystemLabel(systemCode) {
  return normalizeSystem(systemCode) || "FOXBORO DCS";
}

export function toContextKey(context) {
  const safeSystem = normalizeSystem(context?.systemCode || "") || "FOXBORO DCS";
  const safeFrequency = normalizeFrequency(context?.frequencyCode || "") || "daily";
  return `${safeSystem}__${safeFrequency}`;
}

export function toSlug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildContextQuery(context, options = {}) {
  const includeFrequency = options.includeFrequency !== false;
  const systemCode = normalizeSystem(context?.systemCode || "");
  const frequencyCode = normalizeFrequency(context?.frequencyCode || "");
  const plantCode = String(context?.plantCode || "").trim();
  const notice = String(context?.notice || "").trim();

  const params = new URLSearchParams();
  if (systemCode) params.set(SY_PM_QUERY_KEYS.system, systemCode);
  if (includeFrequency && frequencyCode) params.set(SY_PM_QUERY_KEYS.frequency, frequencyCode);
  if (plantCode) params.set(SY_PM_QUERY_KEYS.plant, plantCode);
  if (notice) params.set(SY_PM_QUERY_KEYS.notice, notice);

  return params.toString();
}

export function buildRouteWithContext(route, context, options = {}) {
  const query = buildContextQuery(context, options);
  return query ? `${route}?${query}` : route;
}

export function parsePlantCode(value) {
  const plant = String(value || "").trim().toUpperCase();
  return plant || "AA";
}
