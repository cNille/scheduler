import React, {Component} from 'react';
import ScheduleView from './ScheduleView';

const backend = '/api/';
class HomeView extends Component {

  constructor(props){
    super(props)
    this.state = {
      userName: 'Loading...',
      timeblocks: []
    }

    let visitToken = props.match.params.visitToken
    fetch(backend+'visit/' + visitToken)
      .then(response => {
        if(response.status === 404){
          return
        }
        return response.json()
      })
      .then(user => {
        if(user){
          this.fetchTimeBlocks(user)
        } else {
          this.setState({
            userName: 'Incorrect link...',
            timeblocks: []
          })
        }
    })
    console.log(123)
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
        userName: 'Schedule of ' + user.firstName + ' ' + user.lastName,
        email: user.email
      })
    })
  }

  render() {
    return (
      <div className="HomeView">
        <h2>{this.state.userName}
        </h2>
        <p> {this.state.email}</p>
        <ScheduleView timeblocks={this.state.timeblocks} />
      </div>
    );
  }
}

export default HomeView;
