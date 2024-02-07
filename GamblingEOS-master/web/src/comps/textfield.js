// Imports
import React, { Component } from 'react';
import './textfield.css';

import EOSLogo from '../img/eos.png';

class Textfield extends Component {
  render() {
    return (
      <div className="textfield">
        <img src={EOSLogo} className='eos_logo'/>
        <div className='input_container'>
          <input type='text' placeholder="Enter bet"/>
          <p className='EOS_curr'>EOS</p>
        </div>

      </div>
    );
  }
}

export default Textfield;
