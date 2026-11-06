# Contracts and addresses

Base mainnet, chain ID 8453. Sources are verified on Sourcify. All amounts are in Circle USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`, 6 decimals).

## Addresses

| Contract | Address |
|---|---|
| MimirPoolErc20 (pools) | [`0xA8f252C32C8FDdA55dB5Bb93CC4728009397B84d`](https://basescan.org/address/0xA8f252C32C8FDdA55dB5Bb93CC4728009397B84d) |
| MimirV3Erc20 (duels) | [`0x53e61F4A4651Ba2ac5DeCf243085c5b3Fae9aE68`](https://basescan.org/address/0x53e61F4A4651Ba2ac5DeCf243085c5b3Fae9aE68) |
| MimirFees | [`0xED114f539384ec22c4FB8BDf440b027a63193Ae4`](https://basescan.org/address/0xED114f539384ec22c4FB8BDf440b027a63193Ae4) |
| MimirAgentPay | [`0x6EBe690261946d915880c295A30Cd711BFE1F1f5`](https://basescan.org/address/0x6EBe690261946d915880c295A30Cd711BFE1F1f5) |

## Roles

| Role | Address |
|---|---|
| Owner, arbiter, fee recipient (2-of-3 Safe) | [`0x5b3Cd4D9E2ab1Cc1317bD274aa19ED92D60e12C1`](https://basescan.org/address/0x5b3Cd4D9E2ab1Cc1317bD274aa19ED92D60e12C1) |
| Oracle | [`0x651216ed682cDaa06EfaAc332AaD7a7Bc9f4F7c4`](https://basescan.org/address/0x651216ed682cDaa06EfaAc332AaD7a7Bc9f4F7c4) |
| Audit agent | [`0x9935d7d3F0Dd8e8024d844e2d63Ae33C69B9BE69`](https://basescan.org/address/0x9935d7d3F0Dd8e8024d844e2d63Ae33C69B9BE69) |

## Pool functions

| Function | Who | Purpose |
|---|---|---|
| `createMarket` / `createMarketWithPermit` | Anyone | Open a pool with the creator's first stake |
| `stake` / `stakeWithPermit` | Anyone | Stake on side 1 or 2 |
| `resolveWithCutoff` | Oracle | Propose outcome, evidence hash and cutoff |
| `dispute` / `disputeWithPermit` | Participant, audit agent, arbiter | Dispute with the 2 USDC bond |
| `resolveDisputeWithCutoff` | Arbiter | Rule on a dispute |
| `finalize` | Anyone | Finalize after an undisputed window |
| `claim` / `claimFor` | Anyone | Pay out a user |
| `refundExpired` | Anyone | Escape hatch after 7 days |

Read: `getMarket`, `getMarketText`, `getProposal`, `settlementCutoff`, `eligibleTotals`, `eligibleStakeOf`, `claimable`, `stakeOf`.

## Duel functions

| Function | Who | Purpose |
|---|---|---|
| `createClaim` | Anyone | Open a duel with the creator's stake |
| `challengeClaim` | Anyone (or invited wallets) | Take the other side |
| `cancelClaim` | Creator | Cancel before any challenge |
| `resolveClaimWithCutoff` | Oracle | Propose outcome, confidence, evidence hash and cutoff |
| `disputeResolution` | Participant, audit agent, arbiter | Dispute with the 2 USDC bond |
| `resolveDisputeWithCutoff` | Arbiter | Rule on a dispute |
| `finalizeResolution` | Anyone | Finalize and push payouts |
| `withdraw` | Anyone | Pull a parked payout |
| `refundExpired` | Anyone | Escape hatch after 7 days |

Read: `getClaim`, `getChallengerList`, `settlementCutoff`, `eligibleTotals`, `invited`.

## Events

| Event | Emitted when |
|---|---|
| `MarketCreated` / `ClaimCreated` | A market opens |
| `Staked` / `ClaimChallenged` | A position is taken |
| `ResolutionProposed` | The oracle proposes (includes `evidenceHash`, `disputableUntil`) |
| `SettlementCutoffSet` | A cutoff is proposed or ruled |
| `ResolutionDisputed` | A proposal is disputed or vetoed |
| `DisputeResolved` | The arbiter rules (includes whether the disputer was right) |
| `MarketResolved` / `ClaimResolved` | The outcome is final |
| `Claimed` / `MarketSettled` | Payouts are made |
| `AuditAgentChanged` | The audit agent is appointed or replaced |

## Outcome codes

| Code | Pools | Duels |
|---|---|---|
| 1 | Side A | Creator |
| 2 | Side B | Challengers |
| 3 | Draw | Draw |
| 4 | Unresolvable | Unresolvable |

## Arc

Arc mainnet runs an earlier version of these contracts (MimirV3 `0x48fae6d68e88591ea874c2da2a4efc521d0b7fb0`, MimirPool `0xc3155fa17b7b902140bf6f0969ffa56d8ce3b1b0`). It will move to the current version in a later upgrade.
