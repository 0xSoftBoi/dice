// Imports
import React, { Component } from 'react';
import './userRanking.css';

import GreenArrow from '../img/greenarrow.png';
import RedArrow from '../img/redarrow.png';
import Dice from '../img/dice.png';

class UserRanking extends Component {
  render() {
    return (
      <div className={this.props.ClassNames}>
        <p className='one'>{this.props.timeOfBet}</p>
        <p className='two'>{this.props.userName}</p>
        <p className='three'>{this.props.rollUnder}</p>
        <p className='four'>{this.props.betAmount}<span className='EOS_curr_light'> EOS</span></p>
        <p className='five'>{this.props.diceRoll}</p>
        <p className='six'>{this.props.payoutAmount}<span className='EOS_curr_light'> EOS</span></p>
      </div>
    );
  }
}

export default UserRanking;
