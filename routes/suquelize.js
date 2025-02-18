const { Sequelize } = require('sequelize');

// Initialize Sequelize with connection parameters
const sequelize = new Sequelize(process.env.CONNECTION_STR, {
  dialect: 'postgres',
  logging: false,
});

// Authenticate and sync models
sequelize.authenticate()
  .then(() => {
    console.log('Connection to PostgreSQL has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

sequelize.sync()
  .then(() => {
    console.log('Database & tables created!');
  })
  .catch(err => {
    console.error('Error creating database & tables:', err);
  });

module.exports = sequelize; // Ensure this exports the sequelize instance
