# Evidence and sealing

Every proposal is backed by an **evidence bundle**: a structured record of everything the oracle's decision rested on. The bundle is hashed with sha256 over its canonical JSON, and that hash is the `evidenceHash` written on chain with the proposal.

## What the bundle contains

| Field | Contents |
|---|---|
| `claim` | The question, both sides, the resolution source, category and deadline, as read from the contract |
| `evidence` | The text fetched from the source and which fetcher read it |
| `prices` | For price questions: the symbol, threshold and every reading with its source and timestamp |
| `resolver` | For deterministic cases (ESPN, Polymarket): what was read and the rule applied |
| `model` | The model that decided |
| `rawVerdict` | The model's answer before any adjustment |
| `adjustments` | Every rule applied afterwards, such as the confidence gate |
| `finalVerdict` | The outcome, confidence and explanation that were proposed |
| `decidedAt` | When the decision was made |

## Why it matters

- **Accountability.** The hash on chain commits the oracle to one specific record. A different explanation produced later would not match it.
- **Reviewability.** Disputers, the audit agent and the arbiter can see exactly which source text and readings the decision used, and where it went wrong.
- **Isolation of mistakes.** Because the inputs are recorded, a bad source, a misread score or a model error can be told apart.

The market page shows the verdict and its explanation; the contract stores the hash in the proposal (`getProposal(id)`) and in the `ResolutionProposed` event.
