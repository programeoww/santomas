import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    declare id: CreationOptional<number>;
    declare name: string;
    declare password: string;
    declare role: 'admin' | 'worker' | 'manager' | 'tivi';
    declare username: string;
    declare note: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    static associate(models: any) {
        // User.belongsTo(models.Line, { foreignKey: 'manager_id', as: 'manager' });
        // User.belongsTo(models.LineProduction, { foreignKey: 'manager_id', as: 'manager' });
        // User.belongsTo(models.LineWorker, { foreignKey: 'worker_id', as: 'worker' });
        User.belongsToMany(models.Line, {
            through: models.LineWorker,
            foreignKey: 'worker_id',
            otherKey: 'line_id',
            as: 'lines'
        });

        User.hasMany(models.Line, { 
            foreignKey: 'manager_id', 
            as: 'line'
        });

        User.hasMany(models.LineProduction, {
            foreignKey: 'manager_id',
            as: 'line_production_manager'   
        });
    }
}

const UserModel = (sequelize: Sequelize) => {
    User.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: DataTypes.STRING,
        password: DataTypes.STRING,
        role: DataTypes.ENUM('admin', 'worker', 'manager', 'tivi'),
        username: DataTypes.STRING,
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
        modelName: 'User',
    });

    return User;
}

export default UserModel;