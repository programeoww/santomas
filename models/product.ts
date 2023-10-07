import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

class Product extends Model<InferAttributes<Product>, InferCreationAttributes<Product>> {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */

  declare id: CreationOptional<number>;
  declare name: string;
  declare target: string;
  declare key_QR: string;
  declare pac: number;
  declare box: number;
  declare note: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare lines?: any[];
  declare line_production?: any[];

  static associate(models: any) {
    // define association here
    // Product.belongsTo(models.Line, { foreignKey: 'product_id', as: 'product' });
    // Product.belongsTo(models.LineProduction, { foreignKey: 'product_id', as: 'product' });

    Product.hasMany(models.Line, { 
      foreignKey: 'product_id', 
      as: 'lines' 
    });

    Product.hasMany(models.LineProduction, {
      foreignKey: 'product_id',
      as: 'line_production'
    });
  }
}

const ProductModel = (sequelize: Sequelize) => {
  Product.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: DataTypes.STRING,
    target: DataTypes.STRING,
    key_QR: DataTypes.STRING,
    pac: DataTypes.NUMBER,
    box: DataTypes.NUMBER,
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
    modelName: 'Product',
  });

  return Product;
}

export default ProductModel;