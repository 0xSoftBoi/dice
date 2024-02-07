// Imports
import React, { Component } from 'react';
import './play.css';

import Button from './button.js';
import Textfield from './textfield.js';
import SecondaryButton from './secondaryButton.js';
import HorizontalSlider from './slider.js';
import ToggleComponent from './toggle.js';

import GreenArrow from '../img/greenarrow.png';
import RedArrow from '../img/redarrow.png';
import EOSLogo from '../img/eos.png';
import Dice from '../img/dice.png';

import { metamask } from '../Metamask';

class Play extends Component {

  rollDice() {
    metamask.makeBet();
  }

  render() {
    return (
      <div className='play_holder'>
        <div className='row1_container'>
          <div className='row1_1'>
            <p style={{marginBottom: 5,}}>Your bet</p>
            <div className='row1_1_1'>
              <Textfield></Textfield>
              <div className='div'></div>
              <SecondaryButton SecondaryButtonTitle='1 / 2'/>
              <div className='div'></div>
              <SecondaryButton SecondaryButtonTitle='2 x'/>
              <div className='div'></div>
              <SecondaryButton SecondaryButtonTitle='MAX'/>
            </div>
          </div>
          <div className='row1_2'>
            <img src={GreenArrow} className='greenArrow'/>
          </div>
          <div className='row1_3'>
            <p style={{marginBottom: 5,}}>You'll win</p>
            <div className='row1_3_1'>
              <div className='reward_container'>
                <img src={EOSLogo}/>
                <p className='reward_amount'>0.2738</p>
                <p className='EOS_curr'>EOS</p>
              </div>
            </div>

          </div>
        </div>
        <div className='row2_container'>
          <div className='row2_1 grow'>
            <p style={{marginBottom: 5,}}>Roll under..</p>
            <div className='row2_1_1'>
            <div className='stat_container'>
              <p>35</p>
              <img src={RedArrow} style={{width:20,marginLeft:10}}/>
            </div>
            </div>
          </div>
          <div className='div'></div>
          <div className='row2_2 grow'>
            <p style={{marginBottom: 5,}}>Payout</p>
            <div className='row2_1_2'>
              <div className='stat_container'>
                <p>3.788 x</p>
              </div>
            </div>
          </div>
          <div className='div'></div>
          <div className='row2_3 grow'>
            <p style={{marginBottom: 5,}}>Chance</p>
            <div className='row2_1_3'>
              <div className='stat_container'>
                <p>26 %</p>
              </div>
            </div>
          </div>
        </div>
        <div className='row3_container'>
          <HorizontalSlider></HorizontalSlider>
        </div>

        <div className='row4_container'>
          <div className='row4_holder'>
            <div className='row4_1'>
              <p style={{marginBottom: 5,}}>My balance</p>
              <div className='balance_container'>
                <p style={{marginRight: 5,}}>0.010</p>
                <p className='EOS_curr'>EOS</p>
              </div>
            </div>
            <div className='divider'></div>
            <div className='row4_1'>
              <p style={{marginBottom: 5,}}>Autobet</p>
              <ToggleComponent></ToggleComponent>
            </div>
          </div>
          <div className='row4_holder_2' onClick={this.rollDice.bind(this)}>
            <Button buttonTitle='Roll the dice' buttonIcon={Dice}></Button>
          </div>

        </div>

      </div>
    );
  }
}

export default Play;
