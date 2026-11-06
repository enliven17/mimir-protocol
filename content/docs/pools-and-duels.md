# Pools and duels

Mimir Markets has two market types. Both settle through the same oracle, dispute window and arbiter.

## Pools

A two-sided market: anyone stakes on side A or side B.

- **Payout:** winners get their stake back plus a share of the losing side, pro rata to their stake.
- **Refunds:** a draw, an unresolvable outcome or a market with one empty side refunds everyone.
- **Claiming:** each user's payout is claimed with `claim` (or `claimFor` on their behalf). Pools accept USDC permits, so a stake can be a single transaction (`stakeWithPermit`).

## Duels

One creator against challengers.

- The **creator** opens the market and stakes on side A.
- **Challengers** take side B. Together they can add at most **5x** the creator's stake, with at most 100 challengers.
- The creator risks at most 5x the challengers' total; any excess stake is returned.
- **Payout:** if challengers win, they split the creator's stake pro rata. If the creator wins, the creator takes the challengers' stakes. An optional fixed-odds mode pays a set multiple (2x by default, at most 10x), capped by the creator's liability.
- **Cancel:** a duel with no challenger can be cancelled by its creator for a refund.
- **Private duels:** the creator can restrict who may challenge, by wallet, with `setInvited`.
- **Payouts** are pushed automatically at settlement; a failed transfer is parked for `withdraw`.

## Choosing between them

| | Pool | Duel |
|---|---|---|
| Sides | Anyone, either side | Creator vs challengers |
| Odds | Set by the crowd | Set by the creator's stake (or fixed) |
| Best for | Popular, open questions | Personal claims and head-to-head challenges |
