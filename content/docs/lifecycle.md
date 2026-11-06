# Market lifecycle

A market moves through a fixed sequence of states. Every transition is a contract call that anyone can verify on chain.

## 1. Open

The market is created with its terms and the creator's stake. Anyone can take a position until the **lock**: 60 seconds before the deadline, or earlier if the creator or owner set an early lock (for example at kickoff) with `setLockAt`.

A duel with no challengers can be cancelled by its creator, who is refunded.

## 2. Waiting for the deadline

After the lock no new stakes are accepted. The oracle starts working once the deadline has passed.

## 3. Proposed

The oracle calls `resolveWithCutoff` (pools) or `resolveClaimWithCutoff` (duels) with:

- the outcome,
- a confidence score (duels),
- the sha256 hash of the evidence bundle,
- the eligibility cutoff.

The contract emits `ResolutionProposed` with `disputableUntil`, and `SettlementCutoffSet`.

## 4. Dispute window

For the length of `disputeWindow` (24 hours on Base mainnet) the proposal can be disputed with a 2 USDC bond by:

- anyone holding a position in the market,
- the registered audit agent,
- the arbiter.

The owner can also **veto** a proposal, which sends it to the arbiter without a bond.

## 5. Ruling (only if disputed)

The arbiter calls `resolveDisputeWithCutoff` with the final outcome and cutoff. See [Disputes and arbitration](/docs/disputes).

## 6. Resolved and paid

When the window closes without a dispute, anyone can call `finalize` (pools) or `finalizeResolution` (duels). After a ruling the market is resolved directly.

- **Duels** push payouts to every participant. A transfer that fails is parked and can be pulled with `withdraw`.
- **Pools** pay each user through `claim` or `claimFor`. Mimir's backend claims on users' behalf; anyone can also claim directly.

## Escape hatch

Seven days after the deadline anyone can call `refundExpired`:

| Situation | Result |
|---|---|
| Never proposed | Full refund |
| Proposed, then paused and never disputed | Full refund (seven days after the proposal) |
| Disputed, arbiter never ruled | Settles to the original proposal; the bond is forfeited |
| Vetoed, arbiter never ruled | Full refund |

Once the escape hatch is open, late proposals and rulings revert. Funds can never be stuck waiting for the oracle.

## States

| Pools | Duels |
|---|---|
| `OPEN` | `OPEN` (no challenger yet), `ACTIVE` (challenged) |
| `PROPOSED` | `PROPOSED` |
| `DISPUTED` | `DISPUTED` |
| `RESOLVED` | `RESOLVED` |
| | `CANCELLED` |
