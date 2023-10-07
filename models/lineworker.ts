import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

class LineWorker extends Model<InferAttributes<LineWorker>, InferCreationAttributes<LineWorker>> {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */

  declare id: CreationOptional<number>;
  declare worker_id: ForeignKey<number>;
  declare line_id: ForeignKey<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static associate(models: any) {
    // define association here
    // LineWorker.hasOne(models.Line, { foreignKey: 'line_id', as: 'line' });
    // LineWorker.hasMany(models.User, { foreignKey: 'worker_id', as: 'worker' });
  }
}

const LineWorkerModel = (sequelize: Sequelize) => {
  LineWorker.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    worker_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
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
    modelName: 'LineWorker',
  });

  return LineWorker;
}

export default LineWorkerModel;