import React, { Component } from 'react';
import './App.css';

//Components
import Header from './comps/header.js';
import Play from './comps/play.js';
import Live from './comps/live.js';
import Footer from './comps/footer.js';
import Popup from './comps/popup.js';

import Fade from 'react-reveal/Fade';

import BgImg from './img/bg.png';

class App extends Component {
  render() {
    return (
      <React.Fragment>
        <img src={BgImg} className="bg" alt="background"/>

        <Fade bottom delay={150}>
          <Header></Header>
        </Fade>

        <Fade bottom delay={300}>
          <Play></Play>
        </Fade>

        <Fade bottom delay={450}>
          <Live></Live>
        </Fade>

        <Fade bottom>
          <Footer></Footer>
        </Fade>

      </React.Fragment>
    );
  }
}

export default App;
