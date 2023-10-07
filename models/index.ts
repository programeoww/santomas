import { Sequelize } from 'sequelize';

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
import UserModel from './user';
import LineModel from './line';
import LineProductionModel from './lineproduction';
import ProductModel from './product';
import LineWorkerModel from './lineworker';

export const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: false,
  }
);

const User = UserModel(sequelize);
const Line = LineModel(sequelize);
const Product = ProductModel(sequelize);
const LineProduction = LineProductionModel(sequelize);
const LineWorker = LineWorkerModel(sequelize);

User.associate(sequelize.models);
Line.associate(sequelize.models);
Product.associate(sequelize.models);
LineProduction.associate(sequelize.models);
LineWorker.associate(sequelize.models);

export {
  User,
  Line,
  Product,
  LineProduction,
  LineWorker,
};