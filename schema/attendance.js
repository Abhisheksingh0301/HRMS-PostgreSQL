const { DataTypes } = require('sequelize');
const  sequelize  = require('../routes/suquelize');

const Attendance = sequelize.define('Attendance', {
  emp_name: { type: DataTypes.STRING, allowNull: false },
  leave_type: { type: DataTypes.STRING, allowNull: false },
  leave_date: { type: DataTypes.DATE },
  enteredby: { type: DataTypes.STRING, allowNull: false },
  entrydt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  timestamps: false,
  tableName: 'attendance'
});

module.exports = Attendance;
