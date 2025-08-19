import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "@Snrnfkeh53",
  database: process.env.DB_NAME || "nums_db",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions:
    process.env.NODE_ENV === "production"
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
});

export const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected successfully");

    // 데이터베이스 동기화 (개발 환경에서만)
    if (process.env.NODE_ENV === "development") {
      // force: true로 설정하면 매번 테이블을 삭제하고 새로 생성 (데이터 리셋)
      // alter: true로 설정하면 기존 데이터를 유지하면서 스키마만 업데이트
      await sequelize.sync({ alter: true });
      console.log("✅ Database synchronized");
    }
  } catch (error) {
    console.error("❌ Failed to connect to PostgreSQL:", error);
    process.exit(1);
  }
};

export default sequelize;
