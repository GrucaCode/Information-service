import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';
import User from './User.js';

const SavedArticle = sequelize.define('SavedArticle', {
  newsId: {type: DataTypes.STRING, allowNull: false},
  indexes: [
    {
      unique: true,
      fields: ['userId', 'newsId']
    }
  ]
});

User.hasMany(SavedArticle, { foreignKey: 'userId', onDelete: 'CASCADE' });
SavedArticle.belongsTo(User, { foreignKey: 'userId' });

export default SavedArticle;