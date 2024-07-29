'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Document extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Document.belongsTo(models.User, {
        foreignKey: 'signed_by',
        as: 'signedByUser',
      });
      Document.hasMany(models.DocumentRecipient, {
        foreignKey: 'document_id',
        as: 'documentrecipients'
      });
      Document.hasMany(models.PenandaTangan, {
        foreignKey: 'document_id',
        as: 'penandatangans'
      });
      Document.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'document_created_by'
      });
      Document.belongsTo(models.User, {
        foreignKey: 'updated_by',
        as: 'document_updated_by'
      });
      Document.belongsTo(models.User, {
        foreignKey: 'deleted_by',
        as: 'document_deleted_by'
      });
    }
  }
  Document.init({
    document_id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING
    },
    document_name: {
      allowNull: false,
      type: DataTypes.STRING
    },
    nomor_surat: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    perihal_surat: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    tujuan_surat: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    tanggal_surat: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    kota_surat: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM('signed', 'not-signed', 'deleted'),
      defaultValue: 'not-signed'
    },
    signed_by: {
      type: DataTypes.STRING,
    },
    document_path: {
      allowNull: false,
      type: DataTypes.STRING
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
    modelName: 'Document',
    tableName: 'documents',
    timestamps: false
  });
  return Document;
};