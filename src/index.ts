import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import { requireDB, optionalDB } from "./middleware/dbCheck";
import { DBStatus } from "./utils/dbStatus";
import lottoRoutes from "./routes/lottoRoutes";

import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger";

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// 미들웨어 설정
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
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
app.get("/api/health", optionalDB, (req, res) => {
  // TODO: 글로벌 DB 상태 사용 - 실시간 연결 체크 없이 캐시된 상태 사용
  const dbStatus = DBStatus.isConnected() ? "connected" : "disconnected";

  res.json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      status: dbStatus,
      type: "PostgreSQL + Sequelize",
    },
  });
});

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// 로또 API 라우터 (DB 연결 필수)
// TODO: 개별 라우트별로 requireDB 미들웨어 적용 여부 조정 가능
app.use("/api/lotto", requireDB, lottoRoutes);

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
  try {
    // 데이터베이스 연결 시도
    const dbConnected = await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);

      if (dbConnected) {
        console.log(`🗄️ PostgreSQL + Sequelize Ready!`);
      } else {
        console.log(
          `⚠️ Running without database connection (development mode)`
        );
      }
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
