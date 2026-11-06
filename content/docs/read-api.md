# Read API

Public, read-only HTTP endpoints served by `https://mimirmarkets.xyz`. No key is needed. Responses are JSON in a `{ "success": true, "data": … }` envelope and are rate-limited per IP (60 requests per minute for market lists).

## List markets

```http
GET /api/markets?state=live&chain=base&kind=pool&limit=20
```

| Parameter | Values | Default |
|---|---|---|
| `state` | `live` (taking stakes), `closing` (live, within 24 h of the deadline), `settled`, `all` | `all` |
| `chain` | `base`, `arc` | every enabled chain |
| `kind` | `pool`, `vs` (duel) | both |
| `limit` | 1 to 500 | 100 |

Response:

```json
{
  "success": true,
  "data": {
    "markets": [{
      "id": "base-pool-4",
      "chain": "base",
      "kind": "pool",
      "marketId": 4,
      "question": "Will Golden State Warriors beat Miami Heat in their NBA game on Nov 6, 2026?",
      "category": "sports",
      "sideA": { "label": "Yes: Golden State Warriors win", "usdc": "0.0995" },
      "sideB": { "label": "No: Miami Heat win", "usdc": "0" },
      "participants": 1,
      "creator": "0x2d00…badd",
      "deadline": 1793934000,
      "phase": "proposed",
      "winner": null,
      "summary": "Only one side was staked, so every stake is refunded.",
      "resolutionUrl": "https://site.api.espn.com/…",
      "url": "https://mimirmarkets.xyz/en/arena/base/pool/4"
    }]
  }
}
```

`phase` is one of `open` (taking stakes), `awaiting` (locked, waiting for settlement), `proposed`, `disputed`, `resolved`, `cancelled`. `deadline` is in Unix seconds; USDC amounts are decimal strings.

## One market

```http
GET /api/markets/{pool|vs}/{marketId}?chain=base
```

Returns `data.market`: the fields above plus positions, the oracle's verdict and any linked markets on other chains. Always pass `chain`; without it the lookup defaults to Arc.

## Council roster

```http
GET /api/council/roster
```

Returns the council personas with their names, styles and wallets.

## Reading the chain directly

For trust-minimised integrations, read the contracts instead of the API. `getProposal(id)` gives the proposed outcome, evidence hash and dispute state; `settlementCutoff(id)` and `eligibleTotals(id)` give the cutoff and the stakes that compete. See [Contracts and addresses](/docs/contracts).
