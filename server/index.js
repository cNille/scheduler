const express = require('express'),
  passport = require('passport'),
  path = require('path'),
  cors = require('cors'),
  bodyParser = require('body-parser'),
  GoogleStrategy = require('passport-google-oauth20').Strategy,
  google = require('googleapis'),
  database = require('./database'),
  routes = require('./routes'),
  calendar = require('./calendar');

sequelize = database.sequelize;
User = database.User;

const  conf = {};

// Passport, for persistent logins with session. Then serialize and deserialize
// is needed.
passport.serializeUser( (user,done) => 
  // Normally serialize with the id of the user
  // done(null, user.id)

  done(null, user)
)
passport.deserializeUser( (obj, done) =>
  // Normally return user from db
  // Users.findById(obj, done);
  done(null, obj)
);

function generate_token(length){
    //edit the token allowed characters
    var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
    var b = [];  
    for (var i=0; i<length; i++) {
        var j = (Math.random() * (a.length-1)).toFixed(0);
        b[i] = a[j];
    }
    return b.join("");
}

// Use google oauth strategy
// A strategy requires a `verify` function, which accepts in this case
// accessToken, refreshToken and google profile.
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID || conf.google.client_id,
    clientSecret: process.env.CLIENT_SECRET || conf.google.client_secret,
    callbackURL: process.env.GCALLBACK_URL || conf.google.callback_url,
  },
  function(accessToken, refreshToken, profile, done) {
    // Find user to googleId
    User.findOrCreate({ where: { googleId: profile.id } })
      .spread((user, created) => {
          // Update values from google to database
          user.accessToken = accessToken;
          user.refreshToken = refreshToken;
          user.frontendToken = generate_token(32);
          user.visitToken = generate_token(32);
          user.firstName = profile.name.givenName;
          user.lastName = profile.name.familyName;
          user.email = profile.emails[0].value;
          user.save().then(() => console.log('Save successfull'));

          // Return user
          done(null, user);
        }
      );
  }
));


// Express 
const app = express();
const router = express.Router();

// Use jade for rendering html for now.
app.set('view engine', 'jade')

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');

app.use(logger('dev'));
app.use(cookieParser())
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded()); 
app.use(session({
  secret: 'mysecretmysecretmysecret',
  resave: false,
  saveUninitialized: false
}));



app.use(cors());

app.use(passport.initialize());
app.use(passport.session());
routes.setRoutes(router, passport);

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));


app.use('/api', router)


// All remaining requests return the React app, so it can handle routing.
app.get('*', function(req, response, next) {
  response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
});


app.listen(process.env.PORT || 6969, function () {
  console.log('App listening on port 6969!');
});

