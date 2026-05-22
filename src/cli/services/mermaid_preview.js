const DEFAULT_MIN_ZOOM = 0;
const DEFAULT_MAX_ZOOM = 1.8;
const DEFAULT_STEP = 0.08;
const { buildOptionalAssetTags, buildOptionalProviderHtmlComment, buildUiProviderSummary, getOptionalUiAssets } = require("./ui_asset_provider");
const { buildDashboardKitHtmlComment } = require("./ui_kit_provider");

function buildMermaidPreviewHtml({
  title,
  summary = [],
  rendered = "",
  diagramSource = "",
  bodyHtml = "",
  kind = "visual",
  fallbackLabel = "Preview markdown",
  diagramTitle = "Diagram Graph",
  ui_provider: uiProvider,
  provider,
  withBootstrap,
  with_bootstrap: withBootstrapAlt,
  noBootstrap,
  no_bootstrap: noBootstrapAlt
}) {
  const mermaidBlock = extractMermaidBlock(diagramSource || rendered);
  const diagramHtml = mermaidBlock ? renderFlowchartSvg(mermaidBlock) : "";
  const previewScript = mermaidBlock ? buildMermaidPreviewScript() : "";
  const hasDiagramSource = Boolean(mermaidBlock);
  const noDiagramMessage = hasDiagramSource ? "Mermaid source was found, but the diagram could not be rendered. Review the fallback markdown below." : "No Mermaid source was found in this output.";
  const uiAssets = buildOptionalUiAssetMarkup({
    ui_provider: uiProvider,
    provider,
    withBootstrap,
    with_bootstrap: withBootstrapAlt,
    noBootstrap,
    no_bootstrap: noBootstrapAlt
  });
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeXml(title)}</title>
${indentHtmlBlock(uiAssets, 2)}
  <style>
    :root { color-scheme: light; }
    html, body { margin: 0; font-family: system-ui, sans-serif; background: #f5f7fb; color: #1f2937; overflow-y: auto; }
    body { min-height: 100%; overflow-x: hidden; }
    header { padding: 24px 28px 12px; border-bottom: 1px solid #d9e1ee; background: linear-gradient(180deg, #ffffff, #f7f9fc); }
    h1 { margin: 0 0 8px; font-size: 28px; line-height: 1.2; }
    .meta { display: flex; flex-wrap: wrap; gap: 8px; font-size: 13px; color: #475569; }
    .pill { padding: 4px 10px; border-radius: 999px; background: #e8eef7; }
    main { padding: 18px 24px 36px; display: block; box-sizing: border-box; }
    main > * + * { margin-top: 16px; }
    .diagram-shell { padding: 18px; border-radius: 16px; background: #ffffff; border: 1px solid #d9e1ee; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06); overflow: hidden; min-height: 0; display: flex; flex-direction: column; }
    .diagram-title { margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; }
    .status { margin: 0; font-size: 14px; color: #0f172a; background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 10px; padding: 8px 10px; }
    .status b { font-weight: 650; }
    .error { margin-top: 10px; color: #7f1d1d; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 8px 10px; }
    .error.hidden { display: none; }
    .diagram-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 12px; }
    .diagram-toolbar button { appearance: none; border: 1px solid #cbd5e1; background: #f8fafc; color: #0f172a; border-radius: 10px; padding: 6px 10px; font-size: 13px; cursor: pointer; }
    .diagram-toolbar button:hover { background: #eef2ff; border-color: #a5b4fc; }
    .diagram-toolbar input[type="range"] { width: min(260px, 100%); }
    .diagram-frame { width: 100%; flex: 0 0 auto; min-height: 0; overflow: hidden; touch-action: none; cursor: grab; transition: height 120ms ease; }
    .diagram-frame.is-dragging { cursor: grabbing; }
    .diagram-shell svg { display: block; width: 100%; height: 100%; transform-origin: 0 0; will-change: transform; shape-rendering: geometricPrecision; text-rendering: geometricPrecision; }
    .fallback { margin: 0; padding: 0; }
    .fallback summary { list-style: none; cursor: pointer; color: #475569; font-size: 13px; margin-bottom: 10px; }
    .fallback summary::-webkit-details-marker { display: none; }
    .fallback pre { white-space: pre-wrap; word-break: break-word; margin: 0; padding: 20px; border-radius: 16px; background: #ffffff; border: 1px solid #d9e1ee; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06); font-size: 14px; line-height: 1.6; max-height: 28vh; overflow: auto; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeXml(title)}</h1>
    <p class="status" id="kvdf-preview-status"><b>Status:</b> ${hasDiagramSource ? "Diagram source detected." : "No Mermaid source detected."} Rendering fallback.</p>
    <div class="meta">${summary.map((item) => `<span class="pill">${escapeXml(item)}</span>`).join("")}</div>
  </header>
  <main>
    <section class="error hidden" id="kvdf-preview-error">${escapeXml(noDiagramMessage)}</section>
    ${diagramHtml ? `
    <section class="diagram-shell">
      <div class="diagram-title">${escapeXml(diagramTitle)}</div>
      <div class="diagram-toolbar">
        <button type="button" data-zoom-out>-</button>
        <button type="button" data-zoom-in>+</button>
        <button type="button" data-zoom-reset>Reset</button>
        <span data-zoom-label>100%</span>
        <input type="range" min="0" max="180" step="1" value="100" data-zoom-range aria-label="Zoom level">
      </div>
      <div class="diagram-frame">${diagramHtml}</div>
    </section>` : ""}
    ${bodyHtml}
    <details class="fallback">
      <summary>${escapeXml(fallbackLabel)}</summary>
      <pre>${escapeXml(rendered || "")}</pre>
    </details>
  </main>
  ${buildMermaidPreviewStatusScript(hasDiagramSource, !!diagramHtml)}
  ${previewScript}
</body>
</html>`;
}

function buildMermaidPreviewStatusScript(hasSource, hasRenderedDiagram) {
  return `<script>
(function () {
  var status = document.getElementById("kvdf-preview-status");
  var error = document.getElementById("kvdf-preview-error");
  if (!status || !error) return;
  var fallbackMessage = hasSource ? "No diagram was rendered; showing fallback markdown only." : "No Mermaid source was found; showing fallback markdown only.";
  if (hasRenderedDiagram) {
    status.innerHTML = "<b>Status:</b> Diagram rendered as an embedded SVG.";
    return;
  }
  status.innerHTML = "<b>Status:</b> Diagram unavailable.";
  error.classList.remove("hidden");
  error.textContent = fallbackMessage;
})();
</script>`;
}

function buildOptionalUiAssetMarkup(options = {}) {
  const providerSummary = buildUiProviderSummary({
    ui_provider: options.ui_provider || options.provider,
    provider: options.provider,
    withBootstrap: options.withBootstrap || options["with-bootstrap"],
    with_bootstrap: options.with_bootstrap,
    noBootstrap: options.noBootstrap || options["no-bootstrap"],
    no_bootstrap: options.no_bootstrap,
    withTailwind: options.withTailwind || options["with-tailwind"],
    with_tailwind: options.with_tailwind,
    noTailwind: options.noTailwind || options["no-tailwind"],
    no_tailwind: options.no_tailwind
  });
  const selected = getOptionalUiAssets({
    ui_provider: options.ui_provider || options.provider,
    provider: options.provider,
    withBootstrap: options.withBootstrap || options["with-bootstrap"],
    with_bootstrap: options.with_bootstrap,
    noBootstrap: options.noBootstrap || options["no-bootstrap"],
    no_bootstrap: options.no_bootstrap
  });
  const comment = providerSummary.provider && providerSummary.provider !== "fallback"
    ? `${buildOptionalProviderHtmlComment(providerSummary)}\n`
    : "";
  return `${buildDashboardKitHtmlComment(options)}\n${comment}${buildOptionalAssetTags(selected, options)}`;
}

function indentHtmlBlock(value, spaces = 2) {
  const text = String(value || "").trim();
  if (!text) return "";
  const indent = " ".repeat(spaces);
  return text.split("\n").map((line) => `${indent}${line}`).join("\n");
}

function buildMermaidPreviewScript() {
  return `<script>
(function () {
  var frame = document.querySelector('.diagram-frame');
  var svg = frame && frame.querySelector('svg');
  var label = document.querySelector('[data-zoom-label]');
  var range = document.querySelector('[data-zoom-range]');
  var zoomIn = document.querySelector('[data-zoom-in]');
  var zoomOut = document.querySelector('[data-zoom-out]');
  var zoomReset = document.querySelector('[data-zoom-reset]');
  if (!frame || !svg || !label || !range || !zoomIn || !zoomOut || !zoomReset) return;
  var minZoom = ${DEFAULT_MIN_ZOOM};
  var maxZoom = ${DEFAULT_MAX_ZOOM};
  var step = ${DEFAULT_STEP};
  var zoom = 1;
  var panX = 0;
  var panY = 0;
  var dragging = false;
  var origin = null;
  var autoFit = true;
  var fitScale = 1;
  var fitOffsetX = 0;
  var fitOffsetY = 0;
  var baseFrameHeight = Math.max(frame.getBoundingClientRect().height || 0, 560);

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function apply() {
    svg.style.transformOrigin = '0 0';
    var effectiveZoom = autoFit ? fitScale * zoom : zoom;
    var offsetX = autoFit ? fitOffsetX : 0;
    var offsetY = autoFit ? fitOffsetY : 0;
    svg.style.transform = 'translate(' + offsetX + 'px, ' + offsetY + 'px) translate(' + panX + 'px, ' + panY + 'px) scale(' + effectiveZoom + ')';
    label.textContent = Math.round(effectiveZoom * 100) + '%';
    range.value = String(Math.round(zoom * 100));
    frame.style.height = Math.max(0, Math.round(baseFrameHeight * (autoFit ? fitScale * zoom : zoom))) + 'px';
  }

  function setZoom(next) {
    autoFit = false;
    zoom = clamp(Number(next.toFixed(2)), minZoom, maxZoom);
    apply();
  }

  function zoomBy(delta) {
    setZoom(zoom + delta);
  }

  function fitToFrame() {
    var frameWidth = frame.clientWidth || 1;
    var frameHeight = Math.max(frame.clientHeight || 0, baseFrameHeight);
    var viewBox = svg.viewBox && svg.viewBox.baseVal ? svg.viewBox.baseVal : null;
    var svgWidth = viewBox && viewBox.width ? viewBox.width : svg.clientWidth || frameWidth;
    var svgHeight = viewBox && viewBox.height ? viewBox.height : svg.clientHeight || frameHeight;
    var fit = Math.min((frameWidth - 16) / svgWidth, (frameHeight - 16) / svgHeight);
    var presentationBoost = 1.35;
    fitScale = clamp(Number(((fit || 1) * presentationBoost).toFixed(2)), minZoom, maxZoom);
    fitOffsetX = 0;
    fitOffsetY = 0;
    zoom = 1;
    panX = 0;
    panY = 0;
    autoFit = true;
    apply();
  }

  zoomIn.addEventListener('click', function () { zoomBy(step); });
  zoomOut.addEventListener('click', function () { zoomBy(-step); });
  zoomReset.addEventListener('click', function () { fitToFrame(); });
  range.addEventListener('input', function () {
    autoFit = false;
    zoom = clamp(Number(range.value) / 100, minZoom, maxZoom);
    apply();
  });
  frame.addEventListener('wheel', function (event) {
    event.preventDefault();
    autoFit = false;
    zoomBy(event.deltaY > 0 ? -step : step);
  }, { passive: false });
  frame.addEventListener('pointerdown', function (event) {
    if (event.button !== 0) return;
    autoFit = false;
    dragging = true;
    frame.classList.add('is-dragging');
    origin = { x: event.clientX - panX, y: event.clientY - panY };
    frame.setPointerCapture(event.pointerId);
  });
  frame.addEventListener('pointermove', function (event) {
    if (!dragging || !origin) return;
    panX = event.clientX - origin.x;
    panY = event.clientY - origin.y;
    apply();
  });
  function stopDragging() {
    dragging = false;
    origin = null;
    frame.classList.remove('is-dragging');
  }
  frame.addEventListener('pointerup', stopDragging);
  frame.addEventListener('pointercancel', stopDragging);
  window.addEventListener('resize', function () {
    if (autoFit) fitToFrame();
  });

  fitToFrame();
})();
</script>`;
}

function extractMermaidBlock(rendered) {
  const match = String(rendered || "").match(/```mermaid\s*([\s\S]*?)```/i);
  return match ? match[1].trim() : "";
}

function renderFlowchartSvg(source) {
  const lines = String(source || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const edges = [];
  const nodes = new Map();
  let direction = "TD";
  for (const line of lines) {
    if (/^flowchart\s+/i.test(line)) {
      const parts = line.split(/\s+/);
      direction = (parts[1] || "TD").toUpperCase();
      continue;
    }
    if (line.startsWith("subgraph ") || line === "end" || line.startsWith("%%")) continue;
    const nodeDefMatch = line.match(/^([A-Za-z0-9_-]+)\[(.*)\]$/);
    if (nodeDefMatch && !line.includes("-->")) {
      const nodeId = nodeDefMatch[1];
      const nodeLabel = parseMermaidNodeLabel(nodeDefMatch[2]);
      if (!nodes.has(nodeId)) nodes.set(nodeId, { id: nodeId, label: nodeLabel });
      else nodes.get(nodeId).label = nodeLabel;
      continue;
    }
    const edgeMatch = line.match(/^([A-Za-z0-9_-]+)(?:\[(.*?)\])?\s*-\->\s*([A-Za-z0-9_-]+)(?:\[(.*?)\])?$/);
    if (!edgeMatch) continue;
    const from = edgeMatch[1];
    const fromLabel = edgeMatch[2] || from;
    const to = edgeMatch[3];
    const toLabel = edgeMatch[4] || to;
    edges.push([from, to]);
    if (!nodes.has(from)) nodes.set(from, { id: from, label: fromLabel });
    if (!nodes.has(to)) nodes.set(to, { id: to, label: toLabel });
  }
  if (!edges.length) return "";
  const ordered = buildNodeOrder(edges);
  const horizontal = direction === "LR" || direction === "RL";
  const nodeWidth = horizontal ? 220 : 280;
  const nodeHeight = horizontal ? 86 : 66;
  const gapX = horizontal ? 42 : 46;
  const gapY = horizontal ? 42 : 62;
  const padding = 24;
  const layout = ordered.map((id, index) => {
    const x = horizontal ? padding + index * (nodeWidth + gapX) : padding + (index % 2) * (nodeWidth + gapX);
    const y = horizontal ? padding + (index % 2) * (nodeHeight + gapY) : padding + index * (nodeHeight + gapY);
    return { id, x, y };
  });
  const maxX = Math.max(...layout.map((item) => item.x + nodeWidth));
  const maxY = Math.max(...layout.map((item) => item.y + nodeHeight));
  const svgWidth = horizontal ? maxX + padding : Math.max(nodeWidth + padding * 2, maxX + padding);
  const svgHeight = horizontal ? Math.max(nodeHeight * 2 + gapY + padding * 2, maxY + padding) : maxY + padding;
  const nodeById = new Map(layout.map((item) => [item.id, item]));
  const nodeMarkup = layout.map((item) => {
    const label = nodeLabel(nodes.get(item.id) ? nodes.get(item.id).label : item.id);
    return `
      <g transform="translate(${item.x}, ${item.y})">
        <rect rx="16" ry="16" width="${nodeWidth}" height="${nodeHeight}" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.6" vector-effect="non-scaling-stroke"></rect>
        <text x="${nodeWidth / 2}" y="${nodeHeight / 2 - 6}" text-anchor="middle" font-size="16" font-weight="650" fill="#0f172a">${escapeXml(label.line1)}</text>
        ${label.line2 ? `<text x="${nodeWidth / 2}" y="${nodeHeight / 2 + 16}" text-anchor="middle" font-size="13" fill="#475569">${escapeXml(label.line2)}</text>` : ""}
      </g>`;
  }).join("");
  const arrowMarkup = edges.map(([from, to]) => {
    const fromNode = nodeById.get(from);
    const toNode = nodeById.get(to);
    if (!fromNode || !toNode) return "";
    const x1 = horizontal ? fromNode.x + nodeWidth : fromNode.x + nodeWidth / 2;
    const y1 = horizontal ? fromNode.y + nodeHeight / 2 : fromNode.y + nodeHeight;
    const x2 = horizontal ? toNode.x : toNode.x + nodeWidth / 2;
    const y2 = horizontal ? toNode.y + nodeHeight / 2 : toNode.y;
    const marker = "url(#kvdf-arrow)";
    return horizontal
      ? `<path d="M ${x1} ${y1} C ${x1 + 24} ${y1}, ${x2 - 24} ${y2}, ${x2} ${y2}" fill="none" stroke="#64748b" stroke-width="2.2" marker-end="${marker}" vector-effect="non-scaling-stroke"></path>`
      : `<path d="M ${x1} ${y1} C ${x1} ${y1 + 24}, ${x2} ${y2 - 24}, ${x2} ${y2}" fill="none" stroke="#64748b" stroke-width="2.2" marker-end="${marker}" vector-effect="non-scaling-stroke"></path>`;
  }).join("");
  return `
    <svg viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMinYMin meet" role="img" aria-label="Planner visual diagram">
      <defs>
        <marker id="kvdf-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b"></path>
        </marker>
      </defs>
      <g>${arrowMarkup}</g>
      <g>${nodeMarkup}</g>
    </svg>`;
}

function buildNodeOrder(edges) {
  const order = [];
  const seen = new Set();
  for (const [from, to] of edges) {
    if (!seen.has(from)) {
      order.push(from);
      seen.add(from);
    }
    if (!seen.has(to)) {
      order.push(to);
      seen.add(to);
    }
  }
  return order;
}

function nodeLabel(id) {
  const label = String(id || "").replace(/\\n/g, "\n").replace(/_/g, " ");
  const splitLines = label.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  if (splitLines.length > 1) {
    return {
      line1: splitLines[0],
      line2: splitLines[1]
    };
  }
  const parts = label.split(/\s+/).filter(Boolean);
  if (parts.length <= 2) return { line1: titleCase(label), line2: "" };
  return { line1: titleCase(parts.slice(0, 2).join(" ")), line2: titleCase(parts.slice(2).join(" ")) };
}

function parseMermaidNodeLabel(value) {
  const raw = String(value || "")
    .trim()
    .replace(/^"(.*)"$/, "$1")
    .replace(/^'(.*)'$/, "$1")
    .replace(/\\n/g, "\n");
  const lines = raw.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return "";
  if (lines.length === 1) return lines[0];
  return `${lines[0]}\n${lines[1]}`;
}

function titleCase(value) {
  return String(value || "")
    .split(/\s+/)
    .map((word) => word ? word[0].toUpperCase() + word.slice(1) : "")
    .join(" ");
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

module.exports = {
  buildMermaidPreviewHtml,
  buildMermaidPreviewScript,
  buildNodeOrder,
  escapeXml,
  extractMermaidBlock,
  nodeLabel,
  parseMermaidNodeLabel,
  renderFlowchartSvg,
  titleCase
};
