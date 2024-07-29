'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('documents', {
      document_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      document_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      nomor_surat: {
        allowNull: true,
        type: Sequelize.STRING
      },
      perihal_surat: {
        allowNull: true,
        type: Sequelize.STRING
      },
      tujuan_surat: {
        allowNull: true,
        type: Sequelize.STRING
      },
      tanggal_surat: {
        allowNull: true,
        type: Sequelize.STRING
      },
      kota_surat: {
        allowNull: true,
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM,
        values: ['signed', 'not-signed', 'deleted'],
        defaultValue: "not-signed"
      },
      signed_by: {
        type: Sequelize.STRING,
        references: {
          model: 'users',
          key: 'user_id',
        }
      },
      document_path: {
        allowNull: false,
        type: Sequelize.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      created_by: {
        allowNull: false,
        type: Sequelize.STRING,
        references: {
          model: 'users',
          key: 'user_id',
        }
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      updated_by: {
        allowNull: false,
        type: Sequelize.STRING,
        references: {
          model: 'users',
          key: 'user_id',
        }
      },
      deleted_at: {
        type: Sequelize.DATE
      },
      deleted_by: {
        type: Sequelize.STRING,
        references: {
          model: 'users',
          key: 'user_id',
        }
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('documents');
  }
};