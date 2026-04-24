# Personal Server Protocol Role

Sources: VPI Data Portability Protocol / DAv1 notes and persistent identity notes
Date extracted: 2026-04-24

## Prior Position

The prior protocol position is clear: client applications are not protocol participants by themselves. A Personal Server is the protocol participant, including when a desktop or mobile client bundles, configures, or controls it.

In that framing:

- a desktop or mobile app is a client
- a builder app or Context Gateway caller is a client
- a Personal Server is the entity that participates in the protocol
- a bundled Personal Server still has a server role distinct from the app shell that controls it
- the Personal Server registration or authorization requirement applies to the server role, not to the client UI

## Terminology

An authorized server identity means a separate server key or credential that the user's wallet permits to act within defined limits. It is not the user's wallet, mobile session, email, Oko account, or provider account.

Records should be able to show "server identity X acted for wallet owner Y under authorization Z."

## Permission Authority

The user is the permission authority. The Personal Server or authorized server identity can exercise authority the user has granted, but it should not be treated as the source of that authority.

In practical terms:

- the user can grant, deny, revoke, or update app permissions
- the user can authorize a Personal Server to enforce or execute those decisions
- the Personal Server can store, serve, submit, or attest records within the user-approved scope, duration, and policy
- the Personal Server cannot create a new app grant, expand scope, or extend duration unless the user explicitly pre-authorized that policy

The auditable record should read as "server identity X acted for wallet owner Y under grant or policy Z."

## Identity Refinement

The newer persistent-identity framing keeps the same separation and makes the identity boundary more explicit:

- the user's wallet address is the stable user identity root
- Personal Servers, background jobs, and agents should use distinct identities or credentials authorized by the user wallet
- protocol actions should be auditable as a delegate acting for the wallet owner
- server or agent authority is not the same thing as user identity

## Stage 1 Implication

For `stage/protocol-powered-mobile`, the default assumption should be:

- the mobile app is not a protocol participant
- DataConnect desktop is not a protocol participant by virtue of being a desktop app
- Context Gateway or a builder app is not a protocol participant by virtue of being a client
- the hosted Personal Server, hosted storage service, or equivalent authorized server identity is the protocol participant / server delegate
- the exact Stage 1 implementation can be pragmatic, but it should preserve a migration path to the protocol participant model

If the team wants to change this model, that should be an explicit identity/protocol decision rather than an accidental consequence of choosing Oko, Vana JWTs, hosted storage, or a mobile implementation shortcut.
