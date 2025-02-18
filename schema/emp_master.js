const { DataTypes } = require('sequelize');
const  sequelize  = require('../routes/suquelize');

const EmpMaster = sequelize.define('EmpMaster', {
  emp_name: { type: DataTypes.TEXT, allowNull: false },
  year_of_joining: { type: DataTypes.INTEGER },
  remarks: { type: DataTypes.TEXT },
  entrydt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  gender: { type: DataTypes.TEXT, allowNull: false },
  mob: { type: DataTypes.TEXT, allowNull: false },
  
  
}, {
  timestamps: false,
  tableName: 'emp_master'
});

module.exports = EmpMaster;
