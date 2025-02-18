const { DataTypes } = require('sequelize');
const sequelize = require('../routes/suquelize'); // Correctly import sequelize instance

// Define the model
const LogModel = sequelize.define('LogModel', {
  emp_name: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'user' },
  entrydt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  timestamps: false,
  tableName: 'login'
});

// Ensure the model is exported correctly
module.exports = LogModel;
