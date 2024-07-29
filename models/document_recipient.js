'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DocumentRecipient extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DocumentRecipient.belongsTo(models.Document, {
        foreignKey: 'document_id',
        as: 'document',
      });
      DocumentRecipient.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'document_recipient_created_by'
      });
      DocumentRecipient.belongsTo(models.User, {
        foreignKey: 'updated_by',
        as: 'document_recipient_updated_by'
      });
      DocumentRecipient.belongsTo(models.User, {
        foreignKey: 'deleted_by',
        as: 'document_recipient_deleted_by'
      });
    }
  }
  DocumentRecipient.init({
    document_recipient_id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING
    },
    document_id: {
      allowNull: false,
      type: DataTypes.STRING
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING
    },
    note: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM('active', 'deleted'),
      defaultValue: 'active'
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('now')
    },
    created_by: {
      allowNull: false,
      type: DataTypes.STRING
    },
    updated_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: sequelize.fn('now')
    },
    updated_by: {
      allowNull: false,
      type: DataTypes.STRING
    },
    deleted_at: {
      type: DataTypes.DATE
    },
    deleted_by: {
      type: DataTypes.STRING
    },
  }, {
    sequelize,
    modelName: 'DocumentRecipient',
    tableName: 'document_recipients',
    timestamps: false
  });
  return DocumentRecipient;
};