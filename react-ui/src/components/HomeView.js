import React, {Component} from 'react';
import ScheduleView from './ScheduleView';

const backend = '/api/';
class HomeView extends Component {

  constructor(props){
    super(props)
    this.state = {
      timeblocks: [],
      user: {},
    }
    if(localStorage.user && localStorage.user !== 'undefined'){
      let user = JSON.parse(localStorage.user)
      this.fetchTimeBlocks(user)
    } 
  }
  fetchTimeBlocks(user){
    fetch(backend+'timeblocks/' + user.id)
      .then(response => {
        if(response.status !== 200){
          return
        }
        return response.json()
    }).then(response => {
      response = response.map(tb => {
        tb.start = new Date(tb.start)
        tb.end = new Date(tb.end)
        return tb
      })

      this.setState({
        timeblocks: response,
        user: user,
      })
    })
  }

  render() {
    const visitToken = this.state.user.visitToken
    return (
      <div className="HomeView">
        <h2>My schedule
        </h2>
        <p>Shareable link
        </p>
        <p>{window.location.origin + '/user/' + visitToken}
        </p>
        <ScheduleView timeblocks={this.state.timeblocks} />
      </div>
    );
  }
}

export default HomeView;
