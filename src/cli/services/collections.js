function uniqueList(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function uniqueBy(items, key) {
  const seen = new Set();
  return (items || []).filter((item) => {
    const value = item && item[key];
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function parseCsv(value) {
  if (Array.isArray(value)) return uniqueList(value.flatMap((item) => parseCsv(item)));
  if (!value) return [];
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function matchesAny(file, patterns) {
  return (patterns || []).some((pattern) => {
    if (!pattern) return false;
    const value = String(pattern);
    const target = String(file || "");
    if (value.endsWith("/")) return target.startsWith(value);
    if (value.includes("*")) {
      const escaped = value.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
      return new RegExp(`^${escaped}$`).test(target);
    }
    return target === value || target.startsWith(`${value}/`);
  });
}

function isExpired(value) {
  if (!value) return false;
  const when = new Date(value);
  if (Number.isNaN(when.getTime())) return false;
  return when.getTime() < Date.now();
}

function capitalize(value) {
  const text = String(value || "");
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : "";
}

module.exports = {
  capitalize,
  isExpired,
  matchesAny,
  parseCsv,
  uniqueBy,
  uniqueList
};
