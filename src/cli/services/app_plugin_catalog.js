module.exports = {
  "company-profile": {
    plugin_id: "company-profile",
    display_name: "Company Profile Builder",
    state_file: ".kabeeri/company_profile.json",
    default_mode: "corporate",
    supported_modes: ["startup", "corporate", "agency", "franchise"],
    common_questions: [
      "What is the company story and primary audience?",
      "What services or products should be highlighted?",
      "What trust signals, certifications, or proof points matter most?",
      "What calls to action should the site drive?",
      "Who manages the content and approvals?"
    ],
    mode_questions: {
      startup: [
        "Do you need investor or hiring focused sections?",
        "Should the site prioritize speed, pitch clarity, or lead capture?"
      ],
      corporate: [
        "Do you need investor relations, governance, or careers pages?",
        "Should the profile support multiple business units or regions?"
      ],
      agency: [
        "Do you need service packages, case studies, and lead funnels?",
        "Should the site emphasize conversion and portfolio proof?"
      ],
      franchise: [
        "Do you need location pages and franchise inquiry workflows?",
        "Should local listings or franchise forms be prioritized?"
      ]
    },
    brief_base: {
      flows: ["company narrative", "services showcase", "trust and proof", "lead capture", "admin updates"],
      system: ["durable content state", "approval-friendly publishing", "structured lead capture", "role-based editing"],
      data: ["company details", "services", "proof points", "contacts", "lead requests"]
    },
    brief_modes: {
      startup: {
        flows: ["pitch deck style narrative", "founder story", "hiring CTA"],
        system: ["investor-ready presentation", "simple lead capture"],
        data: ["investor assets", "careers", "founder bios"]
      },
      corporate: {
        flows: ["multi-division story", "governance and investor pages", "global navigation"],
        system: ["multi-region publishing", "enterprise approvals"],
        data: ["regions", "divisions", "governance pages"]
      },
      agency: {
        flows: ["services catalog", "case studies", "contact conversion"],
        system: ["campaign-friendly landing pages", "content refresh workflow"],
        data: ["case studies", "service packages", "testimonials"]
      },
      franchise: {
        flows: ["location finder", "local inquiry", "franchise onboarding"],
        system: ["branch-level content", "franchise form routing"],
        data: ["locations", "franchise leads", "territories"]
      }
    },
    base_pages: [
      { page_id: "home", purpose: "Company introduction and value proposition" },
      { page_id: "about", purpose: "Story, mission, and leadership" },
      { page_id: "services", purpose: "Highlight offerings and packages" },
      { page_id: "proof", purpose: "Case studies, testimonials, and certifications" },
      { page_id: "contact", purpose: "Lead capture and inquiry" }
    ],
    mode_pages: {
      startup: [{ page_id: "investors", purpose: "Investor and hiring focused content" }],
      corporate: [{ page_id: "divisions", purpose: "Business units and regional overview" }],
      agency: [{ page_id: "portfolio", purpose: "Portfolio and case studies" }],
      franchise: [{ page_id: "locations", purpose: "Franchise locations and inquiries" }]
    },
    base_modules: [
      { module_id: "identity", title: "Identity", purpose: "Company story, hero content, and brand voice.", workstreams: ["public_frontend", "content"] },
      { module_id: "services", title: "Services", purpose: "Service or product offerings and packages.", workstreams: ["public_frontend", "content"] },
      { module_id: "proof", title: "Proof", purpose: "Case studies, testimonials, and trust signals.", workstreams: ["public_frontend", "content"] },
      { module_id: "lead_capture", title: "Lead capture", purpose: "Forms and inquiry routing.", workstreams: ["backend", "public_frontend"] },
      { module_id: "admin", title: "Admin", purpose: "Manage pages, proof, and inquiries.", workstreams: ["admin", "backend"] }
    ],
    mode_modules: {
      startup: [{ module_id: "careers", title: "Careers", purpose: "Hiring and team growth pages.", workstreams: ["public_frontend", "content"] }],
      corporate: [{ module_id: "divisions", title: "Divisions", purpose: "Regional and business-unit pages.", workstreams: ["public_frontend", "content"] }],
      agency: [{ module_id: "portfolio", title: "Portfolio", purpose: "Case studies and portfolio pages.", workstreams: ["public_frontend", "content"] }],
      franchise: [{ module_id: "locations", title: "Locations", purpose: "Local listings and franchise inquiries.", workstreams: ["public_frontend", "backend"] }]
    }
  },
  "news-website": {
    plugin_id: "news-website",
    display_name: "News Website Builder",
    state_file: ".kabeeri/news_website.json",
    default_mode: "editorial",
    supported_modes: ["editorial", "magazine", "local-news", "newsletter"],
    common_questions: [
      "What news beat or editorial mission should the site serve?",
      "What sections or content categories are required?",
      "Who writes, edits, and approves stories?",
      "Do you need subscription, ads, or newsletter monetization?",
      "What publishing cadence is expected?"
    ],
    mode_questions: {
      editorial: [
        "Should the site support breaking-news updates and live coverage?",
        "Do you need a front-page curation workflow?"
      ],
      magazine: [
        "Should long-form features and visual stories be prioritized?",
        "Do you need special issue or themed edition pages?"
      ],
      "local-news": [
        "Do you need locality pages and civic coverage sections?",
        "Should alerts and weather or traffic modules be included?"
      ],
      newsletter: [
        "Do you need subscriber-first newsletters and archives?",
        "Should the site prioritize email capture and sign-up funnels?"
      ]
    },
    brief_base: {
      flows: ["article discovery", "editorial publishing", "front-page curation", "newsletter capture", "admin moderation"],
      system: ["durable article state", "editor workflow", "publication scheduling", "role-based approvals"],
      data: ["stories", "sections", "authors", "subscribers", "comments"]
    },
    brief_modes: {
      editorial: { flows: ["breaking updates", "live coverage", "homepage curation"], system: ["real-time editorial control"], data: ["live blogs", "alerts"] },
      magazine: { flows: ["feature stories", "special issues", "visual storytelling"], system: ["layout-rich content production"], data: ["issues", "feature series"] },
      "local-news": { flows: ["local beats", "community pages", "alerts"], system: ["regional publishing and alerts"], data: ["municipalities", "alerts"] },
      newsletter: { flows: ["subscriber capture", "issue archive", "send workflow"], system: ["newsletter-led publishing"], data: ["mailing lists", "issues"] }
    },
    base_pages: [
      { page_id: "home", purpose: "Front page and top stories" },
      { page_id: "article", purpose: "Article reading experience" },
      { page_id: "section", purpose: "Topic sections and topic landing pages" },
      { page_id: "author", purpose: "Author profile and bylines" },
      { page_id: "admin", purpose: "Editorial publishing console" }
    ],
    mode_pages: {
      editorial: [{ page_id: "live", purpose: "Live breaking-news coverage" }],
      magazine: [{ page_id: "issues", purpose: "Special issues and feature showcases" }],
      "local-news": [{ page_id: "regions", purpose: "Local coverage and community pages" }],
      newsletter: [{ page_id: "newsletter", purpose: "Subscriber capture and archive" }]
    },
    base_modules: [
      { module_id: "articles", title: "Articles", purpose: "Write and publish stories.", workstreams: ["backend", "content"] },
      { module_id: "sections", title: "Sections", purpose: "Organize content categories and landing pages.", workstreams: ["public_frontend", "content"] },
      { module_id: "authors", title: "Authors", purpose: "Author profiles and bylines.", workstreams: ["public_frontend", "content"] },
      { module_id: "newsletter", title: "Newsletter", purpose: "Capture subscribers and send issues.", workstreams: ["backend", "integration"] },
      { module_id: "admin", title: "Admin", purpose: "Editorial moderation and publishing.", workstreams: ["admin", "backend"] }
    ],
    mode_modules: {
      editorial: [{ module_id: "live_updates", title: "Live updates", purpose: "Breaking news and live coverage.", workstreams: ["backend", "public_frontend"] }],
      magazine: [{ module_id: "issues", title: "Special issues", purpose: "Issue-based storytelling.", workstreams: ["public_frontend", "content"] }],
      "local-news": [{ module_id: "regions", title: "Regional coverage", purpose: "Local pages and civic reporting.", workstreams: ["public_frontend", "content"] }],
      newsletter: [{ module_id: "archives", title: "Newsletter archives", purpose: "Subscriber archive and sign-up flow.", workstreams: ["public_frontend", "backend"] }]
    }
  },
  blog: {
    plugin_id: "blog",
    display_name: "Blog Builder",
    state_file: ".kabeeri/blog.json",
    default_mode: "personal",
    supported_modes: ["personal", "multi-author", "business", "technical"],
    common_questions: [
      "What is the blog's main topic or editorial lane?",
      "Who creates and approves posts?",
      "Do you need categories, tags, and search?",
      "Should newsletter signup or comments be enabled?",
      "What SEO, syndication, or analytics rules matter?"
    ],
    mode_questions: {
      personal: ["Do you want a simple personal writing flow?", "Should the design emphasize authorship and reading comfort?"],
      "multi-author": ["Do you need editorial review and author roles?", "Should multiple authors manage drafts independently?"],
      business: ["Do you need lead capture, case studies, or conversion blocks?", "Should blog content support product marketing?"],
      technical: ["Do you need code snippets, docs, or release-note posts?", "Should technical taxonomy and search be prioritized?"]
    },
    brief_base: {
      flows: ["post discovery", "article reading", "tag and category browsing", "newsletter signup", "admin editing"],
      system: ["durable post state", "draft and publish workflow", "search-friendly content", "role-based editing"],
      data: ["posts", "categories", "tags", "authors", "subscribers"]
    },
    brief_modes: {
      personal: { flows: ["writer-first reading", "simple archive", "reader comments"], system: ["minimal editorial overhead"], data: ["pages", "notes"] },
      "multi-author": { flows: ["draft collaboration", "editor review", "author profiles"], system: ["review queues and permissions"], data: ["review states", "editor tasks"] },
      business: { flows: ["lead capture", "service pages", "content marketing"], system: ["conversion-aware blog operations"], data: ["leads", "case studies"] },
      technical: { flows: ["docs-style posts", "release notes", "code snippets"], system: ["developer content publishing"], data: ["releases", "snippets"] }
    },
    base_pages: [
      { page_id: "home", purpose: "Blog home and recent posts" },
      { page_id: "post", purpose: "Post reading page" },
      { page_id: "archive", purpose: "Categories and tag archives" },
      { page_id: "about", purpose: "About the author or publication" },
      { page_id: "admin", purpose: "Post editor and moderation" }
    ],
    mode_pages: {
      personal: [{ page_id: "journal", purpose: "Personal journal archive" }],
      "multi-author": [{ page_id: "authors", purpose: "Author roster and profiles" }],
      business: [{ page_id: "conversion", purpose: "Lead capture and marketing CTA" }],
      technical: [{ page_id: "docs", purpose: "Docs and release-note layout" }]
    },
    base_modules: [
      { module_id: "posts", title: "Posts", purpose: "Write and publish posts.", workstreams: ["content", "public_frontend"] },
      { module_id: "taxonomy", title: "Taxonomy", purpose: "Manage categories and tags.", workstreams: ["content", "public_frontend"] },
      { module_id: "search", title: "Search", purpose: "Find content quickly.", workstreams: ["public_frontend", "backend"] },
      { module_id: "newsletter", title: "Newsletter", purpose: "Capture subscribers.", workstreams: ["backend", "integration"] },
      { module_id: "admin", title: "Admin", purpose: "Draft, review, and publish content.", workstreams: ["admin", "backend"] }
    ],
    mode_modules: {
      personal: [{ module_id: "journal", title: "Journal", purpose: "Personal writing archive.", workstreams: ["content", "public_frontend"] }],
      "multi-author": [{ module_id: "editorial", title: "Editorial workflow", purpose: "Review queues and author roles.", workstreams: ["admin", "backend"] }],
      business: [{ module_id: "conversion", title: "Conversion", purpose: "Lead capture and conversion blocks.", workstreams: ["public_frontend", "backend"] }],
      technical: [{ module_id: "docs", title: "Technical docs", purpose: "Release notes and docs-style posts.", workstreams: ["content", "public_frontend"] }]
    }
  },
  "ecommerce-mobile-app": {
    plugin_id: "ecommerce-mobile-app",
    display_name: "Ecommerce Mobile App Builder",
    state_file: ".kabeeri/ecommerce_mobile_app.json",
    default_mode: "shopping",
    supported_modes: ["shopping", "marketplace", "subscription", "loyalty"],
    common_questions: [
      "What commerce source system should the app connect to?",
      "What mobile shopping journey matters most?",
      "Do you need login, guest checkout, or saved carts?",
      "Should push notifications or deep links be used?",
      "What payment and sync constraints apply?"
    ],
    mode_questions: {
      shopping: ["Should the app prioritize catalog browsing or fast checkout?", "Do you need offline browsing for products?"],
      marketplace: ["Do you need vendor browsing and multi-seller support?", "Should vendor filtering or collection pages be included?"],
      subscription: ["Do you need subscription renewals and member access?", "Should recurring billing be visible in account screens?"],
      loyalty: ["Do you need points, rewards, or referral flows?", "Should push offers and coupon redemption be supported?"]
    },
    brief_base: {
      flows: ["catalog discovery", "product detail", "cart and checkout", "account history", "push notifications"],
      system: ["mobile-first commerce state", "idempotent checkout", "push and sync hooks", "offline-friendly caches"],
      data: ["products", "carts", "orders", "accounts", "notifications"]
    },
    brief_modes: {
      shopping: { flows: ["fast catalog", "quick checkout", "saved cart"], system: ["mobile conversion optimization"], data: ["variants", "wishlists"] },
      marketplace: { flows: ["vendor discovery", "multi-seller catalog", "market filters"], system: ["marketplace browsing and routing"], data: ["vendors", "collections"] },
      subscription: { flows: ["subscription plans", "renewal management", "member account"], system: ["recurring access and billing"], data: ["plans", "entitlements"] },
      loyalty: { flows: ["points balance", "offers", "redemption"], system: ["retention and rewards"], data: ["points", "offers"] }
    },
    base_pages: [
      { page_id: "home", purpose: "Discovery and featured commerce" },
      { page_id: "catalog", purpose: "Browse products or plans" },
      { page_id: "detail", purpose: "View product details" },
      { page_id: "cart", purpose: "Cart and checkout" },
      { page_id: "account", purpose: "Account and order history" }
    ],
    mode_pages: {
      shopping: [{ page_id: "wishlist", purpose: "Wishlists and saved items" }],
      marketplace: [{ page_id: "vendors", purpose: "Vendor and collection browsing" }],
      subscription: [{ page_id: "plans", purpose: "Subscription plans and renewals" }],
      loyalty: [{ page_id: "rewards", purpose: "Rewards and points" }]
    },
    base_modules: [
      { module_id: "catalog", title: "Catalog", purpose: "Browse products or plans.", workstreams: ["mobile_frontend", "backend"] },
      { module_id: "cart", title: "Cart", purpose: "Saved items and cart state.", workstreams: ["mobile_frontend", "backend"] },
      { module_id: "checkout", title: "Checkout", purpose: "Payment and order review.", workstreams: ["mobile_frontend", "backend"] },
      { module_id: "account", title: "Account", purpose: "Orders and profile management.", workstreams: ["mobile_frontend", "backend"] },
      { module_id: "notifications", title: "Notifications", purpose: "Push and transactional updates.", workstreams: ["integration", "backend"] }
    ],
    mode_modules: {
      shopping: [{ module_id: "wishlist", title: "Wishlist", purpose: "Saved items and favorites.", workstreams: ["mobile_frontend"] }],
      marketplace: [{ module_id: "vendors", title: "Vendors", purpose: "Seller browsing and vendor pages.", workstreams: ["mobile_frontend", "backend"] }],
      subscription: [{ module_id: "subscriptions", title: "Subscriptions", purpose: "Renewals and member access.", workstreams: ["mobile_frontend", "backend"] }],
      loyalty: [{ module_id: "rewards", title: "Rewards", purpose: "Points and offers.", workstreams: ["mobile_frontend", "backend"] }]
    }
  },
  crm: {
    plugin_id: "crm",
    display_name: "CRM Builder",
    state_file: ".kabeeri/crm.json",
    default_mode: "sales",
    supported_modes: ["sales", "support", "operations", "b2b"],
    common_questions: [
      "What teams will use the CRM and what is the primary job to be done?",
      "What records matter most: leads, contacts, accounts, deals, or tickets?",
      "Do you need automation, scoring, or routing rules?",
      "What reporting and dashboards are essential?",
      "What integrations or imports are required?"
    ],
    mode_questions: {
      sales: ["Do you need pipeline stages and forecasting?", "Should owner assignment and follow-up tasks be emphasized?"],
      support: ["Do you need ticketing and SLA views?", "Should customer history and case routing be prominent?"],
      operations: ["Do you need internal workflows and approvals?", "Should operational queues and service levels be tracked?"],
      b2b: ["Do you need account hierarchies and relationship maps?", "Should quoting or proposal flows be included?"]
    },
    brief_base: {
      flows: ["record management", "pipeline workflow", "task follow-up", "reporting", "admin settings"],
      system: ["durable CRM state", "automation and routing hooks", "role-based access", "auditable changes"],
      data: ["contacts", "accounts", "deals", "tasks", "activity logs"]
    },
    brief_modes: {
      sales: { flows: ["lead capture", "pipeline progression", "forecasting"], system: ["sales automation and scoring"], data: ["leads", "opportunities"] },
      support: { flows: ["ticket intake", "case handling", "SLA tracking"], system: ["support queue management"], data: ["tickets", "cases"] },
      operations: { flows: ["internal request", "approval queue", "service tracking"], system: ["operations workflow"], data: ["requests", "approvals"] },
      b2b: { flows: ["account hierarchy", "deal collaboration", "quotes"], system: ["relationship and quoting support"], data: ["accounts", "quotes"] }
    },
    base_pages: [
      { page_id: "dashboard", purpose: "CRM overview and activity" },
      { page_id: "records", purpose: "Contacts, accounts, and deals" },
      { page_id: "detail", purpose: "Record detail and activity timeline" },
      { page_id: "reports", purpose: "Pipeline and performance reporting" },
      { page_id: "admin", purpose: "Automation and configuration" }
    ],
    mode_pages: {
      sales: [{ page_id: "pipeline", purpose: "Sales pipeline and forecast" }],
      support: [{ page_id: "tickets", purpose: "Support queue and SLA views" }],
      operations: [{ page_id: "requests", purpose: "Operations request queue" }],
      b2b: [{ page_id: "accounts", purpose: "Account hierarchy and proposals" }]
    },
    base_modules: [
      { module_id: "records", title: "Records", purpose: "Contacts, accounts, and deals.", workstreams: ["backend", "admin"] },
      { module_id: "pipeline", title: "Pipeline", purpose: "Stages and forecasting.", workstreams: ["backend", "admin"] },
      { module_id: "tasks", title: "Tasks", purpose: "Follow-up work and reminders.", workstreams: ["backend", "admin"] },
      { module_id: "automation", title: "Automation", purpose: "Routing and triggers.", workstreams: ["backend", "integration"] },
      { module_id: "reports", title: "Reports", purpose: "Dashboards and KPIs.", workstreams: ["admin", "backend"] }
    ],
    mode_modules: {
      sales: [{ module_id: "forecast", title: "Forecast", purpose: "Sales forecast and pipeline health.", workstreams: ["admin", "backend"] }],
      support: [{ module_id: "tickets", title: "Tickets", purpose: "Case and SLA management.", workstreams: ["backend", "admin"] }],
      operations: [{ module_id: "requests", title: "Requests", purpose: "Operational request queues.", workstreams: ["backend", "admin"] }],
      b2b: [{ module_id: "accounts", title: "Accounts", purpose: "Account hierarchies and proposals.", workstreams: ["backend", "admin"] }]
    }
  },
  pos: {
    plugin_id: "pos",
    display_name: "POS Builder",
    state_file: ".kabeeri/pos.json",
    default_mode: "retail",
    supported_modes: ["retail", "restaurant", "cafe", "service"],
    common_questions: [
      "What items, menus, or services will be sold at the point of sale?",
      "Do you need inventory, staff, or terminal management?",
      "What payment methods and receipts are required?",
      "Does the POS need offline mode or sync support?",
      "What reporting and closing workflows matter?"
    ],
    mode_questions: {
      retail: ["Do you need barcode scanning and stock counts?", "Should returns and exchanges be supported?"],
      restaurant: ["Do you need table management and kitchen routing?", "Should split bills or tips be supported?"],
      cafe: ["Do you need quick order entry and combo items?", "Should queue or pickup workflows be included?"],
      service: ["Do you need service tickets and appointment checkout?", "Should deposits or invoicing be supported?"]
    },
    brief_base: {
      flows: ["register checkout", "receipt issuance", "inventory or menu sync", "shift close", "admin reporting"],
      system: ["durable transaction state", "offline sync hooks", "role-based terminals", "audit-friendly cash handling"],
      data: ["items", "transactions", "receipts", "staff", "shifts"]
    },
    brief_modes: {
      retail: { flows: ["barcode checkout", "returns", "stock sync"], system: ["retail terminal support"], data: ["barcodes", "returns"] },
      restaurant: { flows: ["table service", "kitchen routing", "split bills"], system: ["restaurant table operations"], data: ["tables", "tickets"] },
      cafe: { flows: ["quick order", "pickup queue", "combo items"], system: ["fast service orders"], data: ["orders", "pickup slots"] },
      service: { flows: ["service ticket", "deposit checkout", "invoice"], system: ["service billing"], data: ["tickets", "deposits"] }
    },
    base_pages: [
      { page_id: "register", purpose: "Checkout and transaction screen" },
      { page_id: "catalog", purpose: "Items or menu lookup" },
      { page_id: "receipts", purpose: "Receipts and transaction history" },
      { page_id: "shifts", purpose: "Shift management and closing" },
      { page_id: "admin", purpose: "Inventory and terminal administration" }
    ],
    mode_pages: {
      retail: [{ page_id: "returns", purpose: "Returns and exchanges" }],
      restaurant: [{ page_id: "tables", purpose: "Table management and kitchen routing" }],
      cafe: [{ page_id: "queue", purpose: "Order queue and pickup flow" }],
      service: [{ page_id: "service_tickets", purpose: "Service tickets and billing" }]
    },
    base_modules: [
      { module_id: "transactions", title: "Transactions", purpose: "Record sales and refunds.", workstreams: ["backend", "admin"] },
      { module_id: "catalog", title: "Catalog", purpose: "Products, menu items, or services.", workstreams: ["backend", "admin"] },
      { module_id: "payments", title: "Payments", purpose: "Cash and card handling.", workstreams: ["backend", "integration"] },
      { module_id: "inventory", title: "Inventory", purpose: "Stock or menu sync.", workstreams: ["backend", "admin"] },
      { module_id: "reports", title: "Reports", purpose: "Shift and sales reporting.", workstreams: ["admin", "backend"] }
    ],
    mode_modules: {
      retail: [{ module_id: "returns", title: "Returns", purpose: "Returns and exchanges.", workstreams: ["backend", "admin"] }],
      restaurant: [{ module_id: "tables", title: "Tables", purpose: "Table management and kitchen routing.", workstreams: ["backend", "admin"] }],
      cafe: [{ module_id: "queue", title: "Queue", purpose: "Pickup queue and quick orders.", workstreams: ["backend", "public_frontend"] }],
      service: [{ module_id: "service_tickets", title: "Service tickets", purpose: "Service tickets and deposit checkout.", workstreams: ["backend", "admin"] }]
    }
  }
};
