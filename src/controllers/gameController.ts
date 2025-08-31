import { Request, Response } from "express";
import { listGamesService, uploadGameDataService, getGameByRoundService, getRecentGameService } from "../services/gameService";

/**
 * @swagger
 * /api/games/upload:
 *   post:
 *     summary: 로또 데이터 업로드
 *     description: 탭으로 구분된 로또 데이터를 파싱하여 데이터베이스에 저장
 *     tags: [Game]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: string
 *                 description: 탭으로 구분된 로또 데이터 (회차, 추첨일, 당첨자수, 당첨금액, 당첨번호 등)
 *                 example: "600\t2014.05.31\t15\t901,798,725원\t41\t54,987,728원\t1,518\t1,485,176원\t77,138\t50,000원\t1,258,677\t5,000원\t5\t11\t14\t27\t29\t36\t44"
 *     responses:
 *       200:
 *         description: 로또 데이터 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: 잘못된 요청 데이터
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const uploadGameData = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    const result = await uploadGameDataService(data);
    return res.status(200).json({ success: true, message: "로또 데이터 처리 완료", ...result });
  } catch (error: any) {
    const status = error?.statusCode || 500;
    const code = error?.errorCode || "INTERNAL_SERVER_ERROR";
    return res.status(status).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorCode: code,
    });
  }
};

/**
 * @swagger
 * /api/games:
 *   get:
 *     summary: 로또 데이터 조회
 *     description: 로또 데이터를 페이지네이션과 함께 조회하거나 전체 데이터를 조회
 *     tags: [Game]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: round
 *         schema:
 *           type: integer
 *         description: 특정 회차 조회
 *       - in: query
 *         name: all
 *         schema:
 *           type: string
 *           enum: [true, 1]
 *         description: 전체 데이터 조회 (페이지네이션 없음)
 *     responses:
 *       200:
 *         description: 로또 데이터 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameListResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getGameData = async (req: Request, res: Response) => {
  try {
    const data = await listGamesService(req.query as any);
    if (data.mode === "all") {
      return res.status(200).json({ success: true, games: data.games, totalItems: data.totalItems });
    }
    return res.status(200).json({ success: true, games: data.games, pagination: data.pagination });
  } catch (error: any) {
    const status = error?.statusCode || 500;
    const code = error?.errorCode || "INTERNAL_SERVER_ERROR";
    return res.status(status).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorCode: code,
    });
  }
};

/**
 * @swagger
 * /api/games/{round}:
 *   get:
 *     summary: 특정 회차 로또 데이터 조회
 *     description: 지정된 회차의 로또 데이터를 조회
 *     tags: [Game]
 *     parameters:
 *       - in: path
 *         name: round
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조회할 회차
 *         example: 600
 *     responses:
 *       200:
 *         description: 로또 데이터 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Game'
 *       404:
 *         description: 해당 회차의 데이터를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getGameByRound = async (req: Request, res: Response) => {
  try {
    const { round } = req.params;
    const game = await getGameByRoundService(round);
    return res.status(200).json({ success: true, data: game });
  } catch (error: any) {
    const status = error?.statusCode || 500;
    const code = error?.errorCode || "INTERNAL_SERVER_ERROR";
    return res.status(status).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorCode: code,
    });
  }
};

/**
 * @swagger
 * /api/games/recent:
 *   get:
 *     summary: 가장 최근(최대 회차) 로또 데이터 조회
 *     description: round 값이 가장 큰 최근 게임 정보를 반환합니다.
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: 최근 로또 데이터 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Game'
 *       404:
 *         description: 데이터 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getRecentGame = async (_req: Request, res: Response) => {
  try {
    const game = await getRecentGameService();
    return res.status(200).json({ success: true, data: game });
  } catch (error: any) {
    const status = error?.statusCode || 500;
    const code = error?.errorCode || "INTERNAL_SERVER_ERROR";
    return res.status(status).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorCode: code,
    });
  }
};
