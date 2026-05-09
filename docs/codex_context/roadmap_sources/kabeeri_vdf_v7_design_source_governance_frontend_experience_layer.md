# Kabeeri VDF v7.0.0

## Design Source Governance and Frontend Experience Layer

حل مشكلة UI/UX وكارثة الفرونت إند في الفايب كودينج من خلال تحويل أي مصدر تصميم إلى مواصفات نصية معتمدة قبل تنفيذ Codex أو أي AI Coding Agent.

---

## معلومات الملف

| Item | Description |
|---|---|
| Project | Kabeeri-vdf |
| Version | v7.0.0 |
| Update title | Design Source Governance and Frontend Experience Layer |
| Main problem | AI coding agents are usually stronger in backend than frontend, and may create inconsistent UI when no design system, page specs, or approved visual rules exist. |
| Main solution | Kabeeri must treat any visual source as an input that must be converted into approved text specs before frontend implementation. |
| Primary rule | Codex implements approved UI contracts. Codex does not invent UI. |
| Source of truth | Approved Design Source + Approved Text Spec + Design Tokens + Page Specs + Component Contracts |
| Intended use | Roadmap source document for Codex / AI agents, GitHub milestones, GitHub issues, and Kabeeri implementation planning. |

---

# 1. الهدف من v7.0.0

هدف v7.0.0 هو منع العشوائية في تطوير الواجهات مع أدوات الذكاء الاصطناعي مثل Codex وCopilot وCursor وWindsurf، خصوصًا عندما تكون مصادر التصميم غير منظمة أو غير نصية مثل:

- Figma
- PDF
- Images
- Screenshots
- Google Drive files
- Adobe XD
- Sketch
- Penpot
- Canva
- Framer
- Webflow
- Reference websites
- Wireframes
- Hand-drawn sketches
- Text-only briefs

v7 لا يجعل Kabeeri مصممًا بصريًا كاملًا، ولا يدّعي أن Kabeeri كملفات فقط يستطيع تحليل الصور أو ملفات PDF تلقائيًا. بدلًا من ذلك، v7 يضع **نظام حوكمة تصميم** يحوّل أي مصدر تصميم إلى مواصفات نصية قابلة للتنفيذ، ثم يسمح لـ Codex أو أي AI agent بتنفيذ الواجهة من هذه المواصفات فقط.

---

# 2. المشكلة التي يحلها v7

مع الفايب كودينج، أصبح بعض المطورين يطلبون من AI تنفيذ الواجهة مباشرة:

```text
اعمل Dashboard احترافية
اعمل الصفحة زي الصورة دي
نفذ التصميم الموجود في PDF
اعمل موقع شبه الموقع ده
```

هذا يؤدي إلى مشاكل خطيرة:

- AI يخترع ألوانًا جديدة.
- AI يغير الهوية البصرية.
- AI ينشئ أكثر من شكل لنفس الزر أو الكارت.
- AI ينسى حالات loading / empty / error.
- AI يخلط بين public frontend وadmin frontend.
- AI لا يعرف هل التصميم نهائي أم مجرد إلهام.
- AI ينسخ من مواقع مرجعية بطريقة غير آمنة.
- AI يستهلك توكنات كثيرة في محاولة فهم بصري غير منضبط.
- العميل يرفض الواجهة لأنها لا تطابق التصميم.

الحل هو:

```text
Design Source
→ Text Spec
→ Human Approval
→ Page Specs
→ Component Contracts
→ Frontend Tasks
→ AI Implementation
→ Visual Acceptance
→ Owner / Client Verify
```

---

# 3. المبادئ الحاكمة

## 3.1 Codex is not the design source of truth

```text
Codex is not the design source of truth.
Codex implements approved UI specs.
```

بالعربي:

```text
كودكس ليس مصدر الحقيقة التصميمي.
كودكس ينفذ مواصفات واجهة معتمدة.
```

## 3.2 لا تنفيذ من صور أو PDF مباشرة

```text
Do not implement frontend directly from raw images, PDFs, links, or reference websites.
Always convert design sources into approved text specs first.
```

بالعربي:

```text
ممنوع تنفيذ الواجهة مباشرة من صور أو PDF أو روابط.
يجب تحويل مصدر التصميم إلى مواصفات نصية معتمدة أولًا.
```

## 3.3 مصادر التصميم ليست مواصفات تنفيذ

```text
Links are not specs.
Images are not specs.
PDFs are not specs.
Reference websites are not specs.
They are design sources that must be converted into specs.
```

## 3.4 المواقع المرجعية للإلهام فقط

```text
Reference websites are inspiration sources, not copy sources.
```

بالعربي:

```text
المواقع المرجعية مصدر إلهام، وليست مصدر نسخ.
```

## 3.5 الهوية البصرية لا تُخترع أثناء التنفيذ

```text
AI must not invent a new visual identity during frontend implementation.
```

## 3.6 كل صفحة تحتاج Page Spec

أي صفحة Frontend حقيقية يجب أن يكون لها Page Spec قبل التنفيذ.

## 3.7 كل مكوّن متكرر يحتاج Component Contract

أي component متكرر مثل Button, Card, Table, Modal, Form Field يجب أن يكون له عقد واضح.

## 3.8 UI لا تُقبل بالكود فقط

أي Frontend Task تحتاج Visual Acceptance قبل Owner / Client Verify.

---

# 4. المصطلحات الأساسية

| Term | Definition |
|---|---|
| Design Source | أي مصدر بصري أو وصفي يستخدم لفهم تصميم الواجهة. |
| Approved Design Source | مصدر تصميم تم اعتماده من Owner أو Client أو Reviewer. |
| Design Source Snapshot | نسخة محفوظة أو موثقة من مصدر التصميم عند لحظة الاعتماد. |
| Text Spec | مواصفات نصية مستخرجة من مصدر التصميم. |
| Page Spec | ملف يصف صفحة واحدة: الهدف، المستخدم، الأقسام، البيانات، الحالات، القبول. |
| Component Contract | عقد يصف مكوّن UI: variants, states, rules, accessibility. |
| Design Tokens | ملف يحدد الألوان، الخطوط، المسافات، الظلال، radius، breakpoints. |
| Visual Acceptance | مراجعة بصرية تقارن التنفيذ بالمواصفات ومصدر التصميم المعتمد. |
| Manual Spec Mode | المطور يحول التصميم إلى مواصفات يدويًا. |
| Assisted Spec Mode | أداة AI Vision أو ChatGPT تساعد في استخراج Draft Spec ثم يراجعها إنسان. |
| Automated Spec Mode | مستقبلًا، CLI/Extension/Cloud يستخرج Draft Spec آليًا. |
| Reference Website | موقع يعجب العميل ويستخدم للإلهام فقط، لا للنسخ. |
| Missing Design Report | تقرير يوضح النواقص في التصميم قبل التنفيذ. |

---

# 5. العلاقة مع تحديثات Kabeeri السابقة

| Version | Relationship to v7 |
|---|---|
| v1 | يوفر Structured Delivery Foundation الذي يضمن أن التطوير يبدأ من ملفات وأسئلة وتاسكات وقبول. |
| v2 | يضيف Delivery Modes وProject Intake وTask Governance وTask Provenance، وهي ضرورية لتتبع مصدر Frontend Tasks. |
| v3 | يضيف Dashboard وVS Code وOwner Verify وAI Token Cost Analytics، وهي ضرورية لعرض تقدم UI وتكلفته. |
| v4 | يضيف Multi-AI Governance وLocks وAccess Tokens، وهي ضرورية لمنع تداخل أكثر من AI Developer في ملفات الواجهة. |
| v5 | يضيف Adaptive Questionnaire Flow وSystem Capability Map، وهي الأساس لتوليد أسئلة UI/UX المناسبة فقط. |
| v6 | يضيف Vibe-first UX، ويمنع Kabeeri من أن يكون CLI-heavy، ويجعل التفاعل مع UI Tasks أكثر إنسانية. |
| v7 | يضيف Design Source Governance وFrontend Experience Layer، ويمنع AI من تخريب الواجهة. |

---

# 6. Design Source Governance Pipeline

هذا هو التدفق الرسمي في v7:

```text
1. Design Source Intake
2. Source Snapshot
3. Source Type Classification
4. Extraction Method Selection
5. Draft Text Spec
6. Missing Design Report
7. Human Review
8. Approved Text Spec
9. Design Tokens
10. Page Specs
11. Component Contracts
12. Frontend Tasks
13. Codex Frontend Context Pack
14. AI Implementation
15. Visual Acceptance
16. Owner / Client Verify
```

## 6.1 Design Source Intake

Kabeeri يسجل مصدر التصميم ونوعه وحالته.

## 6.2 Source Snapshot

إذا كان المصدر رابطًا خارجيًا مثل Google Drive أو Figma أو Webflow، يجب تسجيل نسخة أو مرجع إصدار معتمد.

## 6.3 Source Type Classification

Kabeeri يحدد نوع المصدر:

- figma
- pdf
- image
- screenshot
- google_drive_file
- adobe_xd
- sketch
- penpot
- canva
- framer
- webflow
- reference_website
- wireframe
- hand_drawn_sketch
- text_brief
- other

## 6.4 Extraction Method Selection

| Source Type | Extraction Method |
|---|---|
| Figma with Dev Mode | Manual or adapter-assisted extraction |
| PDF | Manual or assisted visual extraction |
| Images / Screenshots | Manual or assisted visual extraction |
| Google Drive file | Create approved snapshot first, then extract |
| Reference websites | Inspiration notes only, no direct copying |
| Wireframe | Structure only, needs visual style questions |
| Text brief | Generate design direction and specs from answers |

## 6.5 Draft Text Spec

أي استخراج من تصميم بصري ينتج Draft Spec فقط.

```text
AI-extracted specs are drafts until a human approves them.
```

## 6.6 Human Review

المطور أو المصمم أو Owner يراجع المواصفات ويعتمدها.

## 6.7 Approved Text Spec

بعد الاعتماد، تصبح المواصفات النصية مصدر التنفيذ.

## 6.8 Codex Implementation

Codex ينفذ من:

- Approved Text Spec
- Design Tokens
- Page Specs
- Component Contracts
- UI Acceptance Checklist
- Allowed files
- Forbidden files

---

# 7. Design Source Types

## 7.1 Figma

Figma يعتبر مصدر تصميم تفاعلي قوي إذا كان يحتوي على:

- Frames
- Components
- Styles
- Design tokens أو variables
- Desktop / mobile frames
- Prototype flows
- Dev Mode notes

لكن حتى مع Figma، لا يبدأ Codex مباشرة. يجب تحويله إلى Page Specs وComponent Contracts.

## 7.2 PDF

PDF يعتبر Static Design Source. يحتاج استخراج يدوي أو مساعد.

قيود PDF:

- لا يحتوي غالبًا على component metadata.
- لا يوضح responsive behavior.
- قد لا يحتوي على states.
- قد يكون التصميم مجرد عرض وليس تنفيذًا.

## 7.3 Images / Screenshots

الصور مصدر بصري ثابت. لا تكفي وحدها للتنفيذ.

يجب استخراج:

- Page purpose
- Sections
- Layout
- Visual hierarchy
- Components
- Colors
- Missing states
- Responsive assumptions

## 7.4 Google Drive / Dropbox / External Links

الرابط ليس مواصفة تنفيذ. يجب تسجيله كمصدر خارجي ثم إنشاء Snapshot أو approved version.

القاعدة:

```text
External links are references.
Approved local snapshots or approved version records are implementation sources.
```

## 7.5 Adobe XD / Sketch / Penpot / Canva / Framer / Webflow

هذه أدوات تصميم أو بناء بصري. Kabeeri يتعامل معها عبر Design Source Adapter قواعديًا.

## 7.6 Reference Websites

مواقع للإلهام فقط.

ممنوع:

- نسخ الشعار.
- نسخ النصوص.
- نسخ الصور.
- نسخ layout pixel-by-pixel.
- نسخ الألوان المطابقة إن لم يكن العميل يملكها.

مسموح:

- فهم نوع التجربة.
- فهم ترتيب الأقسام بشكل عام.
- استلهام نوع الكروت أو طريقة عرض المعلومات دون نسخ مباشر.

## 7.7 Wireframes / Sketches

تحدد الهيكل فقط، ولا تحدد الهوية البصرية كاملة.

## 7.8 Text Brief Only

إذا لا يوجد تصميم، Kabeeri يستخدم Adaptive UI/UX Questionnaire لتوليد:

- Brand direction
- Design tokens
- Page specs
- Component contracts

---

# 8. Modes داخل v7

## 8.1 Manual Spec Mode

المطور أو المصمم يراجع مصدر التصميم ويملأ القوالب يدويًا.

مناسب الآن لأن Kabeeri كملفات لا يمتلك رؤية آلية.

## 8.2 Assisted Spec Mode

يستخدم المستخدم ChatGPT أو أداة Vision لاستخراج Draft Spec من PDF أو الصور، ثم يراجعها إنسان.

القواعد:

- الناتج Draft فقط.
- يجب مراجعته.
- لا يستخدم مباشرة مع Codex.

## 8.3 Automated Spec Mode

مستقبليًا، CLI أو VS Code Extension أو Cloud يستطيع استخراج Draft Spec من مصادر التصميم.

القواعد:

- يظل الناتج Draft.
- يحتاج Human Review.
- لا يبدأ التنفيذ قبل الاعتماد.

## 8.4 Figma-first Mode

لو Figma كامل ومعتمد، يتم تحويله إلى Design Tokens وPage Specs وComponent Contracts.

## 8.5 Figma-lite Mode

لو Figma ناقص أو Wireframe فقط، Kabeeri يكمل النواقص بأسئلة UI/UX.

## 8.6 No-Figma Guarded Mode

لو لا يوجد Figma، يستخدم Kabeeri Design System وQuestionnaire لتوليد المواصفات.

## 8.7 Reference Inspiration Mode

لو العميل لديه مواقع تعجبه، يتم استخراج inspiration notes فقط ثم توليد تصميم أصلي.

---

# 9. هيكل الملفات المقترح

```text
design_sources/
├── README.md
├── DESIGN_SOURCE_TO_TEXT_SPEC_RULES.md
├── DESIGN_SOURCE_TYPES.md
├── DESIGN_SOURCE_INTAKE_TEMPLATE.md
├── DESIGN_SOURCE_MAPPING_TEMPLATE.md
├── SOURCE_SNAPSHOT_RULES.md
├── MISSING_DESIGN_REPORT_TEMPLATE.md
├── DESIGN_CHANGE_REQUEST_TEMPLATE.md
├── DESIGN_IMPLEMENTATION_MODES.md
├── DESIGN_CLIENT_APPROVAL_RULES.md
├── REFERENCE_WEBSITE_INSPIRATION_RULES.md
├── DO_NOT_COPY_RULES.md
├── adapters/
│   ├── FIGMA_ADAPTER_RULES.md
│   ├── PDF_IMAGE_ADAPTER_RULES.md
│   ├── WEBSITE_REFERENCE_ADAPTER_RULES.md
│   ├── ADOBE_XD_ADAPTER_RULES.md
│   ├── SKETCH_ADAPTER_RULES.md
│   ├── PENPOT_ADAPTER_RULES.md
│   ├── CANVA_ADAPTER_RULES.md
│   ├── FRAMER_WEBFLOW_ADAPTER_RULES.md
│   └── GENERIC_DESIGN_SOURCE_ADAPTER.md
└── sources/
    ├── figma/
    ├── pdf/
    ├── images/
    ├── screenshots/
    ├── google_drive/
    ├── reference_websites/
    ├── wireframes/
    └── other/

design_system/
├── README.md
├── BRAND_IDENTITY.md
├── DESIGN_TOKENS_TEMPLATE.json
├── DESIGN_TOKENS.json
├── TYPOGRAPHY.md
├── COLOR_SYSTEM.md
├── SPACING_SYSTEM.md
├── RADIUS_AND_SHADOWS.md
├── COMPONENT_RULES.md
├── PAGE_LAYOUT_RULES.md
├── RESPONSIVE_RULES.md
├── ACCESSIBILITY_RULES.md
├── UI_ACCEPTANCE_CHECKLIST.md
├── VISUAL_QA_CHECKLIST.md
└── CODEX_FRONTEND_PROMPT_RULES.md

frontend_specs/
├── README.md
├── PAGE_SPEC_TEMPLATE.md
├── COMPONENT_CONTRACT_TEMPLATE.md
├── public/
├── user/
├── admin/
├── internal/
└── shared/

.kabeeri/design/
├── design_sources.jsonl
├── approved_sources.json
├── source_snapshots.json
├── design_decisions.jsonl
├── missing_design_reports.jsonl
├── visual_acceptance_results.jsonl
└── design_change_requests.jsonl
```

---

# 10. Design Source Intake Template

```md
# Design Source Intake

## Source Identity
- Source ID:
- Source type:
- Source name:
- Provided by:
- Provided date:
- External URL if any:
- Local snapshot path if any:
- Approved version:
- Approved by:
- Status: draft / under_review / approved / rejected / replaced

## Source Contents
- Public pages:
- User portal pages:
- Admin pages:
- Internal pages:
- Components:
- Design system:
- Mobile screens:
- Tablet screens:
- Desktop screens:

## Limitations
- Missing mobile:
- Missing states:
- Missing components:
- Missing flows:
- Missing accessibility:
- Missing RTL:

## Extraction Mode
- manual_spec
- assisted_spec
- automated_spec_future

## Approval
- Reviewed by:
- Approved by:
- Approval date:
- Notes:
```

---

# 11. Page Spec Template

```md
# Page Spec

## Page Identity
- Page ID:
- Page name:
- Frontend area: public / user / admin / internal
- Source design reference:
- Status: draft / approved / implemented / accepted

## Purpose
Describe what this page is for.

## Users
Who can access this page?

## Layout
- Header:
- Sidebar:
- Main content:
- Footer:
- Sections:

## Components
- Component 1:
- Component 2:
- Component 3:

## Data Needed
- Data item 1:
- Data item 2:

## States Required
- Default state:
- Loading state:
- Empty state:
- Error state:
- Validation state:
- Success state:
- Permission denied state:

## Responsive Rules
- Desktop:
- Tablet:
- Mobile:

## Accessibility Rules
- Keyboard navigation:
- ARIA labels:
- Color contrast:
- Focus states:

## Visual Rules
- Use design_system/DESIGN_TOKENS.json
- Do not invent new colors.
- Do not invent new layout.
- Use approved components.

## Acceptance Criteria
- [ ] Matches approved Page Spec.
- [ ] Uses Design Tokens only.
- [ ] Includes required states.
- [ ] Responsive behavior works.
- [ ] Basic accessibility is respected.
- [ ] No unrelated files changed.
```

---

# 12. Component Contract Template

```md
# Component Contract

## Component Identity
- Component name:
- Component type:
- Used in:
- Source reference:

## Purpose
Describe what this component does.

## Variants
- default
- primary
- secondary
- danger
- ghost

## Sizes
- sm
- md
- lg

## States
- default
- hover
- active
- disabled
- loading
- error
- success

## Design Rules
- Use design tokens only.
- Do not create one-off styles.
- Do not introduce new colors.
- Must support RTL if project requires RTL.

## Accessibility Rules
- Keyboard accessible.
- Visible focus state.
- Clear labels.

## Acceptance Criteria
- [ ] All required variants exist.
- [ ] All required states exist.
- [ ] Uses design tokens.
- [ ] Does not duplicate existing component.
```

---

# 13. Design Tokens

## 13.1 Purpose

Design Tokens are the visual contract for the project.

They define:

- Colors
- Typography
- Spacing
- Radius
- Shadows
- Breakpoints
- Z-index
- Layout widths
- Component primitives

## 13.2 Example

```json
{
  "brand": {
    "name": "Project Name",
    "style": "modern, clean, trustworthy",
    "tone": "simple and professional"
  },
  "colors": {
    "primary": "#2563EB",
    "secondary": "#64748B",
    "accent": "#F59E0B",
    "background": "#FFFFFF",
    "surface": "#F8FAFC",
    "text": "#111827",
    "mutedText": "#6B7280",
    "success": "#16A34A",
    "warning": "#F59E0B",
    "danger": "#DC2626",
    "info": "#0EA5E9"
  },
  "typography": {
    "fontFamily": "Inter, system-ui, sans-serif",
    "arabicFontFamily": "Cairo, system-ui, sans-serif",
    "baseSize": "16px",
    "headingWeight": 700,
    "bodyWeight": 400
  },
  "radius": {
    "sm": "6px",
    "md": "10px",
    "lg": "16px",
    "xl": "24px"
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px"
  },
  "breakpoints": {
    "sm": "640px",
    "md": "768px",
    "lg": "1024px",
    "xl": "1280px"
  },
  "theme": {
    "supportsDarkMode": true,
    "supportsRTL": true
  }
}
```

---

# 14. Adaptive UI/UX Questionnaire Integration

v7 يجب أن يتصل بمحرك أسئلة v5.

## 14.1 UI Entry Questions

```text
هل يوجد واجهة خارجية للزوار؟
هل يوجد User Portal؟
هل يوجد Admin Dashboard؟
هل يوجد Staff/Internal Dashboard؟
هل يوجد Mobile App؟
هل الواجهة عربية فقط، إنجليزية فقط، أم الاثنين؟
هل تحتاج RTL؟
هل يوجد مصدر تصميم جاهز؟
ما نوع مصدر التصميم؟
هل توجد هوية بصرية جاهزة؟
```

## 14.2 Design Source Questions

```text
هل يوجد Figma؟
هل التصميم PDF؟
هل التصميم صور؟
هل التصميم على Google Drive؟
هل يوجد موقع مرجعي تريد الاستلهام منه؟
هل التصميم نهائي أم Draft؟
هل العميل وافق على التصميم؟
هل يوجد Mobile design؟
هل توجد Loading / Empty / Error states؟
```

## 14.3 Brand Identity Questions

```text
ما اسم المشروع؟
ما الانطباع المطلوب؟ رسمي، عصري، بسيط، فاخر، طبي، تعليمي؟
ما الألوان المفضلة؟
هل يوجد ألوان ممنوعة؟
هل يوجد شعار؟
هل تحتاج favicon؟
هل تحتاج Dark Mode؟
هل تريد التحكم في الألوان من لوحة الإدارة؟
```

## 14.4 Theme Questions

```text
هل الأدمن يستطيع تغيير اللون الأساسي؟
هل الأدمن يستطيع تغيير اللون الثانوي؟
هل الأدمن يستطيع تغيير لون الأزرار؟
هل تغيير الألوان عام لكل النظام أم لكل Tenant؟
هل يجب منع الألوان ضعيفة التباين؟
هل يتم تسجيل تغييرات الثيم في Audit Log؟
هل يمكن استرجاع الثيم الافتراضي؟
```

## 14.5 Public Frontend Questions

```text
ما الصفحات العامة المطلوبة؟
ما الهدف من الصفحة الرئيسية؟
ما أهم CTA؟
هل تحتاج SEO؟
هل تحتاج نموذج تواصل؟
هل تحتاج Landing Page واحدة أم موقع كامل؟
```

## 14.6 Admin Dashboard Questions

```text
ما الذي يجب أن يراه الأدمن أولًا؟
ما أهم الإحصائيات؟
ما الجداول المطلوبة؟
ما الإجراءات السريعة؟
هل يوجد Pending approvals؟
هل يوجد Recent activity؟
هل توجد Widgets قابلة للإخفاء والترتيب؟
ما الإجراءات Owner-only؟
```

## 14.7 Component System Questions

```text
ما المكونات المشتركة المطلوبة؟
هل الجداول تحتاج Filters؟
هل النماذج تحتاج Validation UI؟
هل تحتاج Empty states؟
هل تحتاج Loading states؟
هل تحتاج Error states؟
```

## 14.8 Responsive and Accessibility Questions

```text
هل يجب دعم الموبايل؟
ما أقل عرض شاشة مهم؟
هل Dashboard يجب أن يعمل على الموبايل؟
هل يجب التحقق من تباين الألوان؟
هل يجب دعم keyboard navigation؟
هل يجب دعم screen readers؟
```

---

# 15. تحويل الإجابات إلى مخرجات

كل إجابة UI/UX يجب أن تتحول إلى واحد أو أكثر من:

```text
Design Decision
Design Token
Page Spec
Component Contract
Frontend Task
Codex Prompt
Visual Acceptance Criteria
```

مثال:

```json
{
  "question_id": "Q-THEME-004",
  "answer_id": "A-THEME-004",
  "area_id": "THEME_BRANDING",
  "answer": "Admin should control primary and secondary colors from the dashboard.",
  "source_mode": "direct",
  "outputs": [
    "design_system/DESIGN_TOKENS.json",
    "frontend_specs/admin/theme_settings_page.spec.md"
  ],
  "suggested_tasks": [
    "THEME-001",
    "THEME-002"
  ]
}
```

---

# 16. Frontend Task Rules

أي Frontend Task يجب أن تحتوي على:

- task_id
- title
- workstream
- frontend area
- source type
- source reference
- page spec
- component contracts
- design tokens
- allowed files
- forbidden files
- acceptance criteria
- visual acceptance checklist
- reviewer
- owner/client verify requirement

مثال:

```json
{
  "task_id": "UI-ADMIN-001",
  "title": "[Admin Frontend] Implement dashboard overview page",
  "workstream": "admin_frontend",
  "source_type": "approved_text_spec",
  "source_area": "ADMIN_DASHBOARD",
  "required_specs": [
    "frontend_specs/admin/dashboard_page.spec.md",
    "design_system/DESIGN_TOKENS.json",
    "design_system/COMPONENT_RULES.md"
  ],
  "acceptance_checklist": "design_system/UI_ACCEPTANCE_CHECKLIST.md"
}
```

---

# 17. Codex Frontend Prompt Template

```text
You are implementing a frontend task for Kabeeri-vdf.

Task:
[Task title]

You must follow:
- design_system/DESIGN_TOKENS.json
- design_system/PAGE_LAYOUT_RULES.md
- design_system/COMPONENT_RULES.md
- frontend_specs/[area]/[page].spec.md
- design_system/UI_ACCEPTANCE_CHECKLIST.md

Design source:
[Approved design source or approved text spec]

Allowed files:
- [allowed path 1]
- [allowed path 2]

Forbidden files:
- Do not change backend files.
- Do not change authentication logic.
- Do not invent new colors.
- Do not create a new visual identity.
- Do not modify unrelated pages.
- Do not implement from raw PDF/image/link directly.

UI rules:
- Use existing components where possible.
- Use design tokens only.
- Add loading, empty, and error states.
- Ensure responsive layout.
- Ensure accessibility basics.
- Support RTL if required.

Output required:
- Summary
- Files changed
- Components added/modified
- Design rules followed
- Screens/states implemented
- Known limitations
- Visual acceptance notes
```

---

# 18. Visual Acceptance Checklist

أي صفحة لا تُقبل إلا إذا تحققت النقاط التالية:

```text
- Matches approved Page Spec.
- Uses Design Tokens only.
- Does not invent new colors.
- Does not invent new layout.
- Uses approved components or documented new components.
- Includes loading state.
- Includes empty state.
- Includes error state.
- Includes validation state when forms exist.
- Responsive behavior is defined and implemented.
- RTL behavior is respected when required.
- Accessibility basics are respected.
- No unrelated files changed.
- No backend logic changed unless task allows it.
- Visual QA completed.
- Owner / Client verify completed when required.
```

---

# 19. Missing Design Report

إذا كان التصميم ناقصًا، لا يجب أن يخمن Codex. يجب إنشاء Missing Design Report.

```md
# Missing Design Report

## Source
- Source ID:
- Source type:
- Source reference:

## Missing Pages
- Page 1:
- Page 2:

## Missing States
- Loading:
- Empty:
- Error:
- Validation:
- Success:
- Permission denied:

## Missing Responsive Designs
- Mobile:
- Tablet:

## Missing Accessibility Decisions
- Contrast:
- Keyboard:
- Screen readers:

## Missing Branding Decisions
- Colors:
- Typography:
- Logo:
- Dark mode:

## Questions for Owner / Client
1.
2.
3.

## Decision
- Continue with assumptions? yes/no
- Require client answer? yes/no
- Defer missing parts? yes/no
```

---

# 20. Reference Website Inspiration Workflow

لو العميل أعطى مواقع يريد أن يعمل مثلها:

```text
Reference websites
→ Ask what client likes
→ Inspiration notes
→ Do-not-copy rules
→ Original design direction
→ Design tokens
→ Page specs
→ Component contracts
```

## أسئلة العميل

```text
ما المواقع التي تعجبك؟
ما الذي يعجبك فيها؟
الألوان؟ الكروت؟ ترتيب الصفحة؟ طريقة عرض الأسعار؟ البساطة؟
ما الذي لا تريد نسخه؟
ما هو الاختلاف المطلوب؟
هل لديك ألوان وهوية خاصة؟
هل تريد تشابه في الإحساس فقط أم في البنية؟
```

## Do Not Copy Rules

```text
- Do not copy logos.
- Do not copy images.
- Do not copy exact text/content.
- Do not copy exact layout pixel-by-pixel.
- Do not copy brand colors exactly unless client owns them.
- Use references only to understand style, structure, and user expectations.
```

---

# 21. Admin-Controlled Theme and Branding

هذا جزء أساسي من v7.

## يجب أن يدعم Kabeeri:

- Logo
- Favicon
- Primary color
- Secondary color
- Accent color
- Button colors
- Sidebar colors
- Header colors
- Light mode
- Dark mode
- Font family
- Border radius
- Safe custom CSS if allowed

## قواعد الأمان

```text
- Do not allow low-contrast colors.
- Do not allow hiding security or owner-only actions.
- Do not allow unsafe CSS.
- Do not break RTL.
- Log all theme changes in audit log.
- Allow restoring default theme.
```

---

# 22. Dashboard UX Governance

لو النظام يحتوي Dashboard، يجب توثيق:

- Dashboard types
- Widgets
- Role-based visibility
- Owner-only actions
- Live refresh
- Filters
- Export
- Responsive behavior
- Empty states
- Error states

## Dashboard Types

- Owner dashboard
- Admin dashboard
- Developer dashboard
- Business dashboard
- Technical dashboard
- Client dashboard

## Dashboard Questions

```text
ما أنواع الداشبورد المطلوبة؟
من يرى كل Dashboard؟
ما Widgets المطلوبة؟
هل يمكن ترتيب Widgets؟
هل يمكن إخفاء Widgets؟
هل يوجد Live refresh؟
هل يوجد Export؟
ما الإجراءات Owner-only؟
```

---

# 23. Labels المقترحة

| Label | Description | Color |
|---|---|---|
| design-source | Design source intake, snapshots, and source governance | #1D76DB |
| design-system | Design tokens, typography, colors, spacing, components | #5319E7 |
| frontend-specs | Page specs and component contracts | #0075CA |
| visual-qa | Visual acceptance and UI QA | #D93F0B |
| ui-ux | UX/UI planning and execution rules | #FBCA04 |
| frontend-governance | Frontend task rules and implementation constraints | #0E8A16 |
| reference-sites | Inspiration website workflow and do-not-copy rules | #7057FF |
| admin-theme | Admin-controlled branding and theme settings | #C5DEF5 |
| dashboard-ux | Dashboard layout, widgets, and UX governance | #0075CA |
| accessibility | Accessibility, contrast, keyboard, RTL/LTR | #7057FF |
| priority-high | Important work that should be handled early | #B60205 |
| priority-medium | Useful work planned for the current or upcoming milestone | #FBCA04 |
| good-first-issue | Suitable for simple first contributions | #7057FF |

---

# 24. Milestones المقترحة داخل v7.0.0

| Milestone | Title | Goal | Issues |
|---|---|---|---|
| v7.1.0 | Design Source Intake and Adapters | Support Figma, PDF, images, Drive files, design tools, reference websites, and text briefs as design inputs. | 7 |
| v7.2.0 | Design System Foundation | Establish design tokens, visual identity, typography, spacing, component rules, and accessibility basics. | 7 |
| v7.3.0 | Adaptive UI/UX Questionnaire | Connect v7 to the adaptive questionnaire engine so UI questions open only when relevant. | 7 |
| v7.4.0 | Page Specs and Component Contracts | Require every frontend page and repeated component to have approved implementation specs. | 7 |
| v7.5.0 | Design Source to Text Spec Pipeline | Convert raw visual sources into approved text specs before AI implementation. | 7 |
| v7.6.0 | Frontend AI Execution Rules | Make Codex and AI agents implement UI contracts without inventing visual identity. | 7 |
| v7.7.0 | Visual Acceptance and UI QA | Add visual review and acceptance rules before owner/client verify. | 7 |
| v7.8.0 | Admin-Controlled Theme and Branding | Support safe admin-managed colors, theme, branding, and design tokens. | 7 |
| v7.9.0 | Dashboard UX Governance | Organize dashboard pages, widgets, permissions, live state, and role-based views. | 7 |
| v7.10.0 | Stable Frontend Experience Release | Finalize v7 as a stable layer for frontend governance and AI-safe UI implementation. | 6 |

---

# 25. v7.1.0 — Design Source Intake and Adapters

Milestone description: Support multiple design sources and avoid tying Kabeeri only to Figma.

## Issue 1: Add design source intake system

Labels: design-source, priority-high

Scope:
- Create design_sources/README.md.
- Define approved design source concept.
- Define source status: draft, under_review, approved, rejected, replaced.
- Explain that raw sources are not specs.

Acceptance criteria:
- design_sources/ exists.
- Approved Design Source is documented.
- Raw PDF/images/links are not treated as implementation specs.

## Issue 2: Add design source types

Labels: design-source, docs, priority-high

Scope:
- Create DESIGN_SOURCE_TYPES.md.
- Support figma, pdf, image, screenshot, google_drive_file, adobe_xd, sketch, penpot, canva, framer, webflow, reference_website, wireframe, text_brief, other.

Acceptance criteria:
- All source types are documented.
- Each type has limitations and recommended handling.

## Issue 3: Add design source intake template

Labels: design-source, priority-high

Scope:
- Create DESIGN_SOURCE_INTAKE_TEMPLATE.md.
- Include source identity, status, contents, limitations, extraction mode, approval.

Acceptance criteria:
- Template exists.
- It can be used by a human before AI execution.

## Issue 4: Add source snapshot rules

Labels: design-source, priority-medium

Scope:
- Create SOURCE_SNAPSHOT_RULES.md.
- Define approved version for external links.
- Require local snapshot or approved version record for Drive/Figma/Webflow/Framer when possible.

Acceptance criteria:
- External links are not treated as stable specs.
- Changes after approval require change request.

## Issue 5: Add design source adapters

Labels: design-source, priority-high

Scope:
- Create adapters folder.
- Add adapter rules for Figma, PDF/images, reference websites, Adobe XD, Sketch, Penpot, Canva, Framer/Webflow, and generic sources.

Acceptance criteria:
- Adapter rules exist.
- Kabeeri is not Figma-only.

## Issue 6: Add design source confidence scoring

Labels: design-source, visual-qa, priority-medium

Scope:
- Define confidence: high, medium, low, incomplete, needs_review.
- Explain how confidence affects execution readiness.

Acceptance criteria:
- Confidence rules exist.
- Low-confidence sources require review before tasks.

## Issue 7: Add design client approval rules

Labels: design-source, visual-qa, priority-high

Scope:
- Create DESIGN_CLIENT_APPROVAL_RULES.md.
- Define who approves design sources, specs, changes, and visual acceptance.

Acceptance criteria:
- Design approval flow is documented.
- Owner/client verify is supported.

---

# 26. v7.2.0 — Design System Foundation

Milestone description: Establish the visual system that AI must follow.

## Issue 8: Add design system folder

Labels: design-system, priority-high

Scope:
- Create design_system/README.md.
- Explain design system role.
- Define that Design Tokens are the visual contract.

Acceptance criteria:
- design_system/ exists.
- Purpose is clear.

## Issue 9: Add design tokens template

Labels: design-system, priority-high

Scope:
- Create DESIGN_TOKENS_TEMPLATE.json.
- Include brand, colors, typography, radius, spacing, breakpoints, theme.

Acceptance criteria:
- Template exists and is valid JSON.
- Supports Arabic/RTL projects.

## Issue 10: Add typography rules

Labels: design-system, priority-medium

Scope:
- Create TYPOGRAPHY.md.
- Define font families, heading scale, body scale, Arabic font rules.

Acceptance criteria:
- Typography rules exist.
- Arabic and English are considered.

## Issue 11: Add color system rules

Labels: design-system, accessibility, priority-high

Scope:
- Create COLOR_SYSTEM.md.
- Define primary, secondary, accent, surface, text, success, warning, danger.
- Define contrast rules.

Acceptance criteria:
- Color rules exist.
- AI is forbidden from inventing random colors.

## Issue 12: Add spacing and layout rules

Labels: design-system, frontend-specs, priority-medium

Scope:
- Create SPACING_SYSTEM.md and PAGE_LAYOUT_RULES.md.
- Define page padding, card spacing, sections, grid, breakpoints.

Acceptance criteria:
- Layout rules are documented.
- Page specs can reference them.

## Issue 13: Add component rules

Labels: design-system, frontend-specs, priority-high

Scope:
- Create COMPONENT_RULES.md.
- Define shared component principles and reuse rules.

Acceptance criteria:
- Component rules exist.
- AI should not duplicate components unnecessarily.

## Issue 14: Add accessibility rules

Labels: accessibility, design-system, priority-high

Scope:
- Create ACCESSIBILITY_RULES.md.
- Include contrast, keyboard navigation, focus, labels, screen reader basics, RTL/LTR.

Acceptance criteria:
- Accessibility basics are documented.
- Visual acceptance can reference them.

---

# 27. v7.3.0 — Adaptive UI/UX Questionnaire

Milestone description: Connect frontend design governance to Kabeeri's adaptive questionnaire system.

## Issue 15: Add UI entry question group

Labels: ui-ux, priority-high

Scope:
- Create UI_ENTRY_QUESTIONS.md.
- Determine public frontend, user portal, admin dashboard, internal frontend, language, RTL, design source.

Acceptance criteria:
- Entry questions exist.
- Irrelevant UI groups can be skipped.

## Issue 16: Add design source question group

Labels: design-source, ui-ux, priority-high

Scope:
- Create DESIGN_SOURCE_QUESTIONS.md.
- Ask about Figma, PDF, images, links, reference websites, approval, completeness.

Acceptance criteria:
- Design source questions exist.
- Missing design can be detected.

## Issue 17: Add brand identity question group

Labels: design-system, ui-ux, priority-high

Scope:
- Create BRAND_IDENTITY_QUESTIONS.md.
- Ask about brand style, colors, logo, favicon, dark mode, admin control.

Acceptance criteria:
- Brand identity questions exist.
- Can generate design tokens.

## Issue 18: Add public frontend question group

Labels: ui-ux, frontend-specs, priority-medium

Scope:
- Create PUBLIC_FRONTEND_QUESTIONS.md.
- Ask about pages, CTA, SEO, contact forms, landing pages.

Acceptance criteria:
- Public frontend questions exist.
- Questions open only when public frontend is required.

## Issue 19: Add admin dashboard question group

Labels: dashboard-ux, ui-ux, priority-high

Scope:
- Create ADMIN_DASHBOARD_QUESTIONS.md.
- Ask about widgets, statistics, quick actions, approvals, owner-only actions.

Acceptance criteria:
- Dashboard questions exist.
- Can generate dashboard specs.

## Issue 20: Add component system question group

Labels: design-system, frontend-specs, priority-medium

Scope:
- Create COMPONENT_SYSTEM_QUESTIONS.md.
- Ask about buttons, cards, tables, modals, forms, loading/empty/error states.

Acceptance criteria:
- Component questions exist.
- Can generate component contracts.

## Issue 21: Add responsive and accessibility question group

Labels: accessibility, ui-ux, priority-high

Scope:
- Create RESPONSIVE_ACCESSIBILITY_QUESTIONS.md.
- Ask about mobile, tablet, dashboard mobile behavior, contrast, keyboard, screen readers.

Acceptance criteria:
- Responsive/accessibility questions exist.
- Required decisions can be captured.

---

# 28. v7.4.0 — Page Specs and Component Contracts

## Issue 22: Add page spec template

Labels: frontend-specs, priority-high

Scope:
- Create frontend_specs/PAGE_SPEC_TEMPLATE.md.
- Include purpose, users, layout, components, data, states, responsive, accessibility, acceptance.

Acceptance criteria:
- Template exists.
- Every frontend page can use it.

## Issue 23: Add component contract template

Labels: frontend-specs, design-system, priority-high

Scope:
- Create COMPONENT_CONTRACT_TEMPLATE.md.
- Include variants, sizes, states, design rules, accessibility, acceptance.

Acceptance criteria:
- Template exists.
- Components have consistent contracts.

## Issue 24: Add frontend area folders

Labels: frontend-specs, priority-medium

Scope:
- Create public/, user/, admin/, internal/, shared/ under frontend_specs/.

Acceptance criteria:
- Frontend specs are organized by area.
- Admin and public pages are separated.

## Issue 25: Add page-to-source mapping rules

Labels: design-source, frontend-specs, priority-high

Scope:
- Define how each page spec links to a design source, source frame, source image, or text brief.

Acceptance criteria:
- Every Page Spec can trace back to a source.

## Issue 26: Add required states rules

Labels: frontend-specs, visual-qa, priority-high

Scope:
- Define loading, empty, error, validation, success, permission denied states.

Acceptance criteria:
- Required states are documented.
- Missing states trigger Missing Design Report.

## Issue 27: Add data requirements section rules

Labels: frontend-specs, priority-medium

Scope:
- Define how page specs list needed backend/API data without implementing backend.

Acceptance criteria:
- Page specs can identify data dependencies.

## Issue 28: Add page spec approval rules

Labels: frontend-specs, visual-qa, priority-high

Scope:
- Define who approves Page Specs before Codex implementation.

Acceptance criteria:
- Page Specs cannot be used for execution before approval.

---

# 29. v7.5.0 — Design Source to Text Spec Pipeline

## Issue 29: Add design source to text spec rules

Labels: design-source, priority-high

Scope:
- Create DESIGN_SOURCE_TO_TEXT_SPEC_RULES.md.
- Define that raw sources must become approved text specs before implementation.

Acceptance criteria:
- Rule exists.
- Codex cannot implement from raw PDF/image/link directly.

## Issue 30: Add manual spec mode rules

Labels: design-source, priority-high

Scope:
- Create MANUAL_SPEC_MODE.md.
- Define how developer manually writes specs after reviewing design.

Acceptance criteria:
- Manual process exists.
- Suitable for file-only Kabeeri.

## Issue 31: Add assisted spec mode rules

Labels: design-source, priority-medium

Scope:
- Create ASSISTED_SPEC_MODE.md.
- Define how AI Vision can produce Draft Specs that require human approval.

Acceptance criteria:
- Assisted mode exists.
- Draft specs are not automatically approved.

## Issue 32: Add automated spec mode future plan

Labels: design-source, priority-medium

Scope:
- Create AUTOMATED_SPEC_MODE_FUTURE.md.
- Define future CLI/Extension/Cloud extraction.

Acceptance criteria:
- Future automation is documented without claiming current file-only capability.

## Issue 33: Add missing design report template

Labels: design-source, visual-qa, priority-high

Scope:
- Create MISSING_DESIGN_REPORT_TEMPLATE.md.
- Include missing pages, states, responsive, accessibility, branding, client questions.

Acceptance criteria:
- Missing design report exists.

## Issue 34: Add design change request template

Labels: design-source, visual-qa, priority-medium

Scope:
- Create DESIGN_CHANGE_REQUEST_TEMPLATE.md.
- Define how changes after approval become traceable tasks.

Acceptance criteria:
- Design changes are not applied silently.

## Issue 35: Add approved text spec rules

Labels: frontend-specs, design-source, priority-high

Scope:
- Define status and approval requirements for text specs.

Acceptance criteria:
- Approved Text Spec is recognized as implementation input.

---

# 30. v7.6.0 — Frontend AI Execution Rules

## Issue 36: Add Codex frontend prompt rules

Labels: frontend-governance, priority-high

Scope:
- Create CODEX_FRONTEND_PROMPT_RULES.md.
- Define required context: tokens, page specs, component contracts, allowed/forbidden files.

Acceptance criteria:
- Prompt rules exist.
- Codex is constrained to UI contracts.

## Issue 37: Add Codex frontend task prompt template

Labels: frontend-governance, priority-high

Scope:
- Create codex_commands/CODEX_FRONTEND_TASK_PROMPT_TEMPLATE.md.

Acceptance criteria:
- Template exists.
- It forbids raw design execution and random UI.

## Issue 38: Add frontend allowed/forbidden files rules

Labels: frontend-governance, task-governance, priority-high

Scope:
- Define allowed/forbidden files for public/user/admin/internal frontend tasks.

Acceptance criteria:
- Frontend tasks cannot modify unrelated backend files.

## Issue 39: Add AI no-design-invention rule

Labels: frontend-governance, design-system, priority-high

Scope:
- Document that AI cannot invent visual identity, colors, layout, or components without approval.

Acceptance criteria:
- Rule exists.

## Issue 40: Add frontend output contract

Labels: frontend-governance, visual-qa, priority-medium

Scope:
- Define AI output: summary, files changed, components changed, states implemented, visual notes, limitations.

Acceptance criteria:
- Output contract exists.

## Issue 41: Add frontend task splitting rules

Labels: frontend-governance, priority-medium

Scope:
- Split large frontend tasks into design system, components, page layout, page states, integration, visual QA.

Acceptance criteria:
- Large UI tasks are broken down.

## Issue 42: Add frontend cost control notes

Labels: frontend-governance, ai-usage, priority-medium

Scope:
- Recommend context packs and avoiding raw images/PDFs as expensive context.

Acceptance criteria:
- Cost-aware frontend guidance exists.

---

# 31. v7.7.0 — Visual Acceptance and UI QA

## Issue 43: Add UI acceptance checklist

Labels: visual-qa, priority-high

Scope:
- Create UI_ACCEPTANCE_CHECKLIST.md.
- Include design tokens, states, responsiveness, accessibility, source traceability.

Acceptance criteria:
- Checklist exists.
- Required before verify.

## Issue 44: Add visual QA checklist

Labels: visual-qa, priority-high

Scope:
- Create VISUAL_QA_CHECKLIST.md.
- Include page-by-page review and screenshot notes.

Acceptance criteria:
- Visual QA process exists.

## Issue 45: Add screenshot review notes template

Labels: visual-qa, priority-medium

Scope:
- Create SCREENSHOT_REVIEW_NOTES_TEMPLATE.md.

Acceptance criteria:
- Reviewers can record visual issues.

## Issue 46: Add visual regression future plan

Labels: visual-qa, priority-medium

Scope:
- Create VISUAL_REGRESSION_FUTURE.md.
- Document future automated screenshot comparison.

Acceptance criteria:
- Future plan exists without blocking v7.

## Issue 47: Add client visual approval rules

Labels: visual-qa, priority-high

Scope:
- Define when client approval is required.

Acceptance criteria:
- Client verify is documented.

## Issue 48: Add owner visual verify rules

Labels: owner-verify, visual-qa, priority-high

Scope:
- Define Owner final verify for visual tasks.

Acceptance criteria:
- Owner-only final visual verify exists.

## Issue 49: Add visual issue tracking format

Labels: visual-qa, task-governance, priority-medium

Scope:
- Define format for UI bugs and visual change requests.

Acceptance criteria:
- Visual issues become traceable tasks.

---

# 32. v7.8.0 — Admin-Controlled Theme and Branding

## Issue 50: Add admin-controlled branding system spec

Labels: admin-theme, priority-high

Scope:
- Create ADMIN_CONTROLLED_BRANDING_SYSTEM.md.
- Define logo, favicon, colors, fonts, light/dark mode.

Acceptance criteria:
- Branding system spec exists.

## Issue 51: Add theme settings page spec

Labels: admin-theme, frontend-specs, priority-high

Scope:
- Create frontend_specs/admin/theme_settings_page.spec.md.

Acceptance criteria:
- Theme settings page spec exists.

## Issue 52: Add theme design token sync rules

Labels: admin-theme, design-system, priority-high

Scope:
- Define how admin changes map to design tokens safely.

Acceptance criteria:
- Theme sync rules exist.

## Issue 53: Add contrast validation rules

Labels: accessibility, admin-theme, priority-high

Scope:
- Define contrast validation for admin-selected colors.

Acceptance criteria:
- Low contrast is rejected or warned.

## Issue 54: Add theme audit log rules

Labels: admin-theme, audit, priority-medium

Scope:
- Log who changed theme, when, previous value, new value.

Acceptance criteria:
- Theme changes are auditable.

## Issue 55: Add safe custom CSS rules

Labels: admin-theme, security, priority-medium

Scope:
- Define whether custom CSS is allowed and how to restrict it.

Acceptance criteria:
- Unsafe CSS is forbidden.

## Issue 56: Add default theme restore rules

Labels: admin-theme, priority-medium

Scope:
- Allow restoring default theme.

Acceptance criteria:
- Restore rules exist.

---

# 33. v7.9.0 — Dashboard UX Governance

## Issue 57: Add dashboard UX governance overview

Labels: dashboard-ux, priority-high

Scope:
- Create DASHBOARD_UX_GOVERNANCE.md.
- Define dashboard types, widgets, roles, owner-only actions.

Acceptance criteria:
- Dashboard UX governance exists.

## Issue 58: Add dashboard widget spec template

Labels: dashboard-ux, frontend-specs, priority-high

Scope:
- Create DASHBOARD_WIDGET_SPEC_TEMPLATE.md.

Acceptance criteria:
- Widgets can be specified consistently.

## Issue 59: Add role-based dashboard visibility rules

Labels: dashboard-ux, permissions, priority-high

Scope:
- Define which roles see which widgets/actions.

Acceptance criteria:
- Role-based visibility is documented.

## Issue 60: Add dashboard live state UX rules

Labels: dashboard-ux, priority-medium

Scope:
- Define live refresh, stale data, loading state, sync state.

Acceptance criteria:
- Live dashboard UX states are documented.

## Issue 61: Add dashboard export and filter rules

Labels: dashboard-ux, priority-medium

Scope:
- Define filters, date ranges, saved views, export options.

Acceptance criteria:
- Dashboard controls are documented.

## Issue 62: Add dashboard empty/error states

Labels: dashboard-ux, visual-qa, priority-high

Scope:
- Define empty/error state requirements.

Acceptance criteria:
- Dashboard states are not forgotten.

## Issue 63: Add dashboard responsive behavior rules

Labels: dashboard-ux, accessibility, priority-medium

Scope:
- Define desktop/tablet/mobile behavior for dashboards.

Acceptance criteria:
- Dashboard responsive rules exist.

---

# 34. v7.10.0 — Stable Frontend Experience Release

## Issue 64: Add v7 final acceptance checklist

Labels: visual-qa, priority-high

Scope:
- Create V7_FINAL_ACCEPTANCE_CHECKLIST.md.

Acceptance criteria:
- v7 has a release checklist.

## Issue 65: Add v7 README and user explanation

Labels: docs, priority-high

Scope:
- Create clear README explaining how v7 solves UI/UX issues.

Acceptance criteria:
- Users understand how to use v7.

## Issue 66: Add v7 examples

Labels: example, priority-medium

Scope:
- Add examples for Figma, PDF/image, reference website, no design source.

Acceptance criteria:
- Examples exist.

## Issue 67: Add v7 integration with v5 questionnaire

Labels: questionnaire, ui-ux, priority-high

Scope:
- Document how UI/UX questions connect to System Capability Map.

Acceptance criteria:
- v7 integrates with v5.

## Issue 68: Add v7 integration with v6 vibe UX

Labels: vibe-ux, ui-ux, priority-high

Scope:
- Document how users create UI tasks naturally without CLI-heavy flow.

Acceptance criteria:
- v7 integrates with v6.

## Issue 69: Add v7 GitHub import backlog

Labels: github, docs, priority-medium

Scope:
- Generate GitHub issue import content for v7.

Acceptance criteria:
- v7 issues are ready for GitHub.

---

# 35. Final Acceptance Checklist for v7

```text
- design_sources/ exists.
- design_system/ exists.
- frontend_specs/ exists.
- Raw PDF/images/links are not treated as implementation specs.
- Design Source to Text Spec rules exist.
- Manual Spec Mode exists.
- Assisted Spec Mode exists.
- Automated Spec Mode is documented as future.
- Reference website inspiration rules exist.
- Do Not Copy rules exist.
- Design Tokens template exists.
- Page Spec template exists.
- Component Contract template exists.
- UI Acceptance Checklist exists.
- Visual QA Checklist exists.
- Codex Frontend Prompt Template exists.
- Admin-controlled theme rules exist.
- Dashboard UX governance exists.
- UI/UX questions connect to adaptive questionnaire engine.
- Every frontend task can trace to source, spec, tokens, acceptance, and verify.
```

---

# 36. Final Codex Instruction for v7

Use this prompt when asking Codex to apply v7:

```text
You are working inside Kabeeri-vdf.

Your task is to apply v7.0.0 — Design Source Governance and Frontend Experience Layer.

Critical rules:
1. Do not implement UI from raw PDF, image, screenshot, external link, or reference website directly.
2. Create design source intake, design system, page specs, component contracts, and visual acceptance rules first.
3. Codex implements approved UI specs only.
4. Reference websites are inspiration sources, not copy sources.
5. Do not invent colors, layout, typography, or component variants unless approved by the specs.
6. Preserve existing repository work.
7. Apply changes in small files and produce a report.
8. If no frontend app exists yet, create specs/templates only, not application UI code.

Expected output:
- Summary
- Files created
- Files changed
- Risks
- Checks performed
- Next recommended task
```

---

# 37. الخلاصة التنفيذية

v7.0.0 يجعل Kabeeri قادرًا على التحكم في أخطر نقطة في الفايب كودينج: الواجهات وتجربة المستخدم.

بدل أن يترك Codex أو أي AI Agent يصمم من الفوضى، v7 يفرض هذا المسار:

```text
Design Source
→ Approved Text Spec
→ Design Tokens
→ Page Specs
→ Component Contracts
→ Frontend Task
→ AI Implementation
→ Visual Acceptance
→ Owner / Client Verify
```

وبذلك يصبح Kabeeri قادرًا على التعامل مع:

- Figma
- PDF
- Images
- Screenshots
- Google Drive files
- Other design tools
- Reference websites
- Wireframes
- No-design projects

دون أن يربط نفسه بأداة واحدة، ودون أن يسمح للذكاء الاصطناعي باختراع واجهة غير منضبطة.

```text
Kabeeri v7 = Design Source Governance + Frontend Experience Control + AI-Safe UI Implementation
```
