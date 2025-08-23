import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import User from "./User";
import Theme from "./Theme";

interface UserConfigAttributes {
  user_id: number;
  active_theme: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserConfigCreationAttributes
  extends Omit<UserConfigAttributes, "createdAt" | "updatedAt"> {}

class UserConfig
  extends Model<UserConfigAttributes, UserConfigCreationAttributes>
  implements UserConfigAttributes
{
  public user_id!: number;
  public active_theme!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserConfig.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    active_theme: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Theme,
        key: "theme_id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT", // 테마가 삭제되어도 사용자 설정은 유지
    },
  },
  {
    sequelize,
    tableName: "user_configs",
    timestamps: true,
    indexes: [
      {
        fields: ["active_theme"],
      },
    ],
  }
);

// User와 UserConfig 간의 관계 설정
User.hasOne(UserConfig, { foreignKey: "user_id", as: "config" });
UserConfig.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Theme과 UserConfig 간의 관계 설정
Theme.hasMany(UserConfig, { foreignKey: "active_theme", as: "userConfigs" });
UserConfig.belongsTo(Theme, { foreignKey: "active_theme", as: "theme" });

export default UserConfig;
