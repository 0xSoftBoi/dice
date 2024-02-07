import React, { Component } from 'react'
import Slider from 'react-rangeslider'
// To include the default styles
import 'react-rangeslider/lib/index.css'

import './slider.css';

class HorizontalSlider extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      value: 50
    }
  }

  handleChangeStart = () => {
    console.log('Change event started')
  };

  handleChange = value => {
    this.setState({
      value: value
    })
  };

  handleChangeComplete = () => {
    console.log('Change event completed')
  };

  render () {
    const { value } = this.state
    return (
      <div className='slider'>
        <Slider
          min={2}
          max={96}
          value={value}
          onChangeStart={this.handleChangeStart}
          onChange={this.handleChange}
          onChangeComplete={this.handleChangeComplete}
        />
      </div>
    )
  }
}

export default HorizontalSlider
