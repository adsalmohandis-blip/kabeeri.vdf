# Multi-AI Governance Docs

This plugin bundles the multi-AI governance contract as a removable framework
plugin.

Use this bundle for:

- leader lifecycle governance
- agent queue coordination
- relay and conversation rules
- merge provenance
- token, lock, and assignment policy
- Evolution assignment bridge for master/worker task distribution
- Evolution two-laptop workflow report for safe master/worker handoff
- IDE window governance for multiple AI tools in the same workspace
- local project governance for the same machine and repository across IDEs, terminals, and local agents
- GitHub provider governance for AI work that reaches GitHub through the existing `github_provider` layer

Evolution bridge docs:

- [Evolution Assignment Bridge](EVOLUTION_ASSIGNMENT_BRIDGE.md)
- [Evolution Two-Laptop Workflow](EVOLUTION_TWO_LAPTOP_WORKFLOW.md)
- [Evolution Session Automation](EVOLUTION_SESSION_AUTOMATION.md)

Case 1 docs:

- [IDE Window Analysis](CASE_1_IDE_WINDOW_ANALYSIS.md)
- [IDE Window Governance](CASE_1_IDE_WINDOW_GOVERNANCE.md)
- [IDE Policy Checks](CASE_1_IDE_POLICY_CHECKS.md)
- [IDE Leases](CASE_1_IDE_LEASES.md)

Case 2 docs:

- [Local Project Governance](CASE_2_LOCAL_PROJECT_GOVERNANCE.md)
- [Local Policy Checks](CASE_2_LOCAL_POLICY_CHECKS.md)
- [Local Leases](CASE_2_LOCAL_LEASES.md)
- [Case 2 Completion Report](CASE_2_COMPLETION_REPORT.md)

Case 3 docs:

- [Wi-Fi/LAN Governance](CASE_3_WIFI_LAN_GOVERNANCE.md)
- [Wi-Fi Policy Checks](CASE_3_WIFI_POLICY_CHECKS.md)
- [Wi-Fi Leases](CASE_3_WIFI_LEASES.md)
- [Wi-Fi Data Sharing Integration](CASE_3_WIFI_DATA_SHARING_INTEGRATION.md)
- [Case 3 Completion Report](CASE_3_COMPLETION_REPORT.md)

Case 4 docs:

- [KCloud Governance](CASE_4_KCLOUD_GOVERNANCE.md)
- [KCloud Policy Checks](CASE_4_KCLOUD_POLICY_CHECKS.md)
- [KCloud Leases](CASE_4_KCLOUD_LEASES.md)
- [KCloud Data Sharing Integration](CASE_4_KCLOUD_DATA_SHARING_INTEGRATION.md)
- [Case 4 Analysis](CASE_4_KCLOUD_ANALYSIS.md)
- [Case 4 Gap Report](CASE_4_KCLOUD_GAP_REPORT.md)
- [Case 4 Implementation Plan](CASE_4_KCLOUD_IMPLEMENTATION_PLAN.md)
- [KCloud Boundary](CASE_4_KCLOUD_DATA_SHARING_BOUNDARY.md)
- [GitHub Provider Boundary](CASE_4_GITHUB_PROVIDER_BOUNDARY.md)
- [Case 4 Completion Report](CASE_4_COMPLETION_REPORT.md)

Case 5 docs:

- [GitHub Provider Governance](CASE_5_GITHUB_PROVIDER_GOVERNANCE.md)
- [GitHub Provider Policy Checks](CASE_5_GITHUB_PROVIDER_POLICY_CHECKS.md)
- [GitHub Provider Integration](CASE_5_GITHUB_PROVIDER_INTEGRATION.md)
- [GitHub Provider Boundary](CASE_5_GITHUB_PROVIDER_BOUNDARY.md)
- [Case 5 Completion Report](CASE_5_COMPLETION_REPORT.md)

Evolution bridge docs:

- [Evolution Assignment Bridge](EVOLUTION_ASSIGNMENT_BRIDGE.md)

The runtime state remains in `.kabeeri/multi_ai_governance.json` for the shared leader/queue layer, while Case 1, Case 2, and Case 3 maintain their own state files under `.kabeeri/multi_ai_governance/`.
