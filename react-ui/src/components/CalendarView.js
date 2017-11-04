import React, {Component} from 'react';

const backend = '/api/';


class CalendarView extends Component {
  state = {
    calendars: []
  }

  componentDidMount (){
    if(localStorage.token){
      fetch(backend+'calendars?token=' + localStorage.token)
        .then(response => response.json())
        .then(response => {
          this.setState({calendars: response})
      })
    }
  }

  constructor(props){
    super(props);
    this.state = { calendars: [] }
  
    // Bind all functions to this.
    this.saveCalStates = this.saveCalStates.bind(this)
    this.handleCalendarStateChange = this.handleCalendarStateChange.bind(this)
  }

  handleCalendarStateChange(event){
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    var cals = this.state.calendars
    cals.forEach(c => {
      if(c.id === name){
        c.active = value
      }
    })
    this.setState({
      calendars: cals
    }); 
  }

  saveCalStates(){
    var cals = this.state.calendars;
    if(localStorage.token){
      var data = new FormData();
      data.append( "json", JSON.stringify( {calendars: cals} ) );

      fetch(backend+'calendars?token=' + localStorage.token, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cals) 
      })
        .then(response => {
          console.log('Done') 
      }, err => {
        console.log(err)
      })
    }
  }

  render() {
    var calendars = this.state.calendars.map((cal,index) => {
      return <p key={index}>
          <input 
            type="checkbox" 
            name={cal.id}
            checked={cal.active} 
            onChange={this.handleCalendarStateChange} /> {cal.summary}
        </p>
    });
    if(calendars.length > 0){
      calendars.push(<button className="button" key='-1' onClick={this.saveCalStates}>Save calendar states</button>)
    }

    return (
      <div className="CalendarView">
        <form>
          {calendars}
        </form>
      </div>
    );
  }
}

export default CalendarView;

