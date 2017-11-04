const google = require('googleapis');
const calendar = google.calendar('v3');
const OAuth2 = google.auth.OAuth2;
const conf = require('./conf');
const database = require('./database');

const sequelize = database.sequelize;
const User = database.User;
const Calendar = database.Calendar;
const Timeblock = database.Timeblock;

function createAuth(user){
  const oauth2Client = new OAuth2(
    conf.google.client_id,
    conf.google.client_secret,
    conf.google.callback_url_calendar
  );
  oauth2Client.setCredentials({
    access_token: user.accessToken,
    refresh_token: user.refreshToken 
  });
  return oauth2Client;
}

function getCalendars(user){
  oauth2Client = createAuth(user);

  let calendarsPromise = new Promise( (resolve, reject) => {
    calendar.calendarList.list({
      auth: oauth2Client
    }, function(err, response) {
      if (err) {
        reject('Unable to fetch calendars: ' + err)
      } else {
        var calendars = response.items; resolve(calendars);
      }
    });
  });
  return calendarsPromise;
}

function listEventsFromCalendar(user, calName) {
  auth = createAuth(user);

  let eventsPromise = new Promise( (resolve, reject) => {

    let date = new Date()
    date = new Date(date.getTime() - 24 * 60 * 60 * 1000)

    calendar.events.list({
      auth: auth,
      calendarId: calName,
      timeMin: date.toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime'
    }, (err, response) => {
      if (err) {
        console.log('The API returned an error with ' + calName + ': ' + err);
        resolve([]);
      } else {
        console.log('Calendar ' + calName + ' fetched ');
        var events = response.items;
        resolve(events);
      }
    });
  });
  return eventsPromise;
}

// synkUser retrieves all events of all calendars connected
// to a user by its userId. It requests all of the events
// from google calendar and sends them to the mergetimeblocks
// function.
function synkUser(userId){
  var user = {};

  var dbCalendars = [];

  return User.findById(userId).then( dbuser => {
    user = dbuser;
    return Calendar.findAll({where: {user: user.id, active: true}})
  }).then( calendars => {
    var promises = [];
    for(idx in calendars){
      let cal = calendars[idx];
      promises.push(listEventsFromCalendar(user, cal.googleId));
    }
    return Promise.all(promises).then(values => {
      var events = []; 
      for(i in values){
        var list = values[i];
        if(list){
          events = [...events, ...list];
        }
      }
      mergeTimeblocks(user, events);
    });
  });
}

function mergeTimeblocks(user, events){

  var timeblocks = [];

  events.forEach(event => {
    if(event.start.date){
      return true;
    }
    var eventStart = new Date(event.start.dateTime);
    var eventEnd = new Date(event.end.dateTime);
    
    var updatedTimeblocks = false;

    timeblocks = timeblocks.map(tb => {

      // If timeblock and event collide, and event starts first.
      if(tb.start.getTime() > eventStart.getTime() && tb.end.getTime() <= eventEnd.getTime() ){
        tb.start = eventStart;
        updatedTimeblocks = true;
      }
      // If timeblock and event collide, and timeblock starts first.
      if(tb.start.getTime() <= eventStart.getTime() && tb.end.getTime() > eventEnd.getTime() ){
        tb.end = eventEnd;
        updatedTimeblocks = true;
      }
      if(tb.start.getTime() === eventEnd.getTime()){
        tb.start = eventStart;
        updatedTimeblocks = true;
      }
      if(tb.end.getTime() === eventStart.getTime()){
        tb.end = eventEnd;
        updatedTimeblocks = true;
      }
      if(tb.start.getTime() === eventStart.getTime() && tb.end.getTime() === eventEnd.getTime() ){
        updatedTimeblocks = true;
      }
  
      return tb;
    });

    if(!updatedTimeblocks){
      timeblocks.push({
        user: user.id,
        start: eventStart,
        end: eventEnd,
      });
    }
  });

  timeblocks.sort( (a,b) => {
    if(a.start.getTime() > b.start.getTime()){
      return 1;
    }
    if(a.start.getTime() < b.start.getTime()){
      return -1;
    }
    return 0;
  });

  // Remove all timeblocks from user
  Timeblock.destroy({ where: { user: user.id } })

  timeblocks.forEach( tb => {
    Timeblock.create(tb);
  });
}


module.exports = {
  getCalendars: getCalendars,
  listEventsFromCalendar: listEventsFromCalendar,
  synkUser: synkUser
};
