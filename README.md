# dice — a fake dice game, audited, and the real one built

This repo is a 2018 "GamblingEOS" upload (a React frontend + a Truffle project). Its only
on-chain contract, [`GamblingEOS-master/solidity/contracts/YungBet.sol`](GamblingEOS-master/solidity/contracts/YungBet.sol),
is a dice game that doesn't roll dice. `src/Dice.sol` is the provably-fair version it
pretends to be. Write-up: [*Anatomy of a fake dice game*](https://0xsoftboi.github.io/blog/anatomy-of-a-fake-dice-game/).

## The audit — `YungBet.sol` (48 lines, two fatal bugs)

```solidity
function RandomNumber() public returns(uint) {
    ...
    random_number = uint(keccak256(abi.encodePacked(blockhash(block.number), ...)));
}
function makeBet() public payable {
    uint bet_roll = RandomNumber();
    uint bet_payout = bet_amount.div(2);   // <- the roll is never used
    user.transfer(bet_payout);
}
```

1. **`blockhash(block.number)` is always `0`.** A contract can't read the hash of the block
   it's executing in (only the previous 256). So the "randomness" collapses to
   `keccak256(0, total_bets[msg.sender])` — fully deterministic from the caller's own bet
   counter, predictable before betting. This is the SmartBillions / EOSPlay class of
   predictable-randomness bug.
2. **The roll is never used.** `bet_payout = bet_amount / 2`, paid regardless of `bet_roll`.
   It's not a game — it's a guaranteed 50% drain that computes a random number for show.

So `YungBet` has no win condition and broken randomness even if it did. (Also: `^0.4.23`,
`RandomNumber()` left `public`, no bankroll/edge model.)

## The rebuild — `src/Dice.sol` (provably fair)

There is **no safe single-transaction randomness on the EVM** — that's the whole lesson —
so the real game uses **commit-reveal**:

- The **house commits** `keccak256(serverSeed)` *before* any bet references it, so it can't
  choose the seed after seeing bets.
- A **bet** carries a player-chosen `clientSeed`; the roll is
  `keccak256(serverSeed, clientSeed, betId) % 100`, so neither side can predict or steer it
  (house can't pick the seed late; player can't see it early).
- The **roll decides the outcome** — `rollUnder` a target, paid with an explicit house edge
  (`multiplier = (100/target)·(1 − edge)`; a 50/50 bet pays 1.96×, not 2×).
- The residual footgun is the **house withholding a losing reveal** (the last-revealer /
  observe-and-abort problem). `claimRevealTimeout` closes it: miss the reveal deadline and
  every bet pays as a **win**, so withholding is strictly worse than revealing.
- **Solvency:** the house bankroll reserves each open bet's max loss (`lockedProfit`); a bet
  it can't cover is rejected, and the house can't withdraw reserved funds. Pull-payment +
  `ReentrancyGuard`.

A **VRF** (e.g. Chainlink) is the oracle alternative to commit-reveal — documented in
[SECURITY.md](SECURITY.md), not wired here.

## Build & test

```bash
forge test     # 7 tests: edge math, roll-decides-outcome, commit-reveal binding,
               # can't-settle-before-reveal, reveal-timeout forfeit, bankroll cap, locked funds
```

The `GamblingEOS-master/` directory is preserved as the audited "before"; `src/` + `test/`
are the rebuild. Not audited; educational. [MIT](LICENSE).
