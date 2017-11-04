const Sequelize = require('sequelize');

// Create a database connection
const sequelize = new Sequelize(process.env.CLEARDB_DATABASE_URL);

// Test connection to the database
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


// Create User model
const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: Sequelize.STRING
  },
  lastName: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING
  },
  googleId: {
    type: Sequelize.STRING,
    unique: true
  },
  accessToken: { type: Sequelize.STRING },
  refreshToken: { type: Sequelize.STRING },
  frontendToken: { type: Sequelize.STRING },
  visitToken: { type: Sequelize.STRING },
  tokenType: { type: Sequelize.STRING },
  expiryDate: { type: Sequelize.BIGINT }
});

// Create calendar model
const Calendar = sequelize.define('calendar', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user: {
    type: Sequelize.INTEGER
  },
  name: {
    type: Sequelize.STRING
  },
  googleId: {
    type: Sequelize.STRING
  },
  active: {
    type: Sequelize.BOOLEAN
  },
});

// Create timeblock model
const Timeblock = sequelize.define('timeblock', {
  user: {
    type: Sequelize.INTEGER
  },
  start: {
    type: Sequelize.DATE
  },
  end: {
    type: Sequelize.DATE
  }
});



// force: true will drop the table if it already exists
// Uncomment this when you have updated any model. 
// On production we might use sequelize migration tools. 
// Check: http://docs.sequelizejs.com/manual/tutorial/migrations.html
// User.sync({force: true}).then(() => {});
// Calendar.sync({force: true}).then(() => {});
// Timeblock.sync({force: true}).then(() => {});

module.exports = {
  sequelize: sequelize,
  User: User,
  Calendar: Calendar,
  Timeblock: Timeblock
};
