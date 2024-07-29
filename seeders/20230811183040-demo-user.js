'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('users', [{
      user_id: 'E3SPX0G58 ',
      nik: '2539172931028393',
      fullname: 'Endang Prayoga',
      email: 'endangprayoga.9a@gmail.com',
      birth_date: '2023-08-31',
      phone_number: '081234567890',
      password: '$2b$10$NfXSkoHVXIbDYk4TdQu/..YGHS0nDQ9qV9.vlOCytaOZc6lUCtf8y',
      status: 'verified',
      last_signin: '2023-08-08',
      quota: 10,
      created_by: 'E3SPX0G58', 
      updated_by: 'E3SPX0G58', 
      deleted_by: null, 
      created_at: new Date(),
      updated_at: new Date(),
      deleted_by: null,
    }]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
