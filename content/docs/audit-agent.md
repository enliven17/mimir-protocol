# Audit agent

The audit agent is a second, independent AI that re-checks every oracle proposal and disputes the ones it believes are wrong. It exists so that a model error has to happen twice, in two unrelated systems, to reach users' money.

## Independence

- **Separate operation.** It runs on its own host with its own environment and credentials. It never imports the oracle's code path or reads its cache.
- **Separate model.** It is configured with a different model provider from the oracle, so their errors are less likely to coincide.
- **Blind review.** It reads the question, sides and source directly from the contract and fetches fresh evidence. The oracle's answer and cutoff are deliberately left out of its prompt.
- **Separate key.** Its address is registered on each market contract with `setAuditAgent` by the owner Safe. It must differ from the owner, arbiter, oracle and fee recipient.

## When it disputes

It compares its own answer and cutoff with the proposal and disputes only when:

- it disagrees on the outcome or on the cutoff, and
- its confidence is **90% or more**, backed by evidence.

Missing or ambiguous evidence, or an unresolvable answer, never triggers a dispute; the proposal is reviewed again later. A cutoff difference on a draw is ignored, because a draw refunds everyone anyway.

## What it can and cannot do

| Can | Cannot |
|---|---|
| Open the standard bonded dispute without holding a position | Rule on a dispute |
| Pay the same 2 USDC bond as anyone else | Veto, pause or change any setting |
| | Move any funds other than its own bond |

## Operational safeguards

- Before paying a bond it re-checks its role, the proposal and the chain time.
- Bond approvals are for the exact amount.
- Transaction hashes are stored, so a transaction with an unknown result is never blindly sent again.
- It reads the chain in small block ranges with an overlap, and treats a dispute as provisional until its block is confirmed canonical.
- Every review is kept as a report keyed by the proposal, for the arbiter.

## Limits

The audit agent can be wrong, too: it can miss a bad proposal or flag a good one. That is why its only power is to open a dispute, and why the decision stays with the arbiter.
