import React, {Component} from 'react';
import Day from './Day';


function sameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

class ScheduleView extends Component {

  render() {

    const timeblocks = this.props.timeblocks;
    var currentDate = new Date();
    var dates = []
    for(let i = 0; i < 7 ; i++){
      dates.push(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000 * i))
    }
    dates = dates.map((d, idx) => {
      let dateTB = timeblocks.filter(tb => sameDay(tb.start, d) || sameDay(tb.end, d))
      return <Day key={idx} date={d} timeblocks={dateTB}  />
    })

    var dayhours = ['']
    for(let i = 8; i < 25 ; i++ ){
      let time = String(i) + ':00' 
      time = time.length < 5 ? '0' + time : time
      dayhours.push(<span key={i} className="time">{time}</span>) 
      
    }

    return (
      <div className="ScheduleView">
        <div className="week" id="week">
          <div className="dayhours">
            {dayhours} 
          </div>
          {dates}
        </div>

      </div>
    );
  }
}

export default ScheduleView;
