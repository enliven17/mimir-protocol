# Fees and limits

## Fees

| Fee | Amount | Paid to |
|---|---|---|
| Entry fee | 0.5% of each stake, taken on entry; hard cap 1% in the contracts | Fee recipient (treasury Safe) |
| Copy trading | On a copied position that wins: 1% of net profit to the copied trader, 1% to Mimir | Referrer and fee recipient |
| Wrong dispute | The 2 USDC bond | Fee recipient |
| Winnings | None | |

Entry fees are kept on refunds. Copy fees are charged only on profit from the copied stake, never on a loss or on the user's own uncopied stake.

## Limits

| Limit | Value |
|---|---|
| Minimum stake | 0.1 USDC on Base (set at deployment, between 0.01 and 100 USDC) |
| Stake caps (launch) | 500 USDC per market, 50 USDC per account; owner-adjustable with `setCaps` |
| Lock | Staking closes 60 seconds before the deadline, or earlier with `setLockAt` |
| Deadline | At most 365 days ahead |
| Dispute window | 24 hours on Base mainnet (minimum 1 day, maximum 7 days) |
| Dispute bond | 2 USDC |
| Escape hatch | 7 days after the deadline |
| Duel size | Challengers up to 5x the creator's stake, at most 100 challengers |
| Fixed odds | At most 10x |

Caps apply only to new stakes. Amounts are in Circle USDC with 6 decimals.
