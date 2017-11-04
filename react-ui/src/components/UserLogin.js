import React from 'react';

const backend = '/api/';

class UserLogin extends React.Component {

  state = {
    user: {}
  }

  constructor(props){
    super(props)
    this.state = {
      user: {}
    }
  }


  componentWillMount(){
    if(localStorage.token){
      fetch(backend+'user?token=' + localStorage.token)
        .then(response => {
          if(response.status !== 200){
            return
          }
          return response.json()
        })
        .then(response => {
          this.setState({
            user: response
          })
          localStorage.user = JSON.stringify(response)
        })
    } 

    this.logout = this.logout.bind(this);
  }

  logout(){
      fetch(backend+'logout?token=' + localStorage.token)
        .then(res => {
          localStorage.token = undefined;
          localStorage.user = undefined;
          window.location = '/';
        })
  }


  render () {
    const user = this.state.user 
    
    const msg = user ? 
      <div>
        <span>Logged in as: {user.firstName + ' ' + user.lastName}</span>
        <br />
        <a>
          <button
            className="button"
            onClick={this.logout}
            >Logga ut</button>
        </a>
      </div> : 
      <a href={backend+'auth/google'}>
        <button className="button">Logga in</button>
      </a>

    return (
      <div
        className="userlogin">
        {msg}
      </div>
    );
  }
}

export default UserLogin;
