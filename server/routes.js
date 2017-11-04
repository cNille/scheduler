const database = require('./database'),
  calendar = require('./calendar');

const sequelize = database.sequelize;
const User = database.User;
const Calendar = database.Calendar;
const Timeblock = database.Timeblock;
const frontendUrl = process.env.FRONTEND || 'http://localhost:6969/'

function setRoutes(router, passport){

  // Home page
  // User needs to be logged in. Therefore use ensureAuthenticated as middleware.
  router.get('/', ensureAuthenticated, function(req, res){

    var user = req.user;
    User.findAll().then(users => {
      res.render('home', {
        user: user,
        users: users
      });
    });
  });


  router.get('/restartDB', function(req,res){
    User.sync({force: true}).then(() => {});
    Calendar.sync({force: true}).then(() => {});
    Timeblock.sync({force: true}).then(() => {});
    res.send(200)
  })

  // Calendar list page
  router.get('/calendars', ensureAuthenticated, function(req, res) {
    console.log('GET calendars')

    var user = '';
    var calendars = [];
    getUser(req.query.token).then( dbuser => {
      if(!dbuser){
        return res.send(404)
      }
      user = dbuser;
      return calendar.getCalendars(user)
    }).then(cals => {
      calendars = cals
      return Calendar.findAll({where: {user: user.id}})
    }).then(dbcalendars => {
      if(dbcalendars){
        dbcalendars.forEach(dbcal => {
          calendars.forEach(cal => {
            if(dbcal.googleId === cal.id){
              cal.active = dbcal.active;
            }
          })
        }) 
      }
      res.send(calendars);
    });
  });

  // Api for updating all calendars for the user. 
  router.post('/calendars', ensureAuthenticated, function(req, res) {
    console.log('POST calendars')
    var user = '';
    var calendars = req.body;
    
    getUser(req.query.token).then( dbuser => {
      if(!dbuser){
        return res.send(404)
      }
      user = dbuser;
      return Calendar.destroy({ where: {user: user.id }}) 
    }).then(() => {

      if(calendars && calendars.forEach){
        calendars.forEach(cal => {
          Calendar.create({
            user: user.id,
            name: cal.summary, 
            googleId: cal.id, 
            active: cal.active
          });
        }) 
      }
      res.send(200);
    });
  })

  // Api for updating all calendars for the user. 
  router.get('/visit/:token', function(req, res) {
    console.log('123')
    User.find({where: { visitToken: req.params.token}})
      .then( dbuser => {
      console.log('123')
      if(!dbuser){
        console.log('123')
        return res.send(404)
      }
      dbuser.frontendToken = undefined;
      dbuser.accessToken = undefined;
      dbuser.refreshToken = undefined;
      dbuser.id = undefined;
      dbuser.id = undefined;
      res.send({
        firstName: dbuser.firstName,
        lastName: dbuser.lastName,
        email: dbuser.email,
        id: dbuser.id,
      });
    });
  })

  // Api for updating all calendars for the user. 
  router.get('/user', ensureAuthenticated, function(req, res) {
    getUser(req.query.token).then( dbuser => {
      if(!dbuser){
        return res.send(404)
      }
      dbuser.frontendToken = undefined;
      dbuser.accessToken = undefined;
      dbuser.refreshToken = undefined;
      res.send(dbuser);
    });
  })

  // Get timeblocks of user page
  router.get('/timeblocks/:userId', function(req, res) {
    var userId = req.params.userId;
    var reqUser = req.user;
    var user = {};

    calendar.synkUser(userId).then(() => {
      return User.findById(userId)
    }).then(userResolve => {
      user = userResolve;
      return Timeblock.findAll({where: {user: userId}})
    }).then(timeblocks => {
      res.send(timeblocks)
    });
  });


  // Login page
  router.get('/login', function(req, res) {
    res.render('login', {
      user: req.user
    });
  });

  // Logout link
  router.get('/logout', function(req, res) {
    req.logout();
    res.sendStatus(200);
  });

  // Login page
  router.get('/calendar/callback', function(req, res) {
    console.log('Calendar thingyi');
    res.send('Woaw');
  });

  // Google login url
  router.get('/auth/google',
    passport.authenticate('google', { scope: ['email', 'openid', 
      'https://www.googleapis.com/auth/calendar.readonly'] })
  );

  // Callback from google auth after login.
  router.get(
    '/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
      var token = '';
      if(req.user){
        token = req.user.dataValues.frontendToken;
      }
      // Successful authentication, redirect home.
      res.redirect(frontendUrl + '?token=' + token);
    }
  );

  function getUser(token){
    return User.find({where: { frontendToken: token}}) 
  }

  // Simple route middleware to ensure user is authenticated.
  function ensureAuthenticated(req, res, next) {
    console.log('Ensuring logging')
    getUser(req.query.token).then(user => {
      if(user){
        next();
      } else {
        res.send(404);
      }
    })
  }
}

module.exports = {
  setRoutes: setRoutes
}
