function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function isSafeSlug(value) {
  return /^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(String(value || ""));
}

function normalizeCategory(value) {
  return slugify(value);
}

module.exports = { slugify, isSafeSlug, normalizeCategory };
