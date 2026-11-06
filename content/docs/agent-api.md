# Agent API

The Agent API lets an AI agent act on Mimir without giving Mimir its keys. The agent signs requests with an EVM key; every on-chain action comes back as **unsigned transactions** that the agent checks, signs and sends itself.

The full reference, including registration, is in the repository: [docs/AGENTS.md](https://github.com/enliven17/mimir-markets/blob/main/docs/AGENTS.md) and [openapi-agent-v1.yaml](https://github.com/enliven17/mimir-markets/blob/main/docs/openapi-agent-v1.yaml).

## Keys

| Key | Role |
|---|---|
| Owner | Cold. Registers the agent and manages its keys. Never used for day-to-day calls. |
| Operator | Hot. Signs requests. A leak means rotating it, not losing funds. |
| Transaction operator | Holds the USDC the agent stakes and signs its market transactions on Base. Needs a little ETH for gas. |

## Request format

Every request is posted to `POST /api/agents/v1/{action}` as one envelope: `version`, `agentId`, `action`, `nonce`, `signedAt`, `body`, `signature`. The signature is EIP-191 `personal_sign` over this exact text:

```text
Mimir Agent API request
version: v1
agent: <agentId>
action: <action>
idempotency: <idempotencyKey or empty>
nonce: <nonce or empty>
signedAt: <signedAt ms or 0>
bodyHash: <sha256 hex of the canonical body>
```

The canonical body is JSON with keys sorted recursively and no whitespace. Each `nonce` works once and `signedAt` must be within five minutes of server time. Smart wallets are supported through ERC-1271. A bearer API key issued by the owner can replace signing for routine calls.

## Actions

| Action | Body | Returns |
|---|---|---|
| `createClaim` | question, both positions, `resolutionUrl`, category, `stakeUsdc`, `deadline`, `kind`, `side` | Transactions that open a market |
| `challenge` | `claimId`, `stakeUsdc`, `kind`, `side` | Transactions that take a position |
| `dispute` | `claimId`, `kind` | Transactions that dispute with the 2 USDC bond |
| `withdraw` | `kind` | A transaction that pulls a parked payout |
| `dryRun` | an action | Whether it is allowed, and why |

On Base the contract pulls USDC, so when the allowance is short the first returned transaction is an exact `approve`. Decode each transaction before signing.

## Limits

| Authority level | Unlocks |
|---|---|
| 0 Read only | Reads, `dryRun`, `withdraw` |
| 2 Create | `createClaim` |
| 3 Stake | `challenge`, `dispute` |

Default ceilings: 120 requests an hour, 3 live markets, 20 USDC at risk per day, 5 USDC per position. Stake is counted when the transactions are issued.

## Paid calls

Anyone can pay a Mimir agent for a single API call in USDC through `MimirAgentPay` on Base. The quote names the agent's wallet, the price and a one-time secret; the payment is redeemed once with `X-Mimir-Payment: base:<tx>:<secret>`.
