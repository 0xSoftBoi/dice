// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Dice — a provably-fair on-chain dice game
/// @notice The real version of the broken `YungBet` in this repo, whose randomness was
///         `blockhash(block.number)` (always 0 → predictable) and whose roll was never even
///         used to decide the payout. Here:
///
///         - There is no safe single-transaction EVM randomness, so the house **commits**
///           to a server seed (`keccak256(serverSeed)`) BEFORE any bet references it, and
///           **reveals** it afterwards. The roll mixes the revealed server seed with a
///           player-chosen `clientSeed` and the bet id, so neither side can predict or
///           steer it: the house can't choose the seed after seeing bets (it's committed),
///           and the player can't predict it (the seed is secret until reveal).
///         - The remaining footgun is the *house* withholding a losing-for-it reveal — the
///           last-revealer / observe-and-abort problem. `claimRevealTimeout` closes it: if
///           the house doesn't reveal by the deadline, every bet in the round is paid as a
///           **win**, so withholding is strictly worse for the house than revealing.
///         - The roll actually decides the outcome, with an explicit house edge.
///
///         A VRF (e.g. Chainlink) is the oracle alternative to commit-reveal; see README.
contract Dice is Ownable, ReentrancyGuard {
    // --- house economics ---
    uint16 public houseEdgeBps = 200;        // 2% edge
    uint256 public revealWindow = 1 hours;    // house must reveal within this of committing
    uint256 public bankroll;                  // house funds backing payouts
    uint256 public lockedProfit;              // sum of outstanding max house-loss across open bets

    // --- rounds (one commit/reveal serves many bets) ---
    uint256 public currentRound;
    bool public roundOpen;
    mapping(uint256 => bytes32) public seedHash;       // round => committed keccak256(serverSeed)
    mapping(uint256 => bytes32) public revealedSeed;   // round => serverSeed (after reveal)
    mapping(uint256 => bool) public revealed;          // round => revealed?
    mapping(uint256 => uint64) public revealDeadline;  // round => deadline

    // --- bets ---
    struct Bet {
        address player;
        uint256 stake;
        uint8   target;       // rollUnder in [2,99]; win iff roll < target
        bytes32 clientSeed;   // player entropy
        uint256 round;
        bool    settled;
    }
    uint256 public betCount;
    mapping(uint256 => Bet) public bets;

    mapping(address => uint256) public winnings; // pull-payment

    event SeedCommitted(uint256 indexed round, bytes32 seedHash, uint64 revealDeadline);
    event SeedRevealed(uint256 indexed round, bytes32 serverSeed);
    event BetPlaced(uint256 indexed betId, address indexed player, uint256 stake, uint8 target, uint256 round);
    event BetSettled(uint256 indexed betId, uint256 roll, bool win, uint256 payout);
    event RevealTimeoutClaimed(uint256 indexed betId, uint256 payout);

    error RoundClosed();
    error RoundStillOpen();
    error BadTarget();
    error ZeroStake();
    error InsufficientBankroll();
    error BettingClosed();
    error BadSeed();
    error AlreadySettled();
    error NotRevealed();
    error AlreadyRevealed();
    error NotYetTimedOut();

    constructor() Ownable(msg.sender) {}

    // --- house funding ---
    function fund() external payable onlyOwner {
        bankroll += msg.value;
    }

    function withdrawHouse(uint256 amount) external onlyOwner nonReentrant {
        // can't withdraw funds reserved against open bets
        if (amount > bankroll - lockedProfit) revert InsufficientBankroll();
        bankroll -= amount;
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "transfer failed");
    }

    function setHouseEdge(uint16 bps) external onlyOwner {
        require(bps <= 1000, "edge too high"); // <=10%
        houseEdgeBps = bps;
    }

    // --- round lifecycle ---
    /// @notice House commits keccak256(serverSeed) for a new round. Requires the previous
    ///         round to be revealed first, so a withheld round can't be papered over.
    function commitSeed(bytes32 hash) external onlyOwner {
        if (roundOpen) revert RoundStillOpen();
        currentRound += 1;
        seedHash[currentRound] = hash;
        revealDeadline[currentRound] = uint64(block.timestamp + revealWindow);
        roundOpen = true;
        emit SeedCommitted(currentRound, hash, revealDeadline[currentRound]);
    }

    /// @notice House reveals the server seed; must match the commitment.
    function revealSeed(bytes32 serverSeed) external onlyOwner {
        if (!roundOpen) revert RoundClosed();
        uint256 r = currentRound;
        if (revealed[r]) revert AlreadyRevealed();
        if (keccak256(abi.encodePacked(serverSeed)) != seedHash[r]) revert BadSeed();
        revealedSeed[r] = serverSeed;
        revealed[r] = true;
        roundOpen = false;
        emit SeedRevealed(r, serverSeed);
    }

    // --- betting ---
    /// @notice Bet `msg.value` that a 0..99 roll comes in under `target`. `clientSeed` is
    ///         your entropy, mixed into the roll so the house can't steer it.
    function placeBet(uint8 target, bytes32 clientSeed) external payable returns (uint256 betId) {
        if (!roundOpen) revert BettingClosed();
        if (block.timestamp >= revealDeadline[currentRound]) revert BettingClosed();
        if (target < 2 || target > 99) revert BadTarget();
        if (msg.value == 0) revert ZeroStake();

        uint256 payout = _payout(msg.value, target);
        uint256 profit = payout - msg.value; // max the house can lose on this bet
        if (lockedProfit + profit > bankroll) revert InsufficientBankroll();
        lockedProfit += profit;

        betId = betCount++;
        bets[betId] = Bet({
            player: msg.sender,
            stake: msg.value,
            target: target,
            clientSeed: clientSeed,
            round: currentRound,
            settled: false
        });
        emit BetPlaced(betId, msg.sender, msg.value, target, currentRound);
    }

    /// @notice Settle a bet once its round's seed is revealed. Permissionless.
    function settleBet(uint256 betId) external {
        Bet storage b = bets[betId];
        if (b.settled) revert AlreadySettled();
        if (!revealed[b.round]) revert NotRevealed();

        uint256 roll = uint256(
            keccak256(abi.encodePacked(revealedSeed[b.round], b.clientSeed, betId))
        ) % 100;
        bool win = roll < b.target;

        uint256 payout = _payout(b.stake, b.target);
        uint256 profit = payout - b.stake;
        b.settled = true;
        lockedProfit -= profit;

        if (win) {
            bankroll -= profit;               // house pays the profit; stake is returned within payout
            winnings[b.player] += payout;
        } else {
            bankroll += b.stake;              // house keeps the stake
        }
        emit BetSettled(betId, roll, win, win ? payout : 0);
    }

    /// @notice If the house didn't reveal by the deadline, the bet is paid as a WIN — so
    ///         withholding a losing reveal can never help the house.
    function claimRevealTimeout(uint256 betId) external {
        Bet storage b = bets[betId];
        if (b.settled) revert AlreadySettled();
        if (revealed[b.round]) revert AlreadyRevealed();
        if (block.timestamp <= revealDeadline[b.round]) revert NotYetTimedOut();

        uint256 payout = _payout(b.stake, b.target);
        uint256 profit = payout - b.stake;
        b.settled = true;
        lockedProfit -= profit;
        bankroll -= profit;
        winnings[b.player] += payout;
        emit RevealTimeoutClaimed(betId, payout);
    }

    function withdraw() external nonReentrant {
        uint256 amount = winnings[msg.sender];
        require(amount > 0, "nothing to withdraw");
        winnings[msg.sender] = 0;
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "transfer failed");
    }

    // --- views ---
    /// @notice Total payout (stake + profit) for a winning bet, after the house edge.
    ///         fair multiplier = 100/target; payout = stake * (100/target) * (1 - edge).
    function _payout(uint256 stake, uint8 target) internal view returns (uint256) {
        return (stake * 100 * (10000 - houseEdgeBps)) / (uint256(target) * 10000);
    }

    function quotePayout(uint256 stake, uint8 target) external view returns (uint256) {
        return _payout(stake, target);
    }

    receive() external payable {
        bankroll += msg.value;
    }
}
