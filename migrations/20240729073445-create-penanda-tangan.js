'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('penanda_tangans', {
      penanda_tangan_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      document_id: {
        allowNull: false,
        type: Sequelize.STRING,
        references: {
          model: 'documents',
          key: 'document_id',
        }
      },
      nama: {
        allowNull: true,
        type: Sequelize.STRING
      },
      jabatan: {
        allowNull: true,
        type: Sequelize.STRING
      },
      instansi: {
        allowNull: true,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PenandaTangans');
  }
};