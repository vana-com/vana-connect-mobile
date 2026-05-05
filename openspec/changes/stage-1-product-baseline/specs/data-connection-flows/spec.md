## ADDED Requirements

### Requirement: Per-identity connection state
The connections surface SHALL show connection state for the logged-in wallet-rooted identity, including source, capability, status, last sync or connection time, and available metadata.

#### Scenario: User opens sources
- **WHEN** a logged-in user opens the connections screen
- **THEN** each source shows state derived from the shared API path for that wallet identity rather than only local UI flags

### Requirement: Lite versus deep source capabilities
Sources SHALL distinguish mobile-capable lite connection from desktop-required deep connection.

#### Scenario: Source supports mobile lite connection
- **WHEN** a source supports OAuth or another mobile-safe lite path
- **THEN** the mobile UI can start that flow and records the result through the shared API path

#### Scenario: Source requires desktop deep connection
- **WHEN** a source requires desktop automation, local browser state, or another desktop-only capability
- **THEN** the mobile UI routes the user to a DataConnect handoff instead of attempting mobile scraping

### Requirement: DataConnect handoff
Desktop-required sources SHALL provide a handoff path from mobile to DataConnect that preserves user identity and target source context.

#### Scenario: User starts a deep connection on mobile
- **WHEN** a user selects deep connection for a desktop-required source
- **THEN** the handoff includes enough context for DataConnect to continue under the same wallet identity and record the resulting connection event

### Requirement: Desktop-published data availability
Data connected through DataConnect desktop SHALL become visible to mobile and builder-facing APIs under the same wallet-rooted identity.

#### Scenario: DataConnect completes a source connection
- **WHEN** DataConnect successfully connects and publishes source metadata or records
- **THEN** mobile can display the resulting data or metadata without requiring a separate mobile connection for the same source

### Requirement: Source catalog extensibility
The source catalog SHALL support source capability metadata, required scopes, connection modes, and sync status in a shape that can later come from DP RPC, a registry, or an app-controlled metadata service.

#### Scenario: Catalog source changes capability
- **WHEN** a source's mobile or desktop capability changes
- **THEN** the UI can represent the new capability without hardcoding source behavior only in local component state
