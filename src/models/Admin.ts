import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

interface AdminAttributes {
  admin_id: number;
  user_id: number; // users 테이블 참조
  role: "admin" | "super_admin";
  permissions: string[]; // 권한 목록 (예: ["user_manage", "theme_manage", "game_manage"])
  is_active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AdminCreationAttributes
  extends Omit<AdminAttributes, "admin_id" | "createdAt" | "updatedAt"> {}

class Admin
  extends Model<AdminAttributes, AdminCreationAttributes>
  implements AdminAttributes
{
  public admin_id!: number;
  public user_id!: number;
  public role!: "admin" | "super_admin";
  public permissions!: string[];
  public is_active!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Admin.init(
  {
    admin_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: "users",
        key: "user_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    role: {
      type: DataTypes.ENUM("admin", "super_admin"),
      allowNull: false,
      defaultValue: "admin",
      validate: {
        isIn: [["admin", "super_admin"]],
      },
    },
    permissions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidPermissions(value: string[]) {
          const validPermissions = [
            "user_manage",
            "theme_manage",
            "game_manage",
            "admin_manage",
            "system_manage",
          ];

          for (const permission of value) {
            if (!validPermissions.includes(permission)) {
              throw new Error(`Invalid permission: ${permission}`);
            }
          }
        },
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "admins",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id"],
      },
      {
        fields: ["role"],
      },
      {
        fields: ["is_active"],
      },
    ],
  }
);

export default Admin;
