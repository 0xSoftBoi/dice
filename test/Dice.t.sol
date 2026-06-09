// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Dice} from "../src/Dice.sol";

contract DiceTest is Test {
    Dice dice;
    address player = address(0xA11CE);

    bytes32 constant SERVER_SEED = keccak256("server-secret-seed");
    bytes32 constant CLIENT_SEED = keccak256("player-client-seed");

    function setUp() public {
        dice = new Dice();
        dice.fund{value: 100 ether}();
        vm.deal(player, 10 ether);
    }

    function _commit() internal {
        dice.commitSeed(keccak256(abi.encodePacked(SERVER_SEED)));
    }

    // 1. payout reflects the house edge (50/50 bet pays ~1.96x, not 2x)
    function test_payoutMathHasHouseEdge() public view {
        // target 50 -> p = 0.5, fair 2x, 2% edge -> 1.96x
        assertEq(dice.quotePayout(1 ether, 50), 1.96 ether);
        // target 25 -> p = 0.25, fair 4x, edge -> 3.92x
        assertEq(dice.quotePayout(1 ether, 25), 3.92 ether);
    }

    // 2. the roll actually decides the outcome, and matches the published formula
    function test_settle_outcomeMatchesFormula() public {
        _commit();
        uint8 target = 50;
        vm.prank(player);
        uint256 betId = dice.placeBet{value: 1 ether}(target, CLIENT_SEED);

        dice.revealSeed(SERVER_SEED);

        uint256 roll = uint256(keccak256(abi.encodePacked(SERVER_SEED, CLIENT_SEED, betId))) % 100;
        bool win = roll < target;
        uint256 payout = dice.quotePayout(1 ether, target);

        dice.settleBet(betId);
        assertEq(dice.winnings(player), win ? payout : 0, "winnings must match the roll");

        if (win) {
            uint256 before = player.balance;
            vm.prank(player);
            dice.withdraw();
            assertEq(player.balance, before + payout);
        }
    }

    // 3. commit-reveal binding: the house cannot reveal a seed that doesn't match its commit
    function test_reveal_wrongSeed_reverts() public {
        _commit();
        vm.prank(player);
        dice.placeBet{value: 1 ether}(50, CLIENT_SEED);
        vm.expectRevert(Dice.BadSeed.selector);
        dice.revealSeed(keccak256("a different seed"));
    }

    // 4. the outcome is undetermined before reveal — you cannot settle/predict it
    function test_cannotSettleBeforeReveal() public {
        _commit();
        vm.prank(player);
        uint256 betId = dice.placeBet{value: 1 ether}(50, CLIENT_SEED);
        vm.expectRevert(Dice.NotRevealed.selector);
        dice.settleBet(betId);
    }

    // 5. reveal-timeout forfeit: if the house withholds the reveal, the player is paid as a win
    function test_revealTimeout_paysPlayer() public {
        _commit();
        vm.prank(player);
        uint256 betId = dice.placeBet{value: 1 ether}(50, CLIENT_SEED);

        vm.warp(block.timestamp + 1 hours + 1); // past the reveal deadline, no reveal
        uint256 payout = dice.quotePayout(1 ether, 50);

        dice.claimRevealTimeout(betId);
        assertEq(dice.winnings(player), payout, "withheld reveal must pay the player");

        // can't double-claim or settle afterwards
        vm.expectRevert(Dice.AlreadySettled.selector);
        dice.claimRevealTimeout(betId);
    }

    // 6. bankroll cap: a bet whose potential profit exceeds the bankroll is rejected
    function test_bankrollCap_rejectsUnbackedBet() public {
        Dice small = new Dice();
        small.fund{value: 0.5 ether}();          // tiny bankroll
        small.commitSeed(keccak256(abi.encodePacked(SERVER_SEED)));
        vm.deal(player, 10 ether);
        vm.prank(player);
        // 1 ETH at target 50 risks ~0.96 ETH profit > 0.5 bankroll
        vm.expectRevert(Dice.InsufficientBankroll.selector);
        small.placeBet{value: 1 ether}(50, CLIENT_SEED);
    }

    // 7. the house cannot withdraw funds reserved against an open bet
    function test_houseCannotWithdrawLockedFunds() public {
        _commit();
        vm.prank(player);
        dice.placeBet{value: 1 ether}(50, CLIENT_SEED); // locks ~0.96 ETH profit
        // bankroll 100; locked ~0.96; withdrawing 100 must fail
        vm.expectRevert(Dice.InsufficientBankroll.selector);
        dice.withdrawHouse(100 ether);
        // withdrawing within the free amount is fine
        dice.withdrawHouse(99 ether);
    }

    receive() external payable {}
}
