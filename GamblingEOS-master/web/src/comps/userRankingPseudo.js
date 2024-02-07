// Imports
import React, { Component } from 'react';
import './userRankingPseudo.css';

import GreenArrow from '../img/greenarrow.png';
import RedArrow from '../img/redarrow.png';
import Dice from '../img/dice.png';

class UserRankingPseudo extends Component {
  render() {
    return (
      <div className='user_ranking_pseudo'>
        <p className='one'>Time</p>
        <p className='two'>Bettor</p>
        <p className='three'>Roll under</p>
        <p className='four'>Bet</p>
        <p className='five'>Rolled</p>
        <p className='six'>Payout</p>
      </div>
    );
  }
}

export default UserRankingPseudo;
