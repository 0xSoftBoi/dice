// Imports
import React, { Component } from 'react';
import './popup.css';

import Fade from 'react-reveal/Fade';

import LogoText from '../img/logo_text.png';
import CloseIcon from '../img/closeicon.png';

import Button from './button.js';

class Popup extends Component {
  render() {
    return (
      <div className='popup_container'>
        <Fade bottom>
          <div className='popup'>
            <img src={LogoText} className='logo_text'/>
            <p className='popup_text'>{this.props.popupText}</p>
            <Button buttonTitle='Close' buttonIcon={CloseIcon}></Button>
          </div>
        </Fade>
      </div>
    );
  }
}

export default Popup;
