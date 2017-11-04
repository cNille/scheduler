import React, { Component } from 'react';
import { Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import CalendarView from './components/CalendarView';
import HomeView from './components/HomeView';
import VisitView from './components/VisitView';
import UserLogin from './components/UserLogin';
import { slide as Menu } from 'react-burger-menu'
import FontAwesome from 'react-fontawesome';
import './css/font-awesome.min.css';


class App extends Component {

  constructor(props){
    super(props)
    this.state = {
      menuState: false,
    }

    this.showCalendars = this.showCalendars.bind(this);
    this.showHome = this.showHome.bind(this);
  }

  componentDidMount (){
    // If token is given, use it to auth to backend
    var url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    if(token){
      localStorage.token = token;
      window.location = '/';
    }
  }

  showHome (event) {
    this.setState({
      menuState: false,
    })
  }

  showCalendars (event) {
    this.setState({
      menuState: false,
    })
  }

  render() {
    var menuState = this.state.menuState 

    return (
      <div className="App">
        <div className="SideMenu">
          <Menu isOpen={menuState} width={280}>
            <a href="/" className="menu-item" >Home</a>
            <a href="/calendars" className="menu-item" >My calendars</a>
          </Menu>
        </div>
        <UserLogin />
        <header className="App-header">
          <FontAwesome
            className='calheader'
            name='calendar'
            size='2x'
            style={{ textShadow: '0 1px 0 rgba(0, 0, 0, 0.1)' }}
            />
          <h1 className="App-title">Scheduler</h1>
        </header>
        <div className="Body">
          <hr />
          <BrowserRouter >
            <div>
              <Route exact path="/" component={HomeView} />
              <Route path="/calendars" component={CalendarView} />
              <Route path="/user/:visitToken" component={VisitView} />
            </div>
          </BrowserRouter >
        </div>
      </div>
    );
  }
}

export default App;
