import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

interface UserAttributes {
  uid: number;
  username: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes
  extends Omit<UserAttributes, "uid" | "createdAt" | "updatedAt"> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public uid!: number;
  public username!: string;
  public password!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    uid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50], // 3-50자 길이 제한
        is: /^[a-zA-Z0-9_]+$/, // 영문, 숫자, 언더스코어만 허용
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255], // 최소 6자 이상
      },
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["username"],
      },
    ],
  }
);

export default User;
