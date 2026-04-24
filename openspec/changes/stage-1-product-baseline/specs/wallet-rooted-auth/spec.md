## ADDED Requirements

### Requirement: Wallet-rooted identity
The auth system SHALL use the wallet address as the stable user identity root across mobile, DataConnect, Context Gateway, builder-facing APIs, and future surfaces.

#### Scenario: New user signs up
- **WHEN** a user completes mobile signup
- **THEN** the system provisions or resolves a wallet address and uses that wallet address as the canonical cross-surface account subject

### Requirement: Familiar login with invisible wallet creation
The mobile product SHALL support familiar passwordless login, at minimum email or phone, while keeping wallet creation and signing out of the default UX.

#### Scenario: User logs in with a familiar factor
- **WHEN** a user authenticates with email or phone
- **THEN** the product establishes the wallet-rooted Vana identity without requiring the user to understand seed phrases, private keys, or wallet prompts in the default path

### Requirement: Vana-owned session credential
Hosted product sessions SHALL use a Vana-controlled credential, such as a Vana JWT with `sub = walletAddress`, for downstream service access.

#### Scenario: Mobile calls a backend service
- **WHEN** mobile calls a Vana backend, DP RPC adapter, or builder-facing API
- **THEN** it sends a Vana session credential whose canonical subject is the wallet address, not an Oko, Para, Privy, Supabase, email, or phone identifier

### Requirement: Account-domain issuer candidate
The implementation SHALL treat the existing `account.vana.org` / `account-dev.vana.org` surface in `vana-com/vana-connect` as the first candidate home for the Vana identity issuer unless a design explicitly selects a separate service.

#### Scenario: Issuer implementation is planned
- **WHEN** the team designs the Vana identity issuer
- **THEN** the design either extends the existing account-domain surface or documents why a separate `auth.vana.org`, `id.vana.org`, or equivalent service is required

### Requirement: Provider independence
The implementation SHALL keep embedded-wallet provider identifiers out of protocol identity, account lookup, grant identity, and downstream authorization contracts.

#### Scenario: Wallet provider changes
- **WHEN** the embedded-wallet provider is replaced or a second provider is introduced
- **THEN** downstream services continue to key user identity and permissions by wallet address and Vana-issued credentials

### Requirement: Oko feasibility gate
Before Oko is treated as the implementation choice, the team MUST verify that Oko supports the required mobile/browser signing behavior, including silent arbitrary EIP-191 signing for the agreed master-key nonce payload.

#### Scenario: Oko cannot silently sign the required payload
- **WHEN** Oko requires an interactive wallet confirmation for the required refresh/signing path
- **THEN** the auth implementation does not claim Stage 1 readiness without a documented fallback or revised auth design

### Requirement: Account migration boundary
The product SHALL NOT auto-merge or canonicalize accounts by email, phone, provider user id, `privyDid`, `paraDid`, or Oko user id.

#### Scenario: Same email appears under a different wallet
- **WHEN** the same email or provider account resolves to a different wallet address
- **THEN** the system treats it as a distinct account unless an explicit wallet-preserving migration or account-linking flow has been completed
