import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import User from "./User";

interface UserProfileAttributes {
  user_id: number;
  nickname: string;
  level: number;
  experience: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserProfileCreationAttributes
  extends Omit<UserProfileAttributes, "createdAt" | "updatedAt"> {}

class UserProfile
  extends Model<UserProfileAttributes, UserProfileCreationAttributes>
  implements UserProfileAttributes
{
  public user_id!: number;
  public nickname!: string;
  public level!: number;
  public experience!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserProfile.init(
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
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 50],
        notEmpty: true,
      },
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 999,
      },
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
  },
  {
    sequelize,
    tableName: "user_profiles",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["nickname"],
      },
      {
        fields: ["level"],
      },
      {
        fields: ["experience"],
      },
    ],
  }
);

// User와 UserProfile 간의 관계 설정
User.hasOne(UserProfile, { foreignKey: "user_id", as: "profile" });
UserProfile.belongsTo(User, { foreignKey: "user_id", as: "user" });

export default UserProfile;
