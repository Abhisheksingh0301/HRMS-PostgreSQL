const { DataTypes } = require('sequelize');
const  sequelize  = require('../routes/suquelize');

const LeaveMaster = sequelize.define('LeaveMaster', {
  leave_abb: { type: DataTypes.STRING, allowNull: false },
  leave_desc: { type: DataTypes.STRING, allowNull: false },
  leave_alloted: { type: DataTypes.INTEGER, allowNull: false },
  remarks: { type: DataTypes.STRING },
  entrydt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  timestamps: false,
  tableName: 'leave_master'
});

module.exports = LeaveMaster;
