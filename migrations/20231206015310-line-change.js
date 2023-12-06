'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    queryInterface.removeColumn('lineproductions', 'rest_time_start');
    queryInterface.removeColumn('lineproductions', 'rest_time_end');

    queryInterface.addColumn('lines', 'rest_time_start', {
      type: Sequelize.STRING
    });

    queryInterface.addColumn('lines', 'rest_time_end', {
      type: Sequelize.STRING
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    queryInterface.removeColumn('lines', 'rest_time_start');
    queryInterface.removeColumn('lines', 'rest_time_end');

    queryInterface.addColumn('lineproductions', 'rest_time_start', {
      type: Sequelize.STRING
    });

    queryInterface.addColumn('lineproductions', 'rest_time_end', {
      type: Sequelize.STRING
    });
  }
};
