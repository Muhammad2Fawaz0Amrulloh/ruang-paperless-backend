'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pin extends Model {
    static associate(models) {
      Pin.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      Pin.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'pin_created_by'
      });
      Pin.belongsTo(models.User, {
        foreignKey: 'updated_by',
        as: 'pin_updated_by'
      });
      Pin.belongsTo(models.User, {
        foreignKey: 'deleted_by',
        as: 'pin_deleted_by'
      });
    }
  }
  Pin.init({
    pin_id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING
    },
    pin: {
      allowNull: false,
      type: DataTypes.STRING
    },
    user_id: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM('active', 'non-active', 'deleted'),
      defaultValue: 'active'
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('now'),
    },
    created_by: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    updated_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('now'),
    },
    updated_by: {
      allowNull: false,
      type: DataTypes.STRING,
      
    },
    deleted_at: {
      type: DataTypes.DATE
    },
    deleted_by: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: 'Pin',
    tableName: 'pins',
    timestamps: false
  });
  return Pin;
};