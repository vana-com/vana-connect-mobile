## ADDED Requirements

### Requirement: Mobile product surfaces
The mobile product SHALL preserve the core demo surfaces: onboarding, memory canvas, source connections, app discovery, permission request, audit/history, and account/settings.

#### Scenario: Logged-in user navigates the product
- **WHEN** a user has completed onboarding
- **THEN** the product exposes memory, sources, discover/apps, permission/audit, and account/settings surfaces without relying on developer-only routes

### Requirement: Demo implementation boundaries
The product SHALL treat localStorage, fake OTP, fake wallet derivation, seed memory data, seed permission logs, and static catalogs as demo implementation details rather than production contracts.

#### Scenario: Replacing demo data
- **WHEN** a Stage 1 implementation replaces seed or local state
- **THEN** the replacement uses protocol-backed or contract-compatible data semantics instead of preserving local demo state as the system of record

### Requirement: Non-crypto-forward account experience
The product SHALL keep crypto concepts out of the default user flow while still making wallet identity available in account, advanced, or debug contexts.

#### Scenario: User views account details
- **WHEN** a user opens account/settings
- **THEN** the UI identifies the account in user-facing terms and provides wallet details only as secondary or advanced information

### Requirement: Memory canvas uses connected context
The memory canvas SHALL render user data or metadata connected through Stage 1 protocol paths, grouped by source, schema, tag, or another backed metadata field.

#### Scenario: Connected data appears in memory
- **WHEN** the user has connected data available through the shared API path
- **THEN** the memory canvas displays records or metadata with source, type, timestamp, and completeness context sufficient for the user to understand what is shown
