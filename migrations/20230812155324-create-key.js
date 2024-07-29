'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('keys', {
      key_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        allowNull: false,
        type: Sequelize.STRING,
        references: {
          model: 'users',
          key: 'user_id',
        }
      },
      public_key: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      private_key: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      aes_key: {
        allowNull: false,
        type: Sequelize.STRING
      },
      iv: {
        allowNull: false,
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM,
        values: ['active', 'non-active', 'deleted'],
        defaultValue: "active"
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
    await queryInterface.dropTable('keys');
  }
};
