Kabeeri Evolution Execution Report

Priority: evo-auto-008 - Source package cleanup and removal workflow
Status: done
Report path: docs/reports/EVO_AUTO_008.md
Message: Priority evo-auto-008 is complete; keep this report for resume context or archive it with the finished improvement.

Field              Value                                                                                                                                                                                                                                                                         
-----------------  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Execution summary  Execute priority evo-auto-008: After both the Software Design System and the project documentation generator system from KVDF_New_Features_Docs are represented in Evolution Steward and the correct Kabeeri folders, clear the source package contents and remove the folder.
Resume command     kvdf evolution priority evo-auto-008 --status in_progress                                                                                                                                                                                                                     
Next exact action  Review evo-auto-008 and update its status as needed.                                                                                                                                                                                                                          
Current change     evo-006                                                                                                                                                                                                                                                                       
Linked tasks       task-083, task-084, task-085                                                                                                                                                                                                                                                  
Open priorities    0/48                                                                                                                                                                                                                                                                          

Resume steps:
- Run `kvdf resume` and confirm the workspace is framework_owner_development.
- Run `kvdf evolution priority evo-auto-008 --status in_progress` if the priority is not active yet.
- Run `kvdf evolution temp` first and follow the current temporary slice before any implementation, docs, or tests.
- Create or update scoped tasks before handing execution to another tool.
- Run `npm test` and `kvdf conflict scan` before closing the priority.

Verification commands:
- npm test
- npm run kvdf -- conflict scan

Context:
This priority finishes the manual source-package migration only after the design-system and project-documentation-generator material has been copied into permanent Kabeeri homes, represented in Evolution Steward, and verified with the source-package tooling. It exists to make cleanup safe, explicit, and resumable instead of turning deletion into an implicit side effect.

Explanation:
The priority is not just about deleting a folder. It is about proving that the temporary import source has been fully decomposed into permanent Kabeeri surfaces, then using explicit verification and approval to make the final cleanup safe.

Source package:
KVDF_New_Features_Docs (Software Design System reference library, Project documentation generator system)

Cleanup prerequisites:
- evo-auto-006 has analyzed overlap and duplicate risk.
- evo-auto-007 has imported the reusable documentation generator flow, templates, and catalog entries.
- The destination map lists the permanent Kabeeri folders for every meaningful asset.
- The source-package verify command passes before any removal request is made.
- The owner explicitly approves the final decommission request.

Cleanup checklist:
- Confirm the current workspace is framework_owner_development and the source package is the active manual migration target.
- Review the destination map and make sure every meaningful asset has a named permanent home.
- Check that copied content is represented in Evolution Steward, documentation, and the correct Kabeeri folders.
- Run the cleanup preview to confirm the removal plan is safe and no uncovered material remains.
- Record any unresolved duplicates or missing destinations as blockers instead of forcing cleanup.
- Request owner approval for the folder removal step only after verification passes.
- Remove the source folder only after the approval trail, destination map, and verification evidence all agree.

Guardrails:
- Do not delete the source folder while any meaningful asset still lacks a destination.
- Do not treat a preview or dry-run as actual decommission approval.
- Do not skip the overlap analysis or the destination-map verification step.
- Do not close the priority if tests, source-package verification, or conflict scan fail.
- Do not rely on chat memory as the migration record; keep the state file and reports updated.

Validation flow:
- kvdf source-package map
- kvdf source-package verify
- kvdf source-package cleanup
- npm test
- kvdf conflict scan

Rollback plan:
- If verification fails, stop before removal and repair the missing destination, duplicate mapping, or documentation gap.
- If the owner does not approve decommissioning, keep the source folder intact and continue using the cleanup preview only.
- If a file is missing after a partial move, restore it from the source package backup or the generated destination report before retrying cleanup.

Expected artifacts:
- A complete destination map for the source package.
- Updated Evolution Steward entries for the imported design and docs systems.
- A cleanup preview report showing the safe removal plan.
- A decommission request trail with explicit owner approval.
- A final report or note confirming that the source folder was retired only after verification.

Temporary queue: none
Next priority: none