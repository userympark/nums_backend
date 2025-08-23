import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { DBStatus } from "../utils/dbStatus";
import User from "../models/User";
import Game from "../models/Game";
import Theme from "../models/Theme";
import UserProfile from "../models/UserProfile";
import UserConfig from "../models/UserConfig";

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
    min: 0,
    acquire: 5000, // 5초로 단축
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
      : {
          // 개발 환경에서 연결 타임아웃 설정
          connectTimeout: 3000, // 3초
        },
});

export const connectDB = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected successfully");

    // 글로벌 DB 상태 업데이트 - 연결 성공
    DBStatus.setConnected(true);

    // 데이터베이스 동기화 (개발 환경에서만)
    if (process.env.NODE_ENV === "development") {
      // force: true로 설정하면 매번 테이블을 삭제하고 새로 생성 (데이터 리셋)
      // alter: true로 설정하면 기존 데이터를 유지하면서 스키마만 업데이트
      await sequelize.sync({ alter: true });
      console.log("✅ Database synchronized");

      // 모델들이 제대로 로드되었는지 확인
      console.log(
        "📋 Available models: User, Game, Theme, UserProfile, UserConfig"
      );
    }
    return true;
  } catch (error) {
    console.error("❌ Failed to connect to PostgreSQL:", error);

    // 글로벌 DB 상태 업데이트 - 연결 실패
    DBStatus.setConnected(false);

    // 개발 환경에서는 DB 연결 실패해도 서버 계속 실행
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "⚠️ Running in development mode without database connection"
      );
      console.warn("⚠️ Database-dependent features will be unavailable");
      return false;
    }

    // 프로덕션 환경에서는 DB 연결 실패 시 에러를 던지지만 프로세스는 종료하지 않음
    // 상위에서 처리하도록 함
    throw new Error(`Database connection failed: ${error}`);
  }
};

// DB 재연결 시도 함수
export const reconnectDB = async (): Promise<boolean> => {
  console.log("🔄 Attempting to reconnect to database...");
  return await connectDB();
};

// 주기적 DB 연결 상태 체크 (개발 환경에서만)
export const startDBHealthCheck = () => {
  if (process.env.NODE_ENV !== "development") return;

  const checkInterval = 30000; // 30초마다 체크

  setInterval(async () => {
    if (!DBStatus.isConnected()) {
      try {
        const reconnected = await reconnectDB();
        if (reconnected) {
          console.log("✅ Database reconnected successfully!");
        }
      } catch (error) {
        // 재연결 실패는 조용히 처리 (로그만 남김)
        console.log("🔄 Database still unavailable, will retry later...");
      }
    }
  }, checkInterval);
};

export default sequelize;
