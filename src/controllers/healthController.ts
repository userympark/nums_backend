import { Request, Response } from "express";
import { DBStatus } from "../utils/dbStatus";

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: 서버 상태 확인
 *     description: 서버와 데이터베이스의 상태를 확인합니다. DB 연결 없이도 동작합니다.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: 서버 정상 동작
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Server is healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T00:00:00.000Z"
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 database:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [connected, disconnected]
 *                       example: "connected"
 *                     type:
 *                       type: string
 *                       example: "PostgreSQL + Sequelize"
 *       503:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server is unhealthy"
 */

// 헬스 체크 엔드포인트 (DB 연결 없이도 동작)
export const healthCheck = (req: Request, res: Response) => {
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
};
