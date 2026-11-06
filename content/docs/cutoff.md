# Eligibility cutoff

Some outcomes become known before a market's deadline. A match kicks off, a price is measured at a set time, an event happens early. Money staked after that point would be betting on a known result. The eligibility cutoff prevents it.

## How it works

With every proposal the oracle also proposes a **settlement cutoff**, a timestamp:

| Question type | Cutoff |
|---|---|
| Scheduled event (match, race, election, show) | The event's start time |
| "Will X happen by date D?" | When X happened |
| Price at a set time | The measurement time |
| No time established by the evidence | `0` (no exclusion) |

Only deposits made **strictly before** the cutoff compete. A deposit at or after it is late.

## What happens to late deposits

- Late principal is refunded at face value, with no profit.
- It never funds someone else's prize and is not counted as a win or a loss.
- Earlier stakes settle normally. If only the late stakes were on one side, the earlier stakes on the other side are refunded, because there was no eligible opposition.
- Entry fees, as on any refund, are kept.

Example: Alice stakes 10 USDC on A and Bob 10 USDC on B before kickoff. Bob adds 2 USDC on B after kickoff. If A wins, Alice receives 20 USDC (before fees) and Bob gets his late 2 USDC back; his earlier 10 USDC still loses.

## On-chain accounting

The contracts compute eligible amounts from their own deposit history (`eligibleTotals(id)`, and `eligibleStakeOf(id, user)` for pools), never from an off-chain index. The cutoff is recorded with `SettlementCutoffSet(id, cutoff)`.

The audit agent checks the cutoff as well as the outcome, and the arbiter can correct either one. A dispute that changes only the cutoff is a correct dispute and its bond is returned.
