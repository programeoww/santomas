'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LineProductions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      line_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Lines',
          key: 'id'
        }
      },
      date: {
        type: Sequelize.DATE
      },
      start_time: {
        type: Sequelize.TIME
      },
      end_time: {
        type: Sequelize.TIME
      },
      product_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Products',
          key: 'id'
        }
      },
      shift: {
        type: Sequelize.ENUM("MS", "NS", "AS", "ALL"),
      },
      target: {
        type: Sequelize.INTEGER
      },
      finish: {
        type: Sequelize.INTEGER
      },
      worker_count: {
        type: Sequelize.INTEGER
      },
      manager_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      note: {
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
    await queryInterface.dropTable('LineProductions');
  }
};