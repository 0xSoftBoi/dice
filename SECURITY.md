# Security notes

Educational; **not audited**. `src/Dice.sol` is the hardened rebuild; `GamblingEOS-master/`
is the audited "before" and must not be used.

## Threat model (the rebuild)

- **Predictable randomness** (the original's bug): closed by commit-reveal — the roll
  depends on a `serverSeed` the house committed to before bets and reveals only afterward,
  mixed with a player `clientSeed`. Neither party can predict or steer the result.
- **House steering the seed:** prevented by the pre-commit — `revealSeed` reverts unless the
  seed matches the committed `keccak256(serverSeed)`.
- **House withholding a losing reveal** (last-revealer / observe-and-abort): `commitSeed`
  sets a `revealDeadline`; past it, `claimRevealTimeout` pays every bet in the round as a
  **win**, so withholding can only cost the house. Set `revealWindow` short.
- **Insolvency:** each open bet reserves its maximum house loss in `lockedProfit`; a bet the
  bankroll can't cover reverts, and `withdrawHouse` can't touch reserved funds. So every
  payable win is funded.
- **Reentrancy / payout:** winnings are pull-payment (`winnings[player]` → `withdraw()`),
  `nonReentrant`, CEI.

## Residual / out of scope

- **Trusted house liveness.** The house must commit and reveal honestly and on time; the
  timeout forfeit makes dishonesty costly but assumes someone watches the deadline. A
  griefing house that never commits simply offers no game.
- **`clientSeed` quality.** A player who reuses a trivial `clientSeed` doesn't reduce
  security (the secret is the server seed), but unique client seeds keep rolls independent.
- **VRF alternative.** Chainlink VRF removes the reveal step (the oracle supplies
  unbiasable randomness) at the cost of an oracle dependency + fee; it's the right choice if
  you don't want a house-operated commit-reveal loop. Not wired here — documented seam only.
- **No frontend/Truffle changes.** The legacy React app + `YungBet` are kept as the before,
  not fixed.

## Reporting

No deployment, no funds. Open an issue for a correctness bug (e.g. a roll that disagrees
with `keccak256(serverSeed, clientSeed, betId) % 100`, or an accounting invariant break).
