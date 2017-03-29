import React, { Component } from 'react';
import { Link } from 'react-router'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import ReactDOM from 'react-dom';
import AltContainer from 'alt-container';

import LoginActions from '../../actions/LoginActions';

class Content extends Component {
  constructor(props) {
    super(props);

    this.state = {
      login: {
        username: "",
        passwd: ""
      }
    }

    this.login = this.login.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    let callback = this.handleChange.bind(this);
  }

  login(e) {
    console.log("will login");
    e.preventDefault();
    LoginActions.authenticate(JSON.parse(JSON.stringify(this.state.login)));
  }

  handleChange(event) {
    const target = event.target;
    let state = this.state.login;
    state[target.name] = target.value;
    this.setState({
      login: state
    });
  }

  render() {
    return (
      <div className="login">
        <div className="row">
          <div className="col s12 m4 login-area-left-side">
            <div className="row margin-top">
              <p><img src="images/logo.png"/></p>
            </div>
            <div className="row">
              <p>Some description about the project, like lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.</p>
            </div>
          </div>
          <div className="col s12 m8 login-area-right-side">
            <div className="row">
              <div className="col s12 m5 offset-m3 margin-top">
                <div className="login-page-title">Login</div>
              </div>
            </div>
            <div className="row">
              <div className="col s12 m4 offset-m4">
                <div className="login-page-subtitle">Sign in to start your session</div>
              </div>
            </div>
            <form onSubmit={this.login}>
              <div className="row">
                  <div className="input-field col s12 m4 offset-m4">
                    <label htmlFor="fld_user">Username</label>
                    <input id="fld_user" type="text"
                           name="username"
                           onChange={this.handleChange}
                           value={this.state.login.user} />
                           <i className="material-icons prefix">account_circle</i>
                  </div>
                  <div className="input-field col s12 m4 offset-m4">
                    <label htmlFor="fld_password">Password</label>
                    <input id="fld_password" type="password"
                           name="passwd"
                           onChange={this.handleChange}
                           value={this.state.login.password} />
                           <i className="material-icons prefix">lock_open</i>
                  </div>
              </div>
              <div className="row">
                <div className="col s12 m5 offset-m3">
                  <div><i className="material-icons prefix">info_outline</i> Forgot your password?</div>
                </div>
              </div>
              <div className="row">
                <div className="col s12 m1 offset-m7">
                    <button type="submit" className=" waves-effect waves-green btn-flat">Login</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

class Login extends Component {
  constructor (props) {
    super(props);
  }

  render() {
    return (
      <ReactCSSTransitionGroup
          transitionName="first"
          transitionAppear={true}
          transitionAppearTimeout={500}
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500} >
        <Content />
      </ReactCSSTransitionGroup>
    );
  }
}

export default Login;