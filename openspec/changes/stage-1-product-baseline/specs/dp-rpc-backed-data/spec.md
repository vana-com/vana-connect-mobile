## ADDED Requirements

### Requirement: DP RPC shared API spine
Stage 1 SHALL use DP RPC semantics as the shared API spine for identity-adjacent metadata, connection events, data metadata, grant decisions, consent records, query records, and audit history.

#### Scenario: Mobile records a consent decision
- **WHEN** mobile records a grant or denial
- **THEN** the event is written through a DP RPC-compatible path rather than only local mobile state

### Requirement: Storage topology remains separate from API semantics
The implementation SHALL distinguish DP RPC API semantics from the physical storage topology used to make data available across surfaces.

#### Scenario: Hosted storage is selected
- **WHEN** Stage 1 uses hosted storage or a hosted projection of DataConnect local data
- **THEN** the implementation still exposes identity, metadata, grants, consent, and query records through DP RPC-compatible semantics

### Requirement: Personal Server protocol role
The implementation SHALL preserve the protocol distinction between client apps and protocol participants: mobile, desktop, Context Gateway, and builder apps are clients; a Personal Server, hosted Personal Server, hosted storage service, or equivalent authorized server identity is the protocol participant or server delegate.

#### Scenario: Mobile controls a hosted data service
- **WHEN** mobile initiates data access, grants, or account operations
- **THEN** the server participant/delegate remains distinct from the mobile client and is auditable as acting for the wallet owner

### Requirement: User identity and server authority separation
The implementation SHALL keep the user wallet identity separate from authorized server identities, provider identities, and mobile app session identities.

#### Scenario: Server delegate performs a protocol action
- **WHEN** a server delegate stores, serves, or attests to user data
- **THEN** the record identifies the wallet owner and the server authorization without replacing the user identity root

### Requirement: User grant authority
The implementation SHALL treat the user wallet as the authority for app permission grants. A Personal Server or authorized server identity SHALL only exercise, enforce, submit, or attest permissions within the user-approved grant or explicitly pre-authorized policy.

#### Scenario: Server handles an app access request
- **WHEN** a server delegate serves or attests data access for an app
- **THEN** the record references the user-approved grant or pre-authorized policy that allowed the server action

### Requirement: Migration-safe records
Connect, query, consent, and grant records SHALL preserve enough signed material or signed-message references to later flush or anchor records onchain without requiring the user to re-sign, re-link, or re-consent.

#### Scenario: Later migration off current DP RPC
- **WHEN** the system migrates records to a newer DP RPC, onchain, or protocol path
- **THEN** the user does not need to repeat prior connect, query authorization, grant, consent, or identity-link operations solely because of the migration

### Requirement: DP RPC gap inventory
Before implementation claims Stage 1 readiness, the team MUST inventory DP RPC gaps against the required mobile, desktop, storage, builder, grant, consent, query, and audit flows.

#### Scenario: Missing DP RPC capability
- **WHEN** a required Stage 1 record or operation has no DP RPC-compatible representation
- **THEN** the gap is documented with an owner and either resolved or explicitly deferred from the Stage 1 claim
