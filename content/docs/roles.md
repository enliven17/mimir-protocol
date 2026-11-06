# Roles and permissions

Every privileged action belongs to a specific role. Roles are set at deployment, nothing stays with the deploying key, and the contracts refuse role combinations that would concentrate power.

| Role | Held by | Can | Cannot |
|---|---|---|---|
| Owner | 2-of-3 Safe | Pause, set caps, set early locks, veto a proposal, appoint the arbiter and audit agent, queue role changes | Propose outcomes or rule |
| Arbiter | 2-of-3 Safe | Rule on disputed and vetoed proposals | Propose outcomes |
| Oracle | Backend key | Propose outcomes and cutoffs | Rule, move fees, change settings |
| Audit agent | Independent worker key | Open a bonded dispute without a position | Rule, veto, change settings |
| Fee recipient | 2-of-3 Safe | Receive and withdraw fees and forfeited bonds | Anything else |
| Fee signer | Separate key | Sign fee discount tickets (a ticket can only lower a fee) | Anything else |

## Separation rules enforced by the contracts

- The oracle can never be the owner, arbiter or fee recipient (`RoleCollision`).
- The audit agent must differ from the owner, arbiter, oracle and fee recipient.
- On mainnet the deployment refuses missing roles, roles equal to the deployer, and an owner or arbiter that is not a contract (a Safe).

## Timelocks

Changing the oracle, the fee recipient or the owner takes **2 days**: the change is queued with an event, and can be cancelled before it executes. Removing the oracle (`revokeOracle`) is immediate, so a compromised key can be cut off at once.

## Current holders on Base

See [Contracts and addresses](/docs/contracts).
