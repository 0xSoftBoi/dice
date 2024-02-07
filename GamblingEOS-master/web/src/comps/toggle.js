// Imports
import React, { Component } from 'react';
import Toggle from 'react-toggle';
import './toggle.css';

class ToggleComponent extends Component {
  render() {
    return (
      <label>
        <Toggle
          icons={false}/>
      </label>
    );
  }
}

export default ToggleComponent;
