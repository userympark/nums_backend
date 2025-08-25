import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

interface ThemeAttributes {
  theme_id: number;
  name: string;
  name_kr: string;
  mode: "light" | "dark";
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    error: string;
    info: string;
    success: string;
    warning: string;
    background: string;
    surface: string;
    "on-primary": string;
    "on-secondary": string;
    "on-background": string;
    "on-surface": string;
  };
  variables?: any; // JSON 타입, nullable
  is_default: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ThemeCreationAttributes
  extends Omit<ThemeAttributes, "theme_id" | "createdAt" | "updatedAt"> {}

class Theme
  extends Model<ThemeAttributes, ThemeCreationAttributes>
  implements ThemeAttributes
{
  public theme_id!: number;
  public name!: string;
  public name_kr!: string;
  public mode!: "light" | "dark";
  public colors!: {
    primary: string;
    secondary: string;
    accent: string;
    error: string;
    info: string;
    success: string;
    warning: string;
    background: string;
    surface: string;
    "on-primary": string;
    "on-secondary": string;
    "on-background": string;
    "on-surface": string;
  };
  public variables?: any; // JSON 타입, nullable
  public is_default!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Theme.init(
  {
    theme_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 50],
      },
    },
    name_kr: {
      type: DataTypes.STRING(50),
      allowNull: false, // 데이터 설정 후 false로 변경
      validate: {
        len: [1, 50],
      },
    },
    mode: {
      type: DataTypes.ENUM("light", "dark"),
      allowNull: false,
      validate: {
        isIn: [["light", "dark"]],
      },
    },
    colors: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidColors(value: any) {
          const requiredColors = [
            "primary",
            "secondary",
            "accent",
            "error",
            "info",
            "success",
            "warning",
            "background",
            "surface",
            "on-primary",
            "on-secondary",
            "on-background",
            "on-surface",
          ];

          if (!value || typeof value !== "object") {
            throw new Error("Colors must be an object");
          }

          for (const color of requiredColors) {
            if (!value[color] || typeof value[color] !== "string") {
              throw new Error(`Missing or invalid color: ${color}`);
            }

            // HEX 컬러 코드 검증 (선택사항)
            if (!/^#[0-9A-F]{6}$/i.test(value[color])) {
              throw new Error(`Invalid HEX color format: ${color}`);
            }
          }
        },
      },
    },
    variables: {
      type: DataTypes.JSON,
      allowNull: true, // nullable
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "themes",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["name"],
      },
      {
        fields: ["mode"],
      },
      {
        fields: ["is_default"],
      },
    ],
  }
);

export default Theme;
