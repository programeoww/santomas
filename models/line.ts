import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

class Line extends Model<InferAttributes<Line>, InferCreationAttributes<Line>> {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */

  declare id: CreationOptional<number>;
  declare name: string;
  declare shift: 'MS' | 'NS' | 'AS' | 'ALL';
  declare finish: number;
  declare status: 'PENDING' | 'OFF' | 'CANCELED' | 'ON' | 'ARCHIVED';
  declare endAt: Date;
  declare startAt: Date;
  declare manager_id: ForeignKey<number>;
  declare product_id: ForeignKey<number>;
  declare rest_time_start: string;
  declare rest_time_end: string;
  declare note: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static associate(models: any) {
    // define association here

    Line.belongsToMany(models.User, {
      through: models.LineWorker,
      foreignKey: 'line_id',
      otherKey: 'worker_id',
      as: 'workers'
    });

    Line.belongsTo(models.User, { 
      foreignKey: 'manager_id', 
      as: 'manager' 
    });

    Line.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product'
    });

    Line.hasMany(models.LineProduction, {
      foreignKey: 'line_id',
      as: 'line_production'
    });
  }
}

const LineModel = (sequelize: Sequelize) => {
  Line.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: DataTypes.STRING,
    shift: DataTypes.ENUM("MS", "NS", "AS", "ALL"),
    finish: DataTypes.INTEGER,
    status: DataTypes.ENUM("PENDING", "OFF", "CANCELED", "ON", "ARCHIVED"),
    endAt: DataTypes.DATE,
    startAt: DataTypes.DATE,
    rest_time_start: DataTypes.STRING,
    rest_time_end: DataTypes.STRING,
    manager_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    note: DataTypes.STRING,
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
  }, {
    sequelize,
    modelName: 'Line',
  });

  return Line;
};

export default LineModel;