'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Key extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Key.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user_document',
      });
      Key.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'key_created_by'
      });
      Key.belongsTo(models.User, {
        foreignKey: 'updated_by',
        as: 'key_updated_by'
      });
      Key.belongsTo(models.User, {
        foreignKey: 'deleted_by',
        as: 'key_deleted_by'
      });
    }
  }
  Key.init({
    key_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    user_id: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    public_key: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    private_key: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    aes_key: {
      allowNull: false,
      type: DataTypes.STRING
    },
    iv: {
      allowNull: false,
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.ENUM('active', 'non-active', 'deleted'),
      defaultValue: 'active'
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    created_by: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    updated_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
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
    modelName: 'Key',
    tableName: 'keys',
    timestamps: false,
  });
  return Key;
};