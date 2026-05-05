## ADDED Requirements

### Requirement: One user three surfaces one dataset
Stage 1 SHALL demonstrate one wallet-rooted user identity spanning mobile, DataConnect desktop, and Context Gateway or an equivalent builder-facing API path over one shared dataset.

#### Scenario: Cross-surface happy path
- **WHEN** a user signs in on mobile, connects a source through DataConnect desktop, and a builder app requests access
- **THEN** mobile, desktop, and the builder-facing path all refer to the same wallet identity and the same connected dataset

### Requirement: Builder-facing data access
A sample builder app SHALL be able to read an authorized view of the user's connected data through Context Gateway or the approved Stage 1 equivalent API path.

#### Scenario: Builder app reads connected data
- **WHEN** the user has granted the sample app access to a connected source
- **THEN** the builder app can query the authorized data view under the same wallet identity

### Requirement: Migration invariant
Stage 1 SHALL preserve a migration path that does not require the user to re-sign, re-link, or re-consent solely because the team later replaces the current DP RPC, storage, or builder-facing API implementation.

#### Scenario: Infrastructure path changes later
- **WHEN** the system migrates from the Stage 1 infrastructure path to a later protocol implementation
- **THEN** existing identity links, source connections, consent records, and grants remain valid or migratable without repeated user operations

### Requirement: Onchain-compatible activity records
Connect, query, and consent actions SHALL be recorded or prepared in a shape suitable for later onchain metric writes.

#### Scenario: Activity metrics are exported
- **WHEN** Stage 1 activity records are exported for onchain metrics or external observer reporting
- **THEN** the records include enough identity, action type, timestamp, and signed authorization context to support the metric without inventing a new event shape

### Requirement: Full Stage 1 claim requires reproducible demo
The team SHALL NOT claim full Stage 1 completion until the one-user-three-surfaces demo is reproducible from a clean account using documented steps.

#### Scenario: Completion review
- **WHEN** the team reviews Stage 1 readiness
- **THEN** the acceptance demo can be repeated with a new user and produces the same identity, connection, consent, query, and audit evidence across surfaces
