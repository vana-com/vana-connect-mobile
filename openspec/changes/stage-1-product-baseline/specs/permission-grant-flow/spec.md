## ADDED Requirements

### Requirement: App discovery metadata
The apps/discover surface SHALL display app metadata sufficient for a user to understand the app identity, publisher, requested data categories, and reason for access before granting permission.

#### Scenario: User views an app detail
- **WHEN** a user opens an app detail page or sheet
- **THEN** the UI shows app identity, publisher identity, requested scopes, and access rationale before any grant decision

### Requirement: Explicit permission decision
Permission requests SHALL require an explicit approve or deny decision and SHALL show requesting app, publisher, scopes, duration, and outcome choices.

#### Scenario: App requests access
- **WHEN** an app requests user data
- **THEN** the user sees the requested scopes and duration before approving or denying access

### Requirement: Shared consent record
Grant and denial outcomes SHALL be recorded through the shared API path and appear in user-visible audit history.

#### Scenario: User denies a request
- **WHEN** a user denies an app permission request
- **THEN** the denial is recorded in the shared consent/audit path and can be shown in audit history

### Requirement: Grant material for later protocol use
Approved grants SHALL preserve enough signed material, signed-message references, or authorization metadata to later submit, anchor, or migrate the grant without requiring the user to re-consent.

#### Scenario: Approved grant is migrated
- **WHEN** an approved grant is moved to a later protocol or onchain path
- **THEN** the original user authorization remains usable without asking the user to approve the same access again solely for migration

### Requirement: Active access explanation
The product SHALL be able to answer what app can access what user data and for how long.

#### Scenario: User reviews active access
- **WHEN** a user opens audit, account, or app access history
- **THEN** the product shows app, publisher, scopes, duration or expiry, outcome, and timestamp for relevant permission decisions

### Requirement: Scope editing boundary
The first Stage 1 implementation SHALL NOT imply scope editing is available unless it is backed by a real grant-update flow.

#### Scenario: Scope editing is not implemented
- **WHEN** the user views a permission request
- **THEN** the UI does not present scope-adjustment controls as functional unless the shared API path supports the resulting grant update
