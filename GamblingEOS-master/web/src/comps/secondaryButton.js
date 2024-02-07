// Imports
import React, { Component } from 'react';
import './secondaryButton.css';

class SecondaryButton extends Component {
  render() {
    return (
      <div className='secondaryButton'>
        <p>{this.props.SecondaryButtonTitle}</p>
      </div>
    );
  }
}

export default SecondaryButton;
