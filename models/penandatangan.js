'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PenandaTangan extends Model {
    static associate(models) {
      // Define association here
      PenandaTangan.belongsTo(models.Document, {
        foreignKey: 'document_id',
        as: 'document'
      });
    }
  }

  PenandaTangan.init({
    penanda_tangan_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    document_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'documents',
        key: 'document_id'
      }
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jabatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    instansi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'PenandaTangan',
    tableName: 'penanda_tangans',
  });

  return PenandaTangan;
};
