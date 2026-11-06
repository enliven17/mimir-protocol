# Emergency controls

## Pause

The owner can pause a market contract with `setPaused(true)`.

| Stopped while paused | Still works while paused |
|---|---|
| New markets and stakes | Cancelling an unchallenged duel |
| Proposals and finalization | Refunds (draws, empty sides, unresolvable) |
| Rulings | `withdraw` of parked payouts |
| Payouts of winnings | `refundExpired` |

While paused, `refundExpired` refunds every stake instead of honouring a proposal, and returns any dispute bond. A proposal that was never disputed can be refunded seven days after it was made. Pausing can stop payouts, but it can never trap funds.

## Revoke the oracle

`revokeOracle()` removes the oracle immediately. Pending markets wait for a new oracle (2-day timelock) or reach the escape hatch.

## Veto

Inside the dispute window the owner can send any proposal to the arbiter with `vetoProposal(id)`, without a bond.

## Caps and early lock

`setCaps(maxMarketStake, maxAccountStake)` limits exposure for new stakes. `setLockAt(id, at)` closes a market early, for example at kickoff; it can only move the lock earlier.
