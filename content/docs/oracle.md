# The oracle

The oracle is an off-chain worker that settles markets after their deadline. It runs every two minutes on each chain, holds a single signing key, and can do exactly one thing on chain: **propose** an outcome. It cannot rule on disputes, move fees or change any rule.

## Decision pipeline

For each market past its deadline the oracle goes through these steps in order and stops at the first one that decides.

### 1. Deterministic cases

- A pool with only one side staked is refunded. No model is called, because there is nobody to pay.
- A market linked to a Polymarket market follows that market's on-chain (UMA) resolution. If UMA has not resolved within 72 hours of the deadline, the market is refunded.
- A sports market whose source is an ESPN game page is read as data: if the game is final, the score settles it directly. If it is not final yet, the oracle waits (up to 12 hours after the deadline).

### 2. Evidence

The oracle fetches the market's resolution source fresh at settlement time. The page text is passed to the model inside a fenced, untrusted block, so instructions hidden in a web page cannot steer the decision.

If the source cannot be read, the oracle retries. After 6 hours without evidence the market is refunded.

### 3. Price questions

A question about a price at a time needs **two independent readings** at the deadline from different providers (CoinGecko, CoinMarketCap, Chainlink, DexScreener or Pyth).

- Both on the same side of the threshold: the answer is clear.
- They straddle the threshold: the market is **unresolvable** and everyone is refunded, rather than settling on a coin flip.
- Fewer than two readings within 6 hours of the deadline: refunded.

### 4. Model decision

A settlement-grade model, from an allowlist of approved models, answers the **original question as written**. Shortcuts supplied by the market creator (for example a JSON field to read) cannot replace this evaluation. The model returns an outcome, a confidence score, an eligibility cutoff and its reasoning.

### 5. Confidence gate

| Confidence | Action |
|---|---|
| 80% or more | Propose the outcome |
| 60% to 79% | Propose the outcome, marked contested |
| Below 60% | Refund everyone |

Missing or ambiguous evidence is never guessed: the market is deferred and tried again 10 minutes later.

### 6. Seal and propose

Everything the decision rested on is written into an [evidence bundle](/docs/evidence). Its sha256 hash is sent on chain with the proposal.

## Keys and isolation

- One oracle key signs on every chain. The contracts refuse to make it the owner, arbiter or fee recipient.
- The oracle's model credentials are reserved for settlement; no other part of the system can spend them.
- The owner can revoke the oracle instantly with `revokeOracle`. Appointing a new oracle takes a 2-day timelock.

## What the oracle does not do

- It does not decide disputes. Only the [arbiter](/docs/disputes) can rule.
- Its answer is not final until the [dispute window](/docs/disputes) closes.
