**Kabeeri VDF**

**Milestones & GitHub Issues Plan for v1.0.0**

**خطة الميلستونز والإشيوز لإنتاج النسخة المستقرة v1.0.0**

*Structured Delivery Mode*

Prepared for GitHub milestones and issues entry

**ملاحظة مهمة:** لا تكتب أرقام الإشيوز في عنوان GitHub. الأرقام داخل هذا الملف للترتيب فقط، و GitHub سيولّد أرقام الإشيوز تلقائيًا.

**Total milestones:** 9 **\| Total issues:** 57

# Milestones Overview

| **Milestone** | **Title**                                                              | **Issue Count** | **Description**                                                                                                                                                                                                                         |
|---------------|------------------------------------------------------------------------|-----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| v0.2.0        | Repository Cleanup, Common Prompt Layer, and Prompt Pack Stabilization | 9               | Clean up the current repository structure, add the shared common prompt layer, fix prompt pack organization issues, complete missing prompt pack folders, and standardize manifests before improving generators and questionnaires.     |
| v0.3.0        | Generator System Validation and Improvement                            | 6               | Align generator schemas with the existing Lite, Standard, and Enterprise generator files, validate all generator outputs, document generation rules, and prepare the generator system for future CLI usage.                             |
| v0.4.0        | Questionnaires Audit and Improvement                                   | 6               | Audit existing questionnaire DOCX files, improve questionnaire documentation, align questionnaire schema with the current structure, and add beginner-friendly Arabic and English examples.                                             |
| v0.5.0        | Expanded Real Example Workflows                                        | 5               | Expand the existing Lite, Standard, and Enterprise examples into fuller workflows showing how users move from idea to questionnaires, generated documents, tasks, prompt packs, acceptance review, and handoff.                         |
| v0.6.0        | CLI Prototype                                                          | 6               | Create the first working kvdf CLI prototype with safe commands such as help, version, doctor, validate, and dry-run behavior. This version should not generate real application code.                                                   |
| v0.7.0        | CLI Generation Features                                                | 6               | Add safe CLI generation features such as kvdf init, kvdf generate lite, kvdf generate standard, kvdf generate enterprise, questionnaire scaffolding, overwrite protection, and generated file summaries.                                |
| v0.8.0        | VS Code Extension Planning                                             | 6               | Design the future VS Code extension experience, including sidebar structure, questionnaire UI, prompt pack browser, task tracking view, and acceptance checklist view.                                                                  |
| v0.9.0        | Documentation and Website Readiness                                    | 7               | Prepare the framework for public users and contributors by improving the main README, Arabic and English documentation, getting started guide, contributor onboarding, roadmap alignment, and documentation website plan.               |
| v1.0.0        | Stable Public Release                                                  | 6               | Prepare and publish the first stable public release of Kabeeri Vibe Developer Framework with stable structure, reviewed prompt packs, generators, questionnaires, examples, documentation, release checklist, and GitHub release notes. |

# Quick Navigation

- **v0.2.0 — Repository Cleanup, Common Prompt Layer, and Prompt Pack Stabilization (9 issues)**

- **v0.3.0 — Generator System Validation and Improvement (6 issues)**

- **v0.4.0 — Questionnaires Audit and Improvement (6 issues)**

- **v0.5.0 — Expanded Real Example Workflows (5 issues)**

- **v0.6.0 — CLI Prototype (6 issues)**

- **v0.7.0 — CLI Generation Features (6 issues)**

- **v0.8.0 — VS Code Extension Planning (6 issues)**

- **v0.9.0 — Documentation and Website Readiness (7 issues)**

- **v1.0.0 — Stable Public Release (6 issues)**

# v0.2.0 — Repository Cleanup, Common Prompt Layer, and Prompt Pack Stabilization

**Milestone description:** Clean up the current repository structure, add the shared common prompt layer, fix prompt pack organization issues, complete missing prompt pack folders, and standardize manifests before improving generators and questionnaires.

## Issue Summary

| **\#** | **Issue Title**                                  | **Labels**                             |
|--------|--------------------------------------------------|----------------------------------------|
| 1      | Fix prompt packs root README location            | prompt-pack, docs, priority-high       |
| 2      | Create common prompt pack layer                  | prompt-pack, docs, priority-high       |
| 3      | Add shared AI coding rules                       | prompt-pack, docs, priority-high       |
| 4      | Add shared scope testing and handoff rules       | prompt-pack, acceptance, priority-high |
| 5      | Update prompt packs to reference common layer    | prompt-pack, docs, priority-medium     |
| 6      | Complete react native expo prompt pack           | prompt-pack, priority-high             |
| 7      | Standardize prompt pack manifests                | prompt-pack, docs, priority-medium     |
| 8      | Clean placeholder template and RFC files         | docs, good-first-issue                 |
| 9      | Align root roadmap with current repository state | docs, priority-medium                  |

## Issue Details

### Issue 1: Fix prompt packs root README location

Labels: prompt-pack, docs, priority-high

Fix the prompt packs root overview file location.

**Current state:**

- The repository has prompt_packs/prompt_packs_README.md.

- The expected file should be prompt_packs/README.md.

**Scope:**

- Rename or recreate prompt_packs/prompt_packs_README.md as prompt_packs/README.md.

- Keep useful existing content.

- Remove duplicate/confusing root overview files if needed.

- Make sure prompt_packs/README.md explains all prompt pack categories.

**Acceptance criteria:**

- prompt_packs/README.md exists.

- prompt_packs/prompt_packs_README.md is removed or clearly replaced.

- Prompt pack categories are easy to understand.

### Issue 2: Create common prompt pack layer

Labels: prompt-pack, docs, priority-high

Create prompt_packs/common/ as the shared rule layer for all prompt packs.

**Scope:**

- Add prompt_packs/common/README.md.

- Add shared AI coding rules.

- Add shared scope control rules.

- Add shared task execution flow.

- Add shared testing and review rules.

- Add shared release handoff rules.

**Acceptance criteria:**

- prompt_packs/common/ exists.

- Common rules are beginner-friendly.

- Existing prompt packs can reference this folder later.

### Issue 3: Add shared AI coding rules

Labels: prompt-pack, docs, priority-high

Create shared AI coding rules used by all prompt packs.

**Scope:**

- Define how AI should modify files.

- Define how AI should report changes.

- Define how AI should avoid unrelated work.

- Define the no-secrets rule.

- Define how AI should stop after one task.

**Acceptance criteria:**

- Shared AI coding rules file exists.

- Rules are clear for beginners.

- Rules can be reused across all prompt packs.

### Issue 4: Add shared scope testing and handoff rules

Labels: prompt-pack, acceptance, priority-high

Create shared rules for scope control, testing, review, and handoff.

**Scope:**

- Add one-task-at-a-time rules.

- Add allowed/forbidden files guidance.

- Add future-features warning.

- Add testing/check instructions.

- Add release handoff output format.

**Acceptance criteria:**

- Scope, testing, review, and handoff rules exist.

- Rules are easy to copy into AI coding tools.

- Rules work for backend, frontend, mobile, and platform prompt packs.

### Issue 5: Update prompt packs to reference common layer

Labels: prompt-pack, docs, priority-medium

Update existing prompt packs so they reference prompt_packs/common/ instead of repeating all shared rules everywhere.

**Scope:**

- Review prompt pack README files.

- Add reference to common rules.

- Do not rewrite every prompt pack fully.

- Keep stack-specific safety rules inside each stack folder.

**Acceptance criteria:**

- Prompt packs mention common rules.

- Stack-specific safety rules remain in stack folders.

- No prompt pack loses important instructions.

### Issue 6: Complete react native expo prompt pack

Labels: prompt-pack, priority-high

Complete the currently empty prompt_packs/react-native-expo/ folder.

**Current state:**

- prompt_packs/react-native-expo/ exists but has no files.

**Scope:**

- Add README.md.

- Add prompt pack index.

- Add usage rules.

- Add mobile project context prompt.

- Add navigation, auth, API, storage, testing, and release handoff prompts.

- Add prompt_pack_manifest.json.

**Acceptance criteria:**

- react-native-expo prompt pack is no longer empty.

- It follows the same structure as other prompt packs.

- It includes mobile-specific safety and scope rules.

### Issue 7: Standardize prompt pack manifests

Labels: prompt-pack, docs, priority-medium

Review and standardize prompt_pack_manifest.json files across all prompt packs.

**Scope:**

- Check file lists.

- Check version values.

- Check pack names.

- Add missing display names where useful.

- Check rule summaries.

- Identify missing manifests.

- Make naming consistent.

**Acceptance criteria:**

- All prompt pack manifests are consistent.

- Missing or incomplete manifests are fixed.

- Version values are aligned with the current milestone.

### Issue 8: Clean placeholder template and RFC files

Labels: docs, good-first-issue

Clean remaining placeholder README files.

**Current placeholder areas:**

- docs/rfcs/README.md

- templates/arabic/README.md

- templates/english/README.md

**Scope:**

- Replace placeholder text with useful purpose explanations.

- Explain what each folder is for.

- Do not add unrelated template files yet.

**Acceptance criteria:**

- Placeholder text is removed.

- Each README explains the folder purpose clearly.

### Issue 9: Align root roadmap with current repository state

Labels: docs, priority-medium

Update ROADMAP.md so it reflects the current repository state.

**Current state:**

- ROADMAP.md still describes older broad phases.

- The repository now has prompt packs, task tracking, acceptance checklists, examples, schemas, and CLI design.

**Scope:**

- Update ROADMAP.md with current milestone plan.

- Document the current assumptions and mark any future additions as deferred.

- Keep roadmap concise and public-friendly.

**Acceptance criteria:**

- ROADMAP.md matches the actual repository.

- Future milestones are clear.

# v0.3.0 — Generator System Validation and Improvement

**Milestone description:** Align generator schemas with the existing Lite, Standard, and Enterprise generator files, validate all generator outputs, document generation rules, and prepare the generator system for future CLI usage.

## Issue Summary

| **\#** | **Issue Title**                                      | **Labels**                          |
|--------|------------------------------------------------------|-------------------------------------|
| 10     | Align generator schema with existing generator files | generator, priority-high            |
| 11     | Validate lite generator against schema               | generator, priority-high            |
| 12     | Validate standard generator against schema           | generator, priority-high            |
| 13     | Validate enterprise generator against schema         | generator, priority-high            |
| 14     | Document Core Production Extension generation rules  | generator, docs, priority-medium    |
| 15     | Add generator validation examples                    | generator, example, priority-medium |

## Issue Details

### Issue 10: Align generator schema with existing generator files

Labels: generator, priority-high

Update schemas/generator.schema.json so it matches the current generator files.

**Current state:**

- schemas/generator.schema.json exists.

- generators/lite.json, standard.json, and enterprise.json exist.

- The schema currently does not fully match the actual generator structure.

**Scope:**

- Review fields in lite.json, standard.json, and enterprise.json.

- Update generator.schema.json.

- Support generator_version, schema_version, language_support, layers, folder_count, and folders.

- Keep schema ready for future CLI validation.

**Acceptance criteria:**

- generator.schema.json matches current generator files.

- Lite, Standard, and Enterprise can validate against it.

### Issue 11: Validate lite generator against schema

Labels: generator, priority-high

Validate and improve generators/lite.json.

**Scope:**

- Validate lite.json against generator.schema.json.

- Confirm folder_count matches actual folders.

- Confirm Lite remains simple.

- Confirm Lite does not include unnecessary production or enterprise layers.

- Document any limitations.

**Acceptance criteria:**

- lite.json validates against the schema.

- Lite generator is suitable for simple MVPs.

### Issue 12: Validate standard generator against schema

Labels: generator, priority-high

Validate and improve generators/standard.json.

**Scope:**

- Validate standard.json against generator.schema.json.

- Confirm folder_count matches actual folders.

- Confirm Standard includes real MVP planning needs.

- Confirm Standard is clearly different from Lite and Enterprise.

- Document any limitations.

**Acceptance criteria:**

- standard.json validates against the schema.

- Standard generator is usable for real products and client projects.

### Issue 13: Validate enterprise generator against schema

Labels: generator, priority-high

Validate and improve generators/enterprise.json.

**Scope:**

- Validate enterprise.json against generator.schema.json.

- Confirm folder_count matches actual folders.

- Confirm Enterprise includes security, governance, production, and extension layers.

- Confirm Enterprise is not presented as the default choice.

- Document any limitations.

**Acceptance criteria:**

- enterprise.json validates against the schema.

- Enterprise generator is suitable for larger systems.

### Issue 14: Document Core Production Extension generation rules

Labels: generator, docs, priority-medium

Document how generator outputs are split into core, production, and extension groups.

**Current state:**

- questionnaires/QUESTIONNAIRE_SPLIT_MAP.md exists.

- Need clearer generator-facing documentation.

**Scope:**

- Define core folders.

- Define production folders.

- Define extension folders.

- Explain when each group is used.

- Connect rules to Lite, Standard, and Enterprise.

**Acceptance criteria:**

- Clear documentation exists.

- Beginners can understand the difference.

- Future CLI can use these rules.

### Issue 15: Add generator validation examples

Labels: generator, example, priority-medium

Add examples that show how generator files should validate.

**Scope:**

- Add a valid Lite generator validation example.

- Add a valid Standard generator validation example.

- Add a valid Enterprise generator validation example.

- Add notes for future CLI validation.

**Acceptance criteria:**

- Generator validation examples exist.

- Examples match the schema.

- Examples help future CLI implementation.

# v0.4.0 — Questionnaires Audit and Improvement

**Milestone description:** Audit existing questionnaire DOCX files, improve questionnaire documentation, align questionnaire schema with the current structure, and add beginner-friendly Arabic and English examples.

## Issue Summary

| **\#** | **Issue Title**                                              | **Labels**                              |
|--------|--------------------------------------------------------------|-----------------------------------------|
| 16     | Audit questionnaire DOCX files                               | questionnaire, priority-high            |
| 17     | Improve core questionnaires documentation                    | questionnaire, docs, priority-high      |
| 18     | Improve production questionnaires documentation              | questionnaire, docs, priority-high      |
| 19     | Improve extension questionnaires documentation               | questionnaire, docs, priority-medium    |
| 20     | Align questionnaire schema with current questionnaire system | questionnaire, priority-medium          |
| 21     | Add Arabic and English answered questionnaire examples       | questionnaire, example, priority-medium |

## Issue Details

### Issue 16: Audit questionnaire DOCX files

Labels: questionnaire, priority-high

Audit the existing questionnaire DOCX files under questionnaires/core, questionnaires/production, and questionnaires/extension.

**Current state:**

- Questionnaire DOCX files already exist.

- They are split into core, production, and extension.

**Scope:**

- Check that DOCX files open correctly.

- Confirm Arabic and English files exist for each folder.

- Confirm file naming is consistent.

- Document missing or corrupted files if any.

**Acceptance criteria:**

- Questionnaire DOCX inventory is reviewed.

- Missing or corrupted files are documented or fixed.

### Issue 17: Improve core questionnaires documentation

Labels: questionnaire, docs, priority-high

Improve questionnaires/core/ documentation and usability.

**Scope:**

- Improve core README.

- Add index of core questionnaire folders.

- Explain when core questions are used.

- Explain that detailed documents are generated after answers.

- Add beginner-friendly guidance.

**Acceptance criteria:**

- Core questionnaire documentation is clear.

- Beginners understand how to use core questionnaires.

### Issue 18: Improve production questionnaires documentation

Labels: questionnaire, docs, priority-high

Improve questionnaires/production/ documentation and usability.

**Scope:**

- Improve production README.

- Add index of production questionnaire folders.

- Explain production readiness purpose.

- Add beginner-friendly notes for technical areas.

- Avoid making production questions feel mandatory for small MVPs.

**Acceptance criteria:**

- Production questionnaire documentation is clear.

- Users understand when production questionnaires are needed.

### Issue 19: Improve extension questionnaires documentation

Labels: questionnaire, docs, priority-medium

Improve questionnaires/extension/ documentation and usability.

**Scope:**

- Improve extension README.

- Add index of extension questionnaire folders.

- Explain future-feature planning.

- Clarify that extension questions should not pollute V1 scope.

- Add beginner-friendly guidance.

**Acceptance criteria:**

- Extension questionnaire documentation is clear.

- Future work is separated from first release scope.

### Issue 20: Align questionnaire schema with current questionnaire system

Labels: questionnaire, priority-medium

Update schemas/questionnaire.schema.json so it matches the actual questionnaire system and future metadata needs.

**Current state:**

- questionnaire.schema.json exists.

- Current questionnaires are DOCX files grouped by folder.

**Scope:**

- Decide how schema should represent questionnaire metadata.

- Support folder, language, related generator layer, and output documents.

- Keep schema useful for future CLI validation.

- Do not replace existing DOCX files.

**Acceptance criteria:**

- questionnaire.schema.json supports current and future questionnaire metadata.

- Schema does not conflict with existing DOCX workflow.

### Issue 21: Add Arabic and English answered questionnaire examples

Labels: questionnaire, example, priority-medium

Add example answered questionnaires in Arabic and English.

**Scope:**

- Add one Arabic answered example.

- Add one English answered example.

- Use simple beginner-friendly answers.

- Connect answers to expected generated documents.

- Keep examples short and practical.

**Acceptance criteria:**

- Arabic example exists.

- English example exists.

- Examples are clear and practical.

# v0.5.0 — Expanded Real Example Workflows

**Milestone description:** Expand the existing Lite, Standard, and Enterprise examples into fuller workflows showing how users move from idea to questionnaires, generated documents, tasks, prompt packs, acceptance review, and handoff.

## Issue Summary

| **\#** | **Issue Title**                    | **Labels**                            |
|--------|------------------------------------|---------------------------------------|
| 22     | Expand Lite example workflow       | example, docs, good-first-issue       |
| 23     | Expand Standard example workflow   | example, docs, priority-medium        |
| 24     | Expand Enterprise example workflow | example, docs, priority-medium        |
| 25     | Add sample generated document set  | example, docs, priority-medium        |
| 26     | Add sample acceptance review       | example, acceptance, good-first-issue |

## Issue Details

### Issue 22: Expand Lite example workflow

Labels: example, docs, good-first-issue

Expand examples/lite/ into a fuller beginner workflow.

**Current state:**

- examples/lite/ already exists with README, PRODUCT_BRIEF, WORKFLOW, and tasks.example.json.

**Scope:**

- Add answered questions.

- Add generated document samples.

- Add task tracking example.

- Add acceptance checklist example.

- Keep the example simple.

**Acceptance criteria:**

- Lite example shows a complete simple flow.

- New users can follow it step by step.

- No unnecessary enterprise complexity is added.

### Issue 23: Expand Standard example workflow

Labels: example, docs, priority-medium

Expand examples/standard/ into a real MVP workflow.

**Current state:**

- examples/standard/ already exists with README, PRODUCT_BRIEF, WORKFLOW, and tasks.example.json.

**Scope:**

- Add answered questionnaire.

- Add generated docs sample.

- Add prompt pack usage sample.

- Add task and acceptance flow.

- Show a real but simple SaaS/client-project example.

**Acceptance criteria:**

- Standard example is useful for client projects and SaaS MVPs.

- Workflow is clear from idea to review.

### Issue 24: Expand Enterprise example workflow

Labels: example, docs, priority-medium

Expand examples/enterprise/ into a larger multi-role workflow.

**Current state:**

- examples/enterprise/ already exists with README, PRODUCT_BRIEF, WORKFLOW, and tasks.example.json.

**Scope:**

- Add role/access example.

- Add database model example.

- Add task dependency example.

- Add release acceptance example.

- Add governance/review notes.

**Acceptance criteria:**

- Enterprise example clearly shows why Enterprise is different.

- Enterprise example includes roles, security, and release controls.

### Issue 25: Add sample generated document set

Labels: example, docs, priority-medium

Add a sample generated document set based on one example workflow.

**Scope:**

- Choose one example project.

- Add strategy sample.

- Add release specs sample.

- Add execution plan sample.

- Add AI prompt sample.

- Keep documents short and readable.

**Acceptance criteria:**

- Users can see what Kabeeri VDF output should look like.

- Sample documents connect to the example project.

### Issue 26: Add sample acceptance review

Labels: example, acceptance, good-first-issue

Add a sample acceptance review using acceptance_checklists/.

**Scope:**

- Pick one example task.

- Add completed acceptance checklist.

- Show accepted / needs_changes decision example.

- Explain review notes.

**Acceptance criteria:**

- Users understand how to review AI output before closing issues.

- Acceptance review is practical and beginner-friendly.

# v0.6.0 — CLI Prototype

**Milestone description:** Create the first working kvdf CLI prototype with safe commands such as help, version, doctor, validate, and dry-run behavior. This version should not generate real application code.

## Issue Summary

| **\#** | **Issue Title**                 | **Labels**            |
|--------|---------------------------------|-----------------------|
| 27     | Create CLI package skeleton     | cli, priority-high    |
| 28     | Implement kvdf help command     | cli, good-first-issue |
| 29     | Implement kvdf version command  | cli, good-first-issue |
| 30     | Implement kvdf doctor command   | cli, priority-high    |
| 31     | Implement kvdf validate command | cli, priority-high    |
| 32     | Add CLI dry run mode            | cli, priority-high    |

## Issue Details

### Issue 27: Create CLI package skeleton

Labels: cli, priority-high

Create the first working skeleton for the future kvdf CLI.

**Current state:**

- cli/ exists as a design-only folder.

- No executable CLI implementation exists yet.

**Scope:**

- Choose implementation language.

- Recommended: Node.js / TypeScript.

- Add package structure.

- Add README.

- Add safe placeholder commands only.

- Do not generate real app code yet.

**Acceptance criteria:**

- CLI package skeleton exists.

- It does not generate real app code yet.

- Project structure is ready for future commands.

### Issue 28: Implement kvdf help command

Labels: cli, good-first-issue

Implement the first help output for the kvdf CLI.

**Scope:**

- Add kvdf --help.

- Add command list.

- Add safety note.

- Add examples.

- Keep output beginner-friendly.

**Acceptance criteria:**

- kvdf --help displays useful output.

- Output is beginner-friendly.

- Help command does not modify files.

### Issue 29: Implement kvdf version command

Labels: cli, good-first-issue

Implement kvdf --version.

**Scope:**

- Read version from package/config.

- Display CLI version.

- Keep output simple.

- Add basic test if test structure exists.

**Acceptance criteria:**

- kvdf --version works.

- Version output is clear.

### Issue 30: Implement kvdf doctor command

Labels: cli, priority-high

Implement kvdf doctor to check the local Kabeeri VDF workspace.

**Scope:**

- Check required folders.

- Check README files.

- Check JSON validity.

- Warn about missing manifests.

- Do not modify files.

- Print pass/warning/fail summary.

**Acceptance criteria:**

- kvdf doctor reports pass/warning/fail.

- It does not change files.

- Output is readable for beginners.

### Issue 31: Implement kvdf validate command

Labels: cli, priority-high

Implement kvdf validate for basic framework validation.

**Scope:**

- Validate JSON files.

- Validate task schema examples.

- Validate acceptance schema examples.

- Validate generator files against generator schema.

- Print readable errors.

**Acceptance criteria:**

- kvdf validate catches invalid JSON and schema mismatches.

- It prints readable error messages.

- It does not modify files.

### Issue 32: Add CLI dry run mode

Labels: cli, priority-high

Add dry-run behavior for future file-writing CLI commands.

**Scope:**

- Define --dry-run behavior.

- Print files that would be created.

- Ensure no files are changed in dry-run mode.

- Add dry-run tests or documented checks.

**Acceptance criteria:**

- Dry-run mode is documented and tested.

- Dry-run does not write files.

- Output clearly says no files were changed.

# v0.7.0 — CLI Generation Features

**Milestone description:** Add safe CLI generation features such as kvdf init, kvdf generate lite, kvdf generate standard, kvdf generate enterprise, questionnaire scaffolding, overwrite protection, and generated file summaries.

## Issue Summary

| **\#** | **Issue Title**                     | **Labels**                          |
|--------|-------------------------------------|-------------------------------------|
| 33     | Implement kvdf init                 | cli, priority-high                  |
| 34     | Implement kvdf generate lite        | cli, generator, priority-high       |
| 35     | Implement kvdf generate standard    | cli, generator, priority-high       |
| 36     | Implement kvdf generate enterprise  | cli, generator, priority-high       |
| 37     | Implement kvdf questionnaire create | cli, questionnaire, priority-medium |
| 38     | Add overwrite confirmation to CLI   | cli, priority-high                  |

## Issue Details

### Issue 33: Implement kvdf init

Labels: cli, priority-high

Implement kvdf init to create a Kabeeri VDF workspace structure safely.

**Scope:**

- Create required folders.

- Add starter README files.

- Support dry-run.

- Avoid overwriting files without confirmation.

- Print generated file summary.

**Acceptance criteria:**

- kvdf init works safely.

- Existing files are protected.

- Dry-run works.

### Issue 34: Implement kvdf generate lite

Labels: cli, generator, priority-high

Implement Lite profile generation.

**Scope:**

- Read generators/lite.json.

- Create Lite folder skeleton.

- Add starter questionnaire files.

- Support dry-run.

- Avoid overwriting files without confirmation.

**Acceptance criteria:**

- Lite generation works.

- Lite output stays simple.

- Dry-run shows expected files.

### Issue 35: Implement kvdf generate standard

Labels: cli, generator, priority-high

Implement Standard profile generation.

**Scope:**

- Read generators/standard.json.

- Create Standard folder skeleton.

- Include planning, task, prompt, and acceptance layers.

- Support dry-run.

- Avoid overwriting files without confirmation.

**Acceptance criteria:**

- Standard generation works.

- Output is practical for real MVPs.

- Dry-run shows expected files.

### Issue 36: Implement kvdf generate enterprise

Labels: cli, generator, priority-high

Implement Enterprise profile generation.

**Scope:**

- Read generators/enterprise.json.

- Create enterprise folder skeleton.

- Include security/access, governance, release, and extension layers.

- Support dry-run.

- Avoid overwriting files without confirmation.

**Acceptance criteria:**

- Enterprise generation works.

- Output does not overwrite existing files without confirmation.

- Enterprise output includes enterprise-only layers.

### Issue 37: Implement kvdf questionnaire create

Labels: cli, questionnaire, priority-medium

Implement questionnaire generation from CLI.

**Scope:**

- Support core, production, and extension groups.

- Support Lite, Standard, and Enterprise profiles.

- Support Arabic/English later.

- Support dry-run.

- Use questionnaire schema if available.

**Acceptance criteria:**

- CLI can scaffold questionnaire files safely.

- Dry-run works.

- Generated questionnaire files are clear.

### Issue 38: Add overwrite confirmation to CLI

Labels: cli, priority-high

Add safe overwrite confirmation for CLI file-writing commands.

**Scope:**

- Detect existing files.

- Ask before overwrite.

- Support --force only if documented.

- Keep safe default.

- Show file list before overwrite.

**Acceptance criteria:**

- CLI does not overwrite files silently.

- User can cancel safely.

- --force behavior is documented if added.

# v0.8.0 — VS Code Extension Planning

**Milestone description:** Design the future VS Code extension experience, including sidebar structure, questionnaire UI, prompt pack browser, task tracking view, and acceptance checklist view.

## Issue Summary

| **\#** | **Issue Title**                  | **Labels**                           |
|--------|----------------------------------|--------------------------------------|
| 39     | Design VS Code extension concept | docs, priority-medium                |
| 40     | Design VS Code sidebar           | docs, priority-medium                |
| 41     | Design questionnaire UI flow     | questionnaire, docs, priority-medium |
| 42     | Design prompt pack browser       | prompt-pack, docs, priority-medium   |
| 43     | Design task tracking view        | task-tracking, docs, priority-medium |
| 44     | Design acceptance checklist view | acceptance, docs, priority-medium    |

## Issue Details

### Issue 39: Design VS Code extension concept

Labels: docs, priority-medium

Design the future VS Code extension concept for Kabeeri VDF.

**Scope:**

- Define extension purpose.

- Define target users.

- Define what it should do.

- Define what it should not do.

- Define relationship with CLI.

**Acceptance criteria:**

- VS Code extension concept document exists.

- Scope is clearly design-only.

- Relationship with CLI is explained.

### Issue 40: Design VS Code sidebar

Labels: docs, priority-medium

Design the sidebar structure for the future VS Code extension.

**Scope:**

- Framework folders view.

- Questionnaires view.

- Prompt packs view.

- Tasks view.

- Acceptance checklists view.

- Examples view.

**Acceptance criteria:**

- Sidebar sections are documented clearly.

- Sidebar design is beginner-friendly.

### Issue 41: Design questionnaire UI flow

Labels: questionnaire, docs, priority-medium

Design how questionnaires could be answered inside VS Code.

**Scope:**

- Question display.

- Answer capture.

- Save to files.

- AI-help note display.

- Arabic/English support planning.

- Progress state planning.

**Acceptance criteria:**

- Questionnaire UI flow is documented.

- Arabic/English needs are considered.

- No extension code is required yet.

### Issue 42: Design prompt pack browser

Labels: prompt-pack, docs, priority-medium

Design how users browse and open prompt packs inside VS Code.

**Scope:**

- List prompt packs.

- Show pack purpose.

- Show first recommended prompt.

- Copy prompt action.

- Open prompt file action.

**Acceptance criteria:**

- Prompt pack browser flow is documented.

- User can understand how prompt selection should work.

### Issue 43: Design task tracking view

Labels: task-tracking, docs, priority-medium

Design task tracking UI for the future VS Code extension.

**Scope:**

- Show tasks.

- Show status.

- Show related issue.

- Show acceptance state.

- Open task file.

- Link to task schema.

**Acceptance criteria:**

- Task tracking view is documented.

- View supports the current task tracking format.

### Issue 44: Design acceptance checklist view

Labels: acceptance, docs, priority-medium

Design acceptance checklist UI for the future VS Code extension.

**Scope:**

- Show checklist items.

- Allow pass/fail/not applicable planning.

- Show final decision.

- Link to task/release.

- Save review notes.

**Acceptance criteria:**

- Acceptance checklist view is documented.

- View supports the current acceptance checklist format.

# v0.9.0 — Documentation and Website Readiness

**Milestone description:** Prepare the framework for public users and contributors by improving the main README, Arabic and English documentation, getting started guide, contributor onboarding, roadmap alignment, and documentation website plan.

## Issue Summary

| **\#** | **Issue Title**                        | **Labels**             |
|--------|----------------------------------------|------------------------|
| 45     | Polish main README and README_AR       | docs, priority-high    |
| 46     | Add getting started guide              | docs, good-first-issue |
| 47     | Improve English documentation coverage | docs, priority-medium  |
| 48     | Improve Arabic documentation quality   | docs, priority-medium  |
| 49     | Add contributor onboarding guide       | docs, good-first-issue |
| 50     | Add documentation website plan         | docs, priority-medium  |
| 51     | Document delivery modes roadmap        | docs, priority-medium  |

## Issue Details

### Issue 45: Polish main README and README_AR

Labels: docs, priority-high

Improve the main repository README.md and README_AR.md for public users.

**Scope:**

- Fix formatting problems.

- Make code blocks and sections clear.

- Explain what Kabeeri VDF is.

- Explain who it is for.

- Explain how to start.

- Link to docs, examples, prompt packs, and roadmap.

**Acceptance criteria:**

- README.md is clear for new visitors.

- README_AR.md is clear for Arabic users.

- Both files reflect the current repository state.

### Issue 46: Add getting started guide

Labels: docs, good-first-issue

Add a beginner-friendly getting started guide.

**Scope:**

- Explain first 10 minutes.

- Explain choosing profile.

- Explain using examples.

- Explain using prompt packs.

- Explain task and acceptance workflow.

- Add next steps.

**Acceptance criteria:**

- New users can start without asking the maintainer.

- Guide is short and practical.

### Issue 47: Improve English documentation coverage

Labels: docs, priority-medium

Improve English documentation coverage.

**Current state:**

- docs/ar has many more documents than docs/en.

- docs/en currently has fewer files.

**Scope:**

- Review missing English docs.

- Add English equivalents where important.

- Keep wording simple and contributor-friendly.

- Align English docs with the current structure.

**Acceptance criteria:**

- English docs better match the Arabic docs.

- Contributors can understand the framework without Arabic context.

### Issue 48: Improve Arabic documentation quality

Labels: docs, priority-medium

Improve Arabic documentation quality and consistency.

**Scope:**

- Review Arabic docs.

- Improve wording.

- Make beginner language clearer.

- Ensure terms are consistent.

- Add missing Arabic explanations where needed.

**Acceptance criteria:**

- Arabic docs are useful for non-technical users.

- Arabic wording is clear and consistent.

### Issue 49: Add contributor onboarding guide

Labels: docs, good-first-issue

Add a guide for new contributors.

**Scope:**

- Explain repo structure.

- Explain issues and labels.

- Explain milestones.

- Explain contribution workflow.

- Explain how to add prompt packs safely.

- Explain how to use task tracking and acceptance checklists.

**Acceptance criteria:**

- New contributors understand how to help.

- Guide links to relevant folders.

### Issue 50: Add documentation website plan

Labels: docs, priority-medium

Plan a future documentation website for Kabeeri VDF.

**Scope:**

- Define website goals.

- Define pages.

- Define docs structure.

- Choose possible stack later.

- Do not build the website yet.

- Explain what content should be published.

**Acceptance criteria:**

- Website plan exists.

- Plan is design-only.

- Website scope is clear.

### Issue 51: Document delivery modes roadmap

Labels: docs, priority-medium

Document that Kabeeri VDF v1.0.0 focuses on Structured Delivery Mode, while Agile Delivery Mode is planned after the stable release.

**Scope:**

- Explain Structured Delivery Mode.

- Explain that it is useful for users who need planning-first workflows.

- Mention Agile Delivery Mode as a future roadmap direction.

- Avoid describing Kabeeri VDF as Waterfall-only.

**Acceptance criteria:**

- Delivery modes roadmap is documented.

- v1.0.0 positioning is clear.

- Agile future direction is mentioned without changing current milestones.

# v1.0.0 — Stable Public Release

**Milestone description:** Prepare and publish the first stable public release of Kabeeri Vibe Developer Framework with stable structure, reviewed prompt packs, generators, questionnaires, examples, documentation, release checklist, and GitHub release notes.

## Issue Summary

| **\#** | **Issue Title**                             | **Labels**                              |
|--------|---------------------------------------------|-----------------------------------------|
| 52     | Prepare v1.0.0 release checklist            | acceptance, docs, priority-high         |
| 53     | Review stable folder structure              | docs, priority-high                     |
| 54     | Review stable prompt packs                  | prompt-pack, priority-high              |
| 55     | Review stable generators and questionnaires | generator, questionnaire, priority-high |
| 56     | Prepare v1.0.0 release notes                | docs, priority-high                     |
| 57     | Publish v1.0.0 GitHub release               | docs, priority-high                     |

## Issue Details

### Issue 52: Prepare v1.0.0 release checklist

Labels: acceptance, docs, priority-high

Create the final v1.0.0 release checklist.

**Scope:**

- Docs readiness.

- Prompt packs readiness.

- Generator readiness.

- Questionnaire readiness.

- Examples readiness.

- CLI/roadmap readiness.

- License/security/contribution readiness.

**Acceptance criteria:**

- v1.0.0 release checklist exists.

- Checklist can be used before publishing the release.

### Issue 53: Review stable folder structure

Labels: docs, priority-high

Review the repository folder structure before v1.0.0.

**Scope:**

- Check all main folders.

- Remove placeholders.

- Ensure naming consistency.

- Ensure README exists where needed.

- Document stable structure.

**Acceptance criteria:**

- Folder structure is stable and documented.

- No obvious placeholders remain.

### Issue 54: Review stable prompt packs

Labels: prompt-pack, priority-high

Review all prompt packs before v1.0.0.

**Scope:**

- Check pack README files.

- Check prompt order.

- Check safety notes.

- Check common layer references.

- Check manifests.

- Check naming consistency.

- Confirm empty prompt pack folders are resolved.

**Acceptance criteria:**

- Prompt packs are stable enough for public usage.

- Known limitations are documented.

### Issue 55: Review stable generators and questionnaires

Labels: generator, questionnaire, priority-high

Review generators and questionnaires before v1.0.0.

**Scope:**

- Validate generator files.

- Validate questionnaire files and metadata.

- Check beginner-friendly wording.

- Check Arabic/English support.

- Check generated folder rules.

**Acceptance criteria:**

- Generators and questionnaires are stable for public users.

- Known limitations are documented.

### Issue 56: Prepare v1.0.0 release notes

Labels: docs, priority-high

Prepare release notes for the stable public release.

**Scope:**

- Summarize what Kabeeri VDF includes.

- List supported prompt packs.

- List examples.

- List known limitations.

- List future roadmap.

- Add upgrade notes from previous versions if needed.

**Acceptance criteria:**

- Release notes are ready for GitHub Release.

- Notes are clear for public users.

### Issue 57: Publish v1.0.0 GitHub release

Labels: docs, priority-high

Publish the first stable GitHub Release.

**Scope:**

- Confirm milestone is complete.

- Confirm release checklist is accepted.

- Create tag v1.0.0.

- Publish GitHub Release.

- Link release notes.

**Acceptance criteria:**

- v1.0.0 release is published.

- GitHub Release includes clear notes.

- Repository is ready for public users.

# Final Notes

**Positioning for v1.0.0:** This plan produces Kabeeri VDF v1.0.0 as a stable Structured Delivery Mode release. Agile Delivery Mode is intentionally documented as a future direction, not implemented before v1.0.0.

**GitHub entry guidance:** Create the milestones first, then create each issue under the correct milestone with the listed labels. If a label does not exist, create it or use the closest existing label.
