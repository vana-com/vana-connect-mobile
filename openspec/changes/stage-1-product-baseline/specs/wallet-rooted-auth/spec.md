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

### Requirement: Session refresh independent of silent wallet signing
Routine product session refresh SHALL NOT depend on Oko silently signing arbitrary EIP-191 messages.

#### Scenario: Mobile refreshes a product session
- **WHEN** a signed-in mobile user refreshes a Vana product session
- **THEN** the implementation uses Vana-owned session semantics or a documented delegated/session-key design rather than requiring silent Oko `personal_sign`

### Requirement: Account-domain issuer candidate
The implementation SHALL treat the existing `account.vana.org` / `account-dev.vana.org` surface in `vana-com/vana-connect` as the first candidate home for the Vana identity issuer.

#### Scenario: Issuer implementation is planned
- **WHEN** the team designs the Vana identity issuer
- **THEN** the design evaluates the existing account-domain surface as the issuer home

### Requirement: OIDC-compatible login remains an optimistic non-blocking goal
The identity design SHALL preserve a path to OIDC-compatible "Log in with Vana" while allowing the first wallet-rooted auth implementation to ship without a full OIDC provider if OIDC risks blocking the first integration checkpoint.

#### Scenario: First auth slice uses Vana token exchange
- **WHEN** the first wallet-rooted auth implementation issues Vana sessions
- **THEN** mobile and first-party services MAY use Vana challenge, token exchange, JWT, refresh, and JWKS semantics without requiring OIDC discovery or authorization-code flow

#### Scenario: Standard login client is identified
- **WHEN** an internal app, builder-facing app, or partner integration needs standard OAuth/OIDC consumption
- **THEN** the team defines a follow-up "Log in with Vana" implementation scope before claiming OIDC compatibility

### Requirement: Provider independence
The implementation SHALL keep embedded-wallet provider identifiers out of protocol identity, account lookup, grant identity, and downstream authorization contracts.

#### Scenario: Wallet provider changes
- **WHEN** the embedded-wallet provider is replaced or a second provider is introduced
- **THEN** downstream services continue to key user identity and permissions by wallet address and Vana-issued credentials

### Requirement: Oko signing boundary
The implementation SHALL treat Oko arbitrary EIP-191 signing as user-visible unless Oko provides a documented constrained policy-signing feature.

#### Scenario: Oko requires approval for the required payload
- **WHEN** Oko requires interactive confirmation for `vana-master-key-v1:<nonce>` or another arbitrary payload
- **THEN** the auth implementation does not use that path for routine session refresh

### Requirement: Oko capability boundary
The implementation SHALL NOT depend on Oko EIP-7702 authorization, smart-account wallet APIs, or no-prompt wallet-authority behavior unless those capabilities are explicitly supported by Oko, implemented and owned by Vana in a fork, or replaced by a documented provider migration path.

#### Scenario: Stage 1 needs 7702-style delegated execution
- **WHEN** an implementation design requires EIP-7702 authorization, `wallet_sendCalls`, wallet permissions, or equivalent smart-account behavior
- **THEN** the design identifies whether the capability comes from Oko support, a Vana-owned Oko fork/build, or export/import into a 7702-capable wallet before relying on it

#### Scenario: Self-hosted Oko removes an approval prompt
- **WHEN** Vana modifies Oko signing UI or auto-approves a wallet-authority request
- **THEN** the behavior is backed by prior user consent with explicit scope, audience, expiry or revocation path, and an audit label

### Requirement: Self-custody and provider-detach verification
If the product exposes self-custody, raw key export, or provider migration, the implementation SHALL verify that the exported or imported key controls the same wallet address before representing account continuity.

#### Scenario: Exported key is used for wallet-address continuity
- **WHEN** a user exports or imports wallet material as part of self-custody or provider migration
- **THEN** the system verifies a signature or equivalent wallet proof from the resulting key against the expected wallet address

### Requirement: Delegate consent timing
The implementation MAY ask for wallet-rooted delegate consent during onboarding or defer it until a high-intent action, but it SHALL NOT represent a server or Personal Server delegate as wallet-authorized before a wallet-rooted authorization event exists.

#### Scenario: Delegate consent is deferred
- **WHEN** the user has only completed familiar login and has not approved delegate authority
- **THEN** background product behavior is treated as Vana account/session behavior rather than protocol-authorized delegation

#### Scenario: Delegate consent is collected
- **WHEN** the user approves a Vana server, hosted Personal Server, or other delegate
- **THEN** the authorization records delegate identity, scope, audience, expiry or revocation path, and an audit label

### Requirement: Account migration boundary
The product SHALL NOT auto-merge or canonicalize accounts by email, phone, provider user id, `privyDid`, `paraDid`, or Oko user id.

#### Scenario: Same email appears under a different wallet
- **WHEN** the same email or provider account resolves to a different wallet address
- **THEN** the system treats it as a distinct account unless an explicit wallet-preserving migration or account-linking flow has been completed
