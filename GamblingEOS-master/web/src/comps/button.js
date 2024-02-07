// Imports
import React, { Component } from 'react';
import './button.css';

class Button extends Component {
  render() {
    return (
      <div className='button'>
        <img src={this.props.buttonIcon}/>
        <p>{this.props.buttonTitle}</p>
      </div>
    );
  }
}

export default Button;
