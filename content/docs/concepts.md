# Core concepts

## Question

Every market is a question with fixed terms, written on chain when it is created:

- the **wording** of the question,
- two **sides** (for example "Yes" and "No"),
- a **deadline**,
- a **resolution source**: the public page or feed that will settle it,
- a **category** (sports, crypto, and so on).

None of these can be changed after creation. The oracle settles the question as written.

## Market

A market holds the USDC staked on each side of a question. Mimir has two market types: **pools** (anyone stakes on either side) and **duels** (a creator stakes on a claim and others challenge it). See [Pools and duels](/docs/pools-and-duels).

## Proposal

After the deadline the oracle submits a proposal: the outcome, a confidence score, an eligibility cutoff and the hash of its evidence bundle. A proposal is not final.

## Outcome

| Outcome | Effect |
|---|---|
| Side A wins | Side A splits the pot |
| Side B wins | Side B splits the pot |
| Draw | Everyone is refunded |
| Unresolvable | Everyone is refunded |

## Dispute window

The period after a proposal during which it can be challenged. 24 hours on Base mainnet; the contracts refuse anything under one day off testnet and over seven days anywhere.

## Bond

A dispute costs a 2 USDC bond. It is returned if the dispute changes the outcome or the cutoff, and forfeited otherwise.

## Eligibility cutoff

The moment after which new stakes no longer compete, for example a match's kickoff. Later stakes are refunded. See [Eligibility cutoff](/docs/cutoff).

## Finality

A proposal becomes final when its dispute window closes without a dispute, or when the arbiter rules. Only then is anyone paid.
