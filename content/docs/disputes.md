# Disputes and arbitration

A proposal is a claim, not a verdict. Before it becomes final it can be challenged, and a separate party with no stake in the oracle decides.

## Who can dispute

| Party | Needs a position? | Bond |
|---|---|---|
| A participant in the market | Yes | 2 USDC |
| The [audit agent](/docs/audit-agent) | No | 2 USDC |
| The arbiter | No | 2 USDC |
| The owner (veto) | No | None |

Everyone else is rejected by the contract. One dispute moves the proposal to the arbiter; there is no second round.

## How to dispute

Call `dispute(id)` on the pool contract or `disputeResolution(id)` on the duel contract within the dispute window. The contract pulls exactly 2 USDC (approve first, or use `disputeWithPermit` on pools). The proposal moves to `DISPUTED` and `ResolutionDisputed` is emitted.

## The ruling

Only the **arbiter**, a 2-of-3 Safe, can rule. It calls `resolveDisputeWithCutoff(id, outcome, summary, evidenceHash, cutoff)` and can change the outcome, the cutoff, or both.

| Ruling | Bond |
|---|---|
| Outcome or cutoff changed | Returned to the disputer |
| Proposal upheld | Forfeited to the fee recipient |

`DisputeResolved` records the result and whether the disputer was right.

## If the arbiter never rules

Seven days after the deadline anyone can call `refundExpired`. A disputed market then settles to the **original proposal** and the bond is forfeited. This removes any incentive to dispute a correct answer just to delay or refund a market.

## Veto

Within the dispute window the owner Safe can call `vetoProposal(id)`. It sends the proposal to the arbiter without a bond. If the arbiter never rules on a vetoed proposal, `refundExpired` refunds the market.

## Why the bond

The bond is small enough that anyone with a real objection can afford it, and large enough that disputing correct answers to delay payouts costs money. Because a correct dispute is fully refunded, being right is free.
