import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

function Item(props) {
  const main = props.href.includes(props.path) && props.path != '/';
  return (
    <li>
      <a href={props.href}
         className={main ? "active-element" : ""}>
        {props.label}
      </a>
    </li>
  )
}

function Navbar(props) {
  return (
    <nav>
      <div className="nav-wrapper container">
        <a href="#" className="brand-logo">Logo</a>
        <ul id="nav-mobile" className="right hide-on-small-only">
          <Item path={props.path} href="#/templates" label="Device Types" />
          <Item path={props.path} href="#/devices" label="Devices" />
          <Item path={props.path} href="#/flows" label="Flows" />
          <Item path={props.path} href="#/config" label="Settings" />
        </ul>

        {/* we should probably have some kind of user id here */}
      </div>
    </nav>
  )
}

class Full extends Component {
  render() {
    return (
      <div className="app">
        {/* <Header /> */}
        <Navbar path={this.props.location.pathname}/>
        <div className="app-body">
          <main className="main">
            <div className="container">
              {this.props.children}
            </div>
          </main>
        </div>
      </div>
    );
  }
}

export default Full;