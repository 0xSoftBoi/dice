// Imports
import React, { Component } from 'react';
import './footer.css';

import SecondaryButton from './secondaryButton.js';

import Logo from '../img/logo.png';


class Footer extends Component {


  render() {
    return (
      <div className='footer'>
        <div className='footer_container'>
          <div className='footer_top'>
            <img src={Logo}/>
          </div>
          <div className='footer_2'>
            <SecondaryButton SecondaryButtonTitle='Contact us'></SecondaryButton>
          </div>
          <div className='footer_middle'>
            <div className='horizontal_divider'></div>
          </div>
          <div className='footer_bottom'>
          <p className='legal'>Yung Bet currently does not provide services to users from the following courties or regions: North Korea, USA, Mainland China.

No persons under the age of 18 are permitted to gamble. Online gambling is an entertainment vehicle that includes a certain degree of financial risk. Players should be aware of this risk and govern themselves accordingly. There is no intention to induce any person to violate any local, state, or national laws. It is the sole responsibility of players to reference laws within their own jurisdiction to ascertain the legality of actions.

If you have any question, you could join our Discord channel for help.</p>
          </div>
        </div>
      </div>
    );
  }
}

export default Footer;
