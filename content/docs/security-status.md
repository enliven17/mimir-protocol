# Testing and audits

## Status

- **No independent external audit yet.** Stake caps stay low until one is completed.
- Internal security reviews: two rounds in October 2026, and a pre-mainnet audit pass in November 2026. Every finding was fixed before the Base mainnet deployment.
- All contracts are open source and verified on Sourcify (exact match).

## Testing

- **288 Foundry tests** covering every market path, fee and role rule.
- **Invariant suites:** the escrow always covers what it owes, payouts never exceed the pot, no winner receives less than their net stake, copy fees are charged only on profit.
- **Adversarial tests:** reentrancy attempts, smart-account callers, dispute and veto edge cases, paused-state refunds, late deposits.
- **Fork tests** against the real Base USDC contract and a real Safe: permit, staking, disputes, Safe rulings, caps and pause.
- **Testnet rehearsal:** the full lifecycle on Base Sepolia, including an audit-agent dispute of a deliberately wrong proposal and the arbiter's ruling.

## Known limits

- The oracle and the audit agent are AI systems and can be wrong. Disputes and the arbiter exist for that reason.
- Evidence comes from public sources. A source that publishes wrong data can mislead both AI systems; the dispute window is the protection.
- The arbiter is a 2-of-3 Safe controlled by the Mimir team.
