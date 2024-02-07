// Imports
import React, { Component } from 'react';
import './header.css';
import Logo from '../img/logo.png';
import EnglishFlag from '../img/eng.png';

import Button from './button.js';
import UserIcon from '../img/user.png';

class Header extends Component {
  render() {

    const buttonTitle = 'Login';

    return (
      <div className='header_container'>
        <header>
          <div className='left_container'>
            <img src={Logo} className='logo'/>
            <div className='divider'></div>
            <div className='lang_toggle'>
              <img src={EnglishFlag} className='flag'/>
              <p>English</p>
            </div>
          </div>

          <div id='right_container'>
            <div className='nav_holder'>
              <p>Referral</p>
              <p>Fairness</p>
              <p>Payout</p>
              <p>How to Play</p>
            </div>
            <div className='divider'></div>
            <Button buttonTitle={buttonTitle} buttonIcon={UserIcon}></Button>
          </div>

        </header>
      </div>
    );
  }
}

export default Header;
