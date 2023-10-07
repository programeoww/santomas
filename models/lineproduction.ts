import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

class LineProduction extends Model<InferAttributes<LineProduction>, InferCreationAttributes<LineProduction>> {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */

  declare id: CreationOptional<number>;
  declare line_id: ForeignKey<number>;
  declare date: Date;
  declare start_time: string;
  declare end_time: string;
  declare product_id: ForeignKey<number>;
  declare shift: 'MS' | 'NS' | 'AS' | 'ALL';
  declare target: number;
  declare finish: number;
  declare worker_count: number;
  declare manager_id: ForeignKey<number>;
  declare note: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static associate(models: any) {
    // define association here

    LineProduction.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product'
    });

    LineProduction.belongsTo(models.Line, {
      foreignKey: 'line_id',
      as: 'line'
    });

    LineProduction.belongsTo(models.User, {
      foreignKey: 'manager_id',
      as: 'manager'
    });
  }
}

const LineProductionModel = (sequelize: Sequelize) => {
  LineProduction.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    line_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Line',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    date: DataTypes.DATE,
    start_time: DataTypes.TIME,
    end_time: DataTypes.TIME,
    product_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Product',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    shift: DataTypes.ENUM("MS", "NS", "AS", "ALL"),
    target: DataTypes.INTEGER,
    finish: DataTypes.INTEGER,
    worker_count: DataTypes.INTEGER,
    manager_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
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
    modelName: 'LineProduction',
  });

  return LineProduction;
}

export default LineProductionModel;