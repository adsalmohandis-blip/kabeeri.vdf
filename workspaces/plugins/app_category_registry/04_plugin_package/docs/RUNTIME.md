# Runtime

Runtime artifacts are written to `.kabeeri` and are derived from the selected category profile.

## Standard outputs

- `app_category_profile.yaml`
- `source_inventory.yaml`
- `source_map.yaml`
- `questionnaire_profile.yaml`
- `spec_profile.yaml`
- `micro_doc_contract.yaml`
- `roadmap_profile.yaml`
- `roadmap_order.yaml`
- `workspace_plan.yaml`
- `readiness_profile.yaml`
- `category_evidence.json`

## Runtime guarantees

- outputs are deterministic for the same selection and inputs
- missing or conflicting inputs are recorded instead of hidden
- hidden or incomplete categories do not appear in the default production flow
