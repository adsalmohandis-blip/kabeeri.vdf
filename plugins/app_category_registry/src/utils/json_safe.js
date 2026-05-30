function safeJsonParse(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function safeJsonStringify(value, spaces = 2) {
  return JSON.stringify(value, null, spaces);
}

module.exports = { safeJsonParse, safeJsonStringify };
