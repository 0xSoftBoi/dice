// Imports
import React, { Component } from 'react';
import './live.css';

import Button from './button.js';
import SecondaryButton from './secondaryButton.js';
import UserRankingPseudo from './userRankingPseudo.js';
import UserRanking from './userRanking.js';

import GreenArrow from '../img/greenarrow.png';
import RedArrow from '../img/redarrow.png';
import Dice from '../img/dice.png';

import { metamask } from '../Metamask';

class Live extends Component {

  constructor() {
    super();
    this.state = { bets: metamask.bets };

    setInterval(() => {
      this.setState({ bets: metamask.bets });
    }, 1500);
  }

  render() {
    return (
      <div className='live_holder'>
        <div className='horizontal_divider'></div>
        <div className='toggle_holder'>
          <SecondaryButton SecondaryButtonTitle='Live bets'></SecondaryButton>
          <div className='div'></div>
          <SecondaryButton SecondaryButtonTitle='My bets'></SecondaryButton>
          <div className='div'></div>
          <SecondaryButton SecondaryButtonTitle='Payouts'></SecondaryButton>
          <div className='div'></div>
          <SecondaryButton SecondaryButtonTitle='Wagers'></SecondaryButton>
        </div>
        <div className='ranking_container'>

          <UserRankingPseudo></UserRankingPseudo>

          {this.state.bets.map((bet, i) => {
            return (<UserRanking
              key={i}
              ClassNames='user_ranking lose'
              timeOfBet='100'
              userName={bet.address}
              rollUnder={'100'}
              betAmount={bet.bet_amount}
              diceRoll={bet.bet_roll}
              payoutAmount={bet.bet_payout}
            ></UserRanking>);
          })}

        </div>
      </div>
    );
  }
}

export default Live;
