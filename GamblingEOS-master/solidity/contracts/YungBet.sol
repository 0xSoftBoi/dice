pragma solidity ^0.4.23;

import "./Ownable.sol";
import "./SafeMath.sol";

contract YungBet is Ownable {

    using SafeMath for uint;

    mapping(address => uint) total_bets;

    event betPlaced(uint bet_amount, uint bet_payout, uint bet_roll);

    function makeBet() public payable {
        address user = msg.sender;
        uint bet_amount = msg.value;

        uint bet_roll = RandomNumber();
        uint bet_payout = bet_amount.div(2);

        require(bet_payout < address(this).balance, "Contract balance too low...");

        user.transfer(bet_payout);

        emit betPlaced(bet_amount, bet_payout, bet_roll);
    }

    function RandomNumber() public returns(uint) {
        total_bets[msg.sender]++;
        uint random_number = total_bets[msg.sender];
        random_number = uint(
            keccak256(
                abi.encodePacked(
                    blockhash(block.number),
                    total_bets[msg.sender]
                )
            )
        );

        random_number = random_number.div(10**75);

        if (random_number > 100) random_number = 100;
        if (random_number < 0) random_number = 0;

        return uint(random_number);
    }

}
