# KVDF System Cleanup Audit

- Report ID: kvdf-cleanup-1779361098685
- Generated at: 2026-05-21T10:58:18.685Z
- Approval status: pending
- Next exact action: Run `kvdf maintenance slow` to review the strict maintenance inspection and relocation evidence.

## Summary

Metric                 Value                                      
---------------------  -------------------------------------------
Workspace root         D:\My Project Ideas\kabeeri.vdf\kabeeri-vdf
Workflow mode          slow                                       
Total files            2821                                       
Total folders          13                                         
Plugin total           16                                         
Active plugins         8                                          
Commands               15                                         
Unknown folders        0                                          
Traceability complete  no                                         
Approved/ready tasks   0                                          

## Cleanup Queue

Area            Reason                                                                                         Next action                                                                           
--------------  ---------------------------------------------------------------------------------------------  --------------------------------------------------------------------------------------
repo-structure  Keep the repository foldering map authoritative.                                               Review the structure validation and remove folder drift.                              
kvdf-dev        Keep the framework-development bundle aligned with its manifest, commands, docs, and runtime.  Review the kvdf-dev plugin bundle and command surface.                                
pipeline        The packet traceability chain still needs review before execution.                             Complete traceability before starting the cleanup execution.                          
dead-code       Review 4 file(s) flagged as dead-code candidates by the file inspection pass.                  Review dead-code candidates file by file and remove or consolidate the unused surface.
stale-docs      Review 4 file(s) with stale wording, legacy aliases, or future-only language.                  Inspect docs one by one and refresh outdated wording, references, and status claims.  
spec-drift      Review 4 file(s) flagged for possible wrong-spec or drift signals.                             Compare each flagged file with the current source of truth and correct drifted specs. 
blocked-flows   Run the workflow inspection pass to look for blocked or waiting-state deadlocks.               Resolve blocked workflow states and make finalization paths idempotent.               

## Top-Level Folders

Folder      Files  Primary extension  Role           
----------  -----  -----------------  ---------------
.kabeeri    853    .md                workspace state
knowledge   467    .md                project surface
packs       439    .md                project surface
plugins     393    .md                plugin bundles 
docs        324    .md                documentation  
src         143    .js                runtime source 
schemas     125    .md                project surface
workspaces  53     .json              project surface
tests       2      .js                tests          
.github     1      .yml               project surface
.gitignore  1      [no extension]     project surface
bin         1      .js                project surface

## File Extensions

Extension       Files
--------------  -----
.md             1623 
.json           704  
.js             217  
.html           191  
.docx           58   
.jsonl          15   
.example        5    
.log            4    
[no extension]  2    
.css            1    
.yml            1    

## Maintenance Inspection

Metric                   Value
-----------------------  -----
Analysis mode            slow 
Scanned files            1900 
Dead code candidates     4    
Stale docs candidates    4    
Spec drift candidates    4    
Blocked flow candidates  0    

Category               File                                                Line  Excerpt                                                                                                                                                            
---------------------  --------------------------------------------------  ----  -------------------------------------------------------------------------------------------------------------------------------------------------------------------
dead_code_candidates   docs/reports/VIBE_MAINTAINER_AUDIT.md               16    Dead code             | 0                                                                                                                                          
dead_code_candidates   docs/reports/VIBE_MAINTAINER_SUMMARY.md             16    Dead code             | 0                                                                                                                                          
dead_code_candidates   plugins/vibe_maintainer/README.md                   9     - review stale docs, dead code, spec drift, and blocked-flow signals                                                                                               
dead_code_candidates   plugins/vibe_maintainer/runtime/vibe_maintainer.js  521   ["Dead code", String(report.summary ? report.summary.dead_code_candidates || 0 : 0)],                                                                              
stale_docs             docs/reports/KVDF_FULL_REPOSITORY_AUDIT.md          525   - The repo supports it, but old wording can still confuse users if not kept consistent.                                                                            
stale_docs             docs/workflows/KVDF_STATE_RESYNC.md                 6     Evolution is planned. It exists to prevent stale planning drafts, outdated                                                                                         
stale_docs             plugins/vibe_maintainer/runtime/vibe_maintainer.js  1014  { category: "stale_docs", pattern: /\b(TBD|TODO|FIXME|future only|planned only|legacy alias|compatibility alias|stale wording|outdated|old info|old wording)\b/i },
stale_docs             tests/service.unit.test.js                          78    fs.writeFileSync(path.join(root, "README.md"), stale ? "# Legacy notes and outdated wording\n" : `# ${slug}\n`, "utf8");                                           
spec_drift_candidates  docs/reports/VIBE_MAINTAINER_AUDIT.md               18    Spec drift            | 0                                                                                                                                          
spec_drift_candidates  docs/reports/VIBE_MAINTAINER_SUMMARY.md             18    Spec drift            | 0                                                                                                                                          
spec_drift_candidates  plugins/vibe_maintainer/README.md                   9     - review stale docs, dead code, spec drift, and blocked-flow signals                                                                                               
spec_drift_candidates  plugins/vibe_maintainer/runtime/vibe_maintainer.js  523   ["Spec drift", String(report.summary ? report.summary.spec_drift_candidates || 0 : 0)],                                                                            

## Relocation Plan

## Relocation Summary

Metric             Value                          
-----------------  -------------------------------
Status             clear                          
Workflow mode      slow                           
Review mode        yes                            
Review threshold   0.9                            
Candidate count    0                              
Applied moves      0                              
Blocked moves      0                              
Next exact action  No relocation action is needed.

No relocation candidates were found.

## Review Evidence

No per-file review evidence recorded.

## Relocation Recommendations

- No relocation candidates were found.

## kvdf-dev Plugin

Plugin    Status   Track            Required folders                                             Commands
--------  -------  ---------------  -----------------------------------------------------------  --------
kvdf-dev  enabled  framework_owner  commands, docs, prompts, schemas, runtime, templates, tests  25      

## Recommendations

- Complete the packet traceability chain before starting execution.
- Review 4 dead-code candidates flagged by the file inspection pass.
- Refresh 4 stale-doc candidates flagged by the file inspection pass.
- Resolve 4 possible spec-drift candidates.
- Resolve active Evolution state first: needs_follow_up.

## Approval Commands

- kvdf cleaner approve --confirm
- kvdf cleaner execute
- kvdf cleaner finalize
