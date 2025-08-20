import { Request, Response, NextFunction } from "express";
import { DBStatus } from "../utils/dbStatus";

/**
 * 데이터베이스 연결이 필요한 라우트에 사용하는 미들웨어
 *
 * 사용법:
 * app.get('/api/data', requireDB, (req, res) => { ... });
 *
 * TODO: 추후 DB 재연결 시도 로직을 추가할 수 있음
 * TODO: 에러 응답 형식을 프로젝트 표준에 맞게 조정 가능
 */
export const requireDB = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!DBStatus.isConnected()) {
    res.status(503).json({
      success: false,
      error: "Database Unavailable",
      message:
        "This endpoint requires an active database connection. Please ensure the database is running.",
      code: "DB_UNAVAILABLE",
      timestamp: new Date().toISOString(),
      endpoint: req.originalUrl,
      method: req.method,
    });
    return;
  }

  next();
};

/**
 * 선택적 DB 연결 체크 미들웨어 (경고만 로그에 남김)
 * DB가 없어도 동작하지만, 제한된 기능만 제공하는 엔드포인트용
 */
export const optionalDB = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!DBStatus.isConnected()) {
    console.warn(
      `⚠️ DB unavailable for ${req.method} ${req.originalUrl} - Limited functionality`
    );
  }

  next();
};

/**
 * 사용 예시:
 *
 * // 전체 라우터에 적용
 * app.use('/api/users', requireDB, userRoutes);
 *
 * // 개별 라우트에 적용
 * app.get('/api/data', requireDB, (req, res) => { ... });
 *
 * // 선택적 DB 사용 (경고만 로그)
 * app.get('/api/info', optionalDB, (req, res) => { ... });
 *
 * // DB 없이도 동작하는 라우트 (미들웨어 없음)
 * app.get('/api/status', (req, res) => { ... });
 */
