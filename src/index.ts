import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB, startDBHealthCheck } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import { requireDB, optionalDB } from "./middleware/dbCheck";
import { DBStatus } from "./utils/dbStatus";
import gameRoutes from "./routes/gameRoutes";
import userRoutes from "./routes/userRoutes";
import userProfileRoutes from "./routes/userProfileRoutes";
import userConfigRoutes from "./routes/userConfigRoutes";
import adminRoutes from "./routes/adminRoutes";
import themeRoutes from "./routes/themeRoutes";
import { healthCheck } from "./controllers/healthController";

import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger";

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "8080", 10);
const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [
  "http://localhost:3000",
];

// 미들웨어 설정
app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 기본 라우트
app.get("/", (req, res) => {
  res.json({
    message: "NUMS Backend API Server",
    version: "1.0.0",
    status: "running",
    database: "PostgreSQL + Sequelize",
    endpoints: {
      health: "/api/health",
    },
  });
});

// 헬스 체크 엔드포인트 (DB 연결 없이도 동작)
app.get("/api/health", optionalDB, healthCheck);


// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// 로또 API 라우터 (DB 연결 필수)
// TODO: 개별 라우트별로 requireDB 미들웨어 적용 여부 조정 가능
app.use("/api/games", requireDB, gameRoutes);

// 사용자 API 라우터 (DB 연결 필수)
app.use("/api/users", userRoutes);

// 사용자 프로필 API 라우터 (DB 연결 필수, 인증 필요)
// Deprecated: keep compatibility, but prefer /api/users/me/profile
app.use("/api/user-profiles", userProfileRoutes);
// New preferred route for profile under authenticated user namespace
app.use("/api/users/me/profile", userProfileRoutes);

// 사용자 설정 API 라우터 (DB 연결 필수, 인증 필요)
app.use("/api/users/me/configs", userConfigRoutes);

// 테마 API 라우터 (DB 연결 필수, Public API)
app.use("/api/themes", themeRoutes);

// 관리자 API 라우터 (DB 연결 필수, 인증 및 관리자 권한 필요)
app.use("/api/admins", adminRoutes);

// 404 핸들러
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// 에러 핸들러
app.use(errorHandler);

// 서버 시작
const startServer = async () => {
  let dbConnected = false;

  try {
    // 데이터베이스 연결 시도
    dbConnected = await connectDB();
  } catch (error) {
    console.error("❌ Database connection failed:", error);

    // 개발 환경에서는 DB 없이도 서버 실행
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️ Continuing without database in development mode");
      dbConnected = false;
    } else {
      // 프로덕션에서는 DB 연결 필수
      console.error("❌ Database connection is required in production");
      process.exit(1);
    }
  }

  // 서버 시작
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);

    if (dbConnected) {
      console.log(`🗄️ PostgreSQL + Sequelize Ready!`);
    } else {
      console.log(`⚠️ Running without database connection`);
      console.log(`⚠️ Database-dependent endpoints will return 503 errors`);

      // 개발 환경에서 DB 헬스체크 시작
      if (process.env.NODE_ENV === "development") {
        console.log(`🔄 Starting database health check (will retry every 30s)`);
        startDBHealthCheck();
      }
    }

    console.log(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
  });
};

startServer();
