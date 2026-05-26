# Wi-Fi Data Sharing Provider API

`wifi_data_sharing` exposes a local provider API so other removable plugins can query node state, inspect trust and inbox surfaces, and gate package transfer without owning the transport or policy authority.

## Provider Functions

- `getProviderInfo()`
- `ensureState()`
- `getLocalNode()`
- `listCandidates()`
- `listTrustedNodes()`
- `canSendPackage(packageDescriptor, targetNodeId, options)`
- `createPackage(packageInput, options)`
- `sendPackage(packageId, targetNodeId, options)`
- `listInbox(options)`
- `getPackage(packageId)`
- `buildProviderReport(options)`
- `buildReadinessReport()`

## Responsibilities

- The provider answers whether a trusted local package transfer is currently allowed.
- The provider does not become the governance authority.
- The provider does not decide assignments, merges, owners, or worker leadership.
- The provider does not auto-accept received packages.
- The provider does not mutate `multi_ai_governance` state.

## Consumption Pattern

Later plugins, including `multi_ai_governance`, should:

1. query the provider for availability and local node state,
2. create a package descriptor or packet payload,
3. check `canSendPackage(...)`,
4. send the package only after explicit confirmation,
5. review the inbox/quarantine before any explicit consume or apply step,
6. use the provider and readiness reports for visibility only,
7. allow governed session packets such as `assignment_packet` to move over the LAN when another plugin owns the policy and approval layer.

## Safety Notes

- Discovery is still only discovery.
- Trust still requires pairing.
- Transfer is still owner-confirmed.
- Inbox packages remain quarantined until explicitly reviewed.
