import React, {Component} from 'react';

function sameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

class Day extends Component {
  constructor(props){
    super(props)
    this.state = {
      height: 0
    }
    this.renderCurrentTime = this.renderCurrentTime.bind(this)
    this.renderTimeBlock = this.renderTimeBlock.bind(this)
  }

  componentDidMount(){
    const height = document.getElementsByClassName('Day')[0].clientHeight;
    this.setState({height: height - 23})
  }

  // Pads a integer with zeros to the left until width is satisfied
  pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

  renderTimeBlock(startDate, endDate, idx, passedTime){
    let start = '' + startDate.getHours() + ':' + this.pad(startDate.getMinutes(), 2)
    let end = '' + endDate.getHours() + ':' + this.pad(endDate.getMinutes(), 2)

    let endTime = endDate.getHours() * 60 + endDate.getMinutes() - 8 * 60
    let startTime = startDate.getHours() * 60 + startDate.getMinutes() - 8 * 60
    let topOffset = this.state.height * ( startTime / (16 * 60) ) + 23
    let height = this.state.height * ( endTime / (16 * 60) ) - topOffset + 23
    let color = passedTime ? '#aaa' : '#c94e50'
    let bordercolor = passedTime ? '#333' : '#992e40'
    let opacity = passedTime ? '0.7' : '1.0'
    let style = {
      height: '' + height + 'px',
      top: '' + topOffset + 'px',
      backgroundColor: color,
      borderColor: bordercolor,
      opacity: opacity,
    }
    return (
      <div 
        key={idx}
        className="currentTime"
        style={style}>
        <span className="time">
          {start} - {end}
        </span>
      </div>
    )
  }

  renderCurrentTime(){
    let date = new Date()
    if(!this.state.height || !sameDay(date, this.props.date)){
      return <div></div>
    }
    let eightDate = new Date()
    eightDate.setHours(8) 
    eightDate.setMinutes(0) 
    return this.renderTimeBlock(eightDate, date, -1, true)
  }

  render() {
    const date = this.props.date
    const datestr = date ? date.getDate() + '/' + (date.getMonth() + 1) : 'NaN'
    const daystring = date.toLocaleString('en-us', {  weekday: 'long' });
    const currentTime = this.renderCurrentTime() 

    let timeblocks = []
    this.props.timeblocks.forEach((tb, index) => {
      timeblocks.push(this.renderTimeBlock(tb.start, tb.end, index))
    })



    var dayhours = []
    for(let i = 8; i < 24 ; i++ ){
      let time = String(i) + ':00' 
      time = time.length < 4 ? '0' + time : time
      dayhours.push(<span key={i} className="timebox"></span>) 
    }

    return (
      <div className="Day">
        <span className="title">{datestr} {daystring}</span>
        {dayhours}
        {timeblocks}
        {currentTime}
      </div>
    );
  }
}

export default Day;
