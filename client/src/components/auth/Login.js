import React, { Component } from 'react'
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {loginUser} from '../../actions/authActions';
import classnames from 'classnames';

class Login extends Component {

	  constructor() {
      super();
      this.state = {
      email: '',
      password: '',
      errors: {}
    };


  /*aşağıda tanımlı onChange fonk u icinde this.setState de this problem cıkarırı dolayısıyla this.onChange icin bind yapmamız gereki*/
  this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange(e) {
  	this.setState({[e.target.name]: e.target.value});
  }

    onSubmit(e) {
    e.preventDefault();

    const newuser = {
      name: this.state.name,
      email: this.state.email,
      password: this.state.password,
      password2: this.state.password2
      
    }

     console.log(newuser);

  }


  render() {

    const {errors} = this.state;

    return (
 <div className="login">
    <div className="container">
      <div className="row">
        <div className="col-md-8 m-auto">
          <h1 className="display-4 text-center">Log In</h1>
          <p className="lead text-center">Sign in to your DevConnector account</p>
          <form onSubmit={this.onSubmit}>
            <div className="form-group">
              <input type="email" 
              className="form-control form-control-lg" placeholder="Email Address" 
              name="email"
              value={this.state.email}
              onChange={this.onChange}
               />
            </div>
            <div className="form-group">
              <input type="password" 
              className="form-control form-control-lg" placeholder="Password" 
              name="password"
              value={this.state.password}
              onChange={this.onChange}
               />
            </div>
            <input type="submit" className="btn btn-info btn-block mt-4" />
          </form>
        </div>
      </div>
    </div>
  </div>
    )
  }
}

Login.PropTypes = {
  loginUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
}

const mapStateToPropf = (state) => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(null, {loginUser})(Login);