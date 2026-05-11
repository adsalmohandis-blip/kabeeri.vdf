function blueprint(action, value, flags = {}, rest = [], deps = {}) {
  const {
    table = () => "",
    fileExists = () => false,
    ensureWorkspace = () => {},
    readJsonFile = () => ({}),
    writeJsonFile = () => {},
    buildBlueprintRecommendation,
    buildBlueprintContext,
    buildAiBlueprintContext,
    buildBlueprintSelection,
    getProductBlueprintCatalog,
    findProductBlueprint,
    readProductBlueprintState,
    getCurrentBlueprintKey,
    buildDataDesignContext,
    renderBlueprintRecommendation,
    buildDataDesignReview,
    buildQuestionnaireIntakePlan,
    buildUiDesignRecommendation,
    buildDeliveryModeRecommendation,
    buildQuestionnaireFrameworkContext,
    buildAdaptiveIntakeQuestions,
    detectLanguage,
    resolveOutputLanguage,
    appendAudit
  } = deps;

  const catalog = getProductBlueprintCatalog();
  const blueprints = catalog.blueprints || [];

  if (!action || action === "list") {
    const rows = blueprints.map((item) => [item.key, item.name, item.category, item.recommended_delivery, (item.channels || []).join(",")]);
    console.log(table(["Key", "Blueprint", "Category", "Delivery", "Channels"], rows));
    return;
  }

  if (action === "show") {
    const item = findProductBlueprint(value);
    if (!item) throw new Error(`Product blueprint not found: ${value || ""}`);
    const result = buildBlueprintContext(item, catalog.core_platform);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (action === "recommend" || action === "detect" || action === "map") {
    const input = [value, ...rest].filter(Boolean).join(" ");
    if (!input) throw new Error("Missing product description.");
    const recommendation = buildBlueprintRecommendation(input, flags);
    if (fileExists(".kabeeri")) {
      const state = readProductBlueprintState();
      state.recommendations.push(recommendation);
      writeJsonFile(".kabeeri/product_blueprints.json", state);
    }
    if (flags.json) console.log(JSON.stringify(recommendation, null, 2));
    else renderBlueprintRecommendation(recommendation);
    return;
  }

  if (action === "select" || action === "choose") {
    ensureWorkspace();
    const item = findProductBlueprint(value);
    if (!item) throw new Error(`Product blueprint not found: ${value || ""}`);
    const state = readProductBlueprintState();
    const selection = buildBlueprintSelection(item, flags);
    state.selected_blueprints.push(selection);
    state.current_blueprint = item.key;
    writeJsonFile(".kabeeri/product_blueprints.json", state);
    if (fileExists(".kabeeri/project.json")) {
      const project = readJsonFile(".kabeeri/project.json");
      project.product_blueprint = item.key;
      if (flags.delivery) project.delivery_mode = flags.delivery;
      writeJsonFile(".kabeeri/project.json", project);
    }
    console.log(JSON.stringify(selection, null, 2));
    return;
  }

  if (action === "context") {
    const item = findProductBlueprint(value);
    if (!item) throw new Error(`Product blueprint not found: ${value || ""}`);
    const context = buildAiBlueprintContext(item, catalog.core_platform);
    if (flags.json) console.log(JSON.stringify(context, null, 2));
    else {
      console.log(`AI Context: ${item.name}`);
      console.log(table(["Surface", "Items"], [
        ["Channels", context.channels.join(", ")],
        ["Backend modules", context.backend_modules.join(", ")],
        ["Frontend pages", context.frontend_pages.join(", ")],
        ["Database entities", context.database_entities.join(", ")],
        ["Workstreams", context.workstreams.join(", ")],
        ["Governance", context.governance_links.join(", ")]
      ]));
    }
    return;
  }

  if (action === "history") {
    ensureWorkspace();
    const state = readProductBlueprintState();
    const rows = state.recommendations.map((item) => [
      item.recommendation_id,
      item.matches[0] ? item.matches[0].blueprint_key : "",
      item.matches[0] ? item.matches[0].score : 0,
      item.input
    ]);
    console.log(table(["ID", "Top match", "Score", "Input"], rows));
    return;
  }

  throw new Error(`Unknown blueprint action: ${action}`);
}

function dataDesign(action, value, flags = {}, rest = [], deps = {}) {
  const {
    table = () => "",
    fileExists = () => false,
    ensureWorkspace = () => {},
    readJsonFile = () => ({}),
    writeJsonFile = () => {},
    getDataDesignCatalog,
    readDataDesignState,
    getCurrentBlueprintKey,
    buildDataDesignContext,
    buildDataDesignReview,
    findProductBlueprint,
    buildBlueprintRecommendation
  } = deps;

  const catalog = getDataDesignCatalog();

  if (!action || action === "principles" || action === "list") {
    const rows = catalog.universal_principles.map((item) => [item.key, item.title, item.why]);
    console.log(table(["Key", "Principle", "Why"], rows));
    return;
  }

  if (action === "principle" || action === "show") {
    const key = String(value || "").toLowerCase();
    const principle = catalog.universal_principles.find((item) => item.key === key);
    if (!principle) throw new Error(`Data design principle not found: ${value || ""}`);
    console.log(JSON.stringify(principle, null, 2));
    return;
  }

  if (action === "modules") {
    const rows = Object.entries(catalog.module_patterns).map(([key, item]) => [key, (item.entities || []).slice(0, 8).join(", "), (item.must_have || []).slice(0, 6).join(", ")]);
    console.log(table(["Module", "Entities", "Must have"], rows));
    return;
  }

  if (action === "module") {
    const key = String(value || "").toLowerCase();
    const module = catalog.module_patterns[key];
    if (!module) throw new Error(`Data design module not found: ${value || ""}`);
    console.log(JSON.stringify({ module_key: key, ...module }, null, 2));
    return;
  }

  if (action === "context" || action === "blueprint") {
    const blueprintKey = value || flags.blueprint || getCurrentBlueprintKey();
    if (!blueprintKey) throw new Error("Missing blueprint key. Use `kvdf data-design context ecommerce` or select a product blueprint first.");
    const context = buildDataDesignContext(blueprintKey, flags);
    if (fileExists(".kabeeri")) {
      const state = readDataDesignState();
      state.contexts.push(context);
      state.current_context = context.context_id;
      writeJsonFile(".kabeeri/data_design.json", state);
    }
    if (flags.json) console.log(JSON.stringify(context, null, 2));
    else renderDataDesignContext(context, table);
    return;
  }

  if (action === "recommend") {
    const input = [value, ...rest].filter(Boolean).join(" ");
    if (!input) throw new Error("Missing product or database description.");
    const blueprintRecommendation = buildBlueprintRecommendation(input, { limit: 1 });
    const top = blueprintRecommendation.matches[0] ? blueprintRecommendation.matches[0].blueprint_key : flags.blueprint;
    if (!top) throw new Error("Could not detect a product blueprint. Use --blueprint <key>.");
    const context = buildDataDesignContext(top, { ...flags, input });
    if (fileExists(".kabeeri")) {
      const state = readDataDesignState();
      state.contexts.push(context);
      state.current_context = context.context_id;
      writeJsonFile(".kabeeri/data_design.json", state);
    }
    if (flags.json) console.log(JSON.stringify(context, null, 2));
    else renderDataDesignContext(context, table);
    return;
  }

  if (action === "review") {
    ensureWorkspace();
    const target = value || flags.file || flags.target || "database_design";
    const review = buildDataDesignReview(target, flags);
    const state = readDataDesignState();
    state.reviews.push(review);
    writeJsonFile(".kabeeri/data_design.json", state);
    console.log(JSON.stringify(review, null, 2));
    return;
  }

  if (action === "checklist") {
    if (flags.json) console.log(JSON.stringify({ checklist: catalog.approval_checklist }, null, 2));
    else console.log(table(["#", "Check"], catalog.approval_checklist.map((item, index) => [index + 1, item])));
    return;
  }

  if (action === "history") {
    ensureWorkspace();
    const state = readDataDesignState();
    console.log(table(["Context", "Blueprint", "Modules", "Entities"], state.contexts.map((item) => [
      item.context_id,
      item.blueprint_key,
      item.modules.join(","),
      String((item.entities || []).length)
    ])));
    return;
  }

  throw new Error(`Unknown data-design action: ${action}`);
}

function renderDataDesignContext(context, table) {
  console.log(`Data design context: ${context.context_id}`);
  console.log(`Blueprint: ${context.blueprint_name} (${context.blueprint_key})`);
  console.log(table(["Surface", "Items"], [
    ["Modules", context.modules.join(", ")],
    ["Entities", context.entities.slice(0, 24).join(", ")],
    ["Must have", context.must_have.slice(0, 18).join(", ")],
    ["Indexes", context.indexes.slice(0, 12).join(", ")],
    ["Risks", context.risk_flags.join(", ")]
  ]));
}

module.exports = { blueprint, dataDesign, renderDataDesignContext };
