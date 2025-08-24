import { Request, Response } from "express";
import Game from "../models/Game";
import { parseGameData } from "../utils/gameParser";

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
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "데이터가 필요합니다. 문자열 형태로 전달해주세요."
 *       500:
 *         description: 서버 오류
 */
export const uploadGameData = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    if (!data || typeof data !== "string") {
      return res.status(400).json({
        success: false,
        message: "데이터가 필요합니다. 문자열 형태로 전달해주세요.",
      });
    }

    // 데이터 파싱
    const parsedData = parseGameData(data);

    if (parsedData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "파싱할 수 있는 데이터가 없습니다.",
      });
    }

    // 데이터베이스에 저장
    const results = [];
    const errors = [];

    for (const gameData of parsedData) {
      try {
        // 기존 데이터가 있는지 확인
        const existingGame = await Game.findOne({
          where: { round: gameData.round },
        });

        if (existingGame) {
          // 기존 데이터 업데이트
          await existingGame.update(gameData);
          results.push({
            round: gameData.round,
            status: "updated",
            message: "기존 데이터가 업데이트되었습니다.",
          });
        } else {
          // 새 데이터 생성
          await Game.create(gameData);
          results.push({
            round: gameData.round,
            status: "created",
            message: "새 데이터가 생성되었습니다.",
          });
        }
      } catch (error) {
        errors.push({
          round: gameData.round,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "로또 데이터 처리 완료",
      total: parsedData.length,
      successCount: results.length,
      errorCount: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("로또 데이터 업로드 오류:", error);
    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
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
 */
export const getGameData = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, round, all } = req.query;

    let whereClause = {};
    if (round) {
      whereClause = { round: Number(round) };
    }

    // all 파라미터가 있으면 페이지네이션 없이 전체 데이터 조회
    if (all === "true" || all === "1") {
      const rows = await Game.findAll({
        where: whereClause,
        order: [["round", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        games: rows,
        totalItems: rows.length,
      });
    }

    // 기존 페이지네이션 로직
    const offset = (Number(page) - 1) * Number(limit);
    const { count, rows } = await Game.findAndCountAll({
      where: whereClause,
      order: [["round", "DESC"]],
      limit: Number(limit),
      offset: offset,
    });

    return res.status(200).json({
      success: true,
      games: rows,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(count / Number(limit)),
        totalItems: count,
        itemsPerPage: Number(limit),
      },
    });
  } catch (error) {
    console.error("로또 데이터 조회 오류:", error);
    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
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
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "해당 회차의 로또 데이터를 찾을 수 없습니다."
 *       500:
 *         description: 서버 오류
 */
export const getGameByRound = async (req: Request, res: Response) => {
  try {
    const { round } = req.params;

    const game = await Game.findOne({
      where: { round: Number(round) },
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "해당 회차의 로또 데이터를 찾을 수 없습니다.",
      });
    }

    return res.status(200).json({
      success: true,
      data: game,
    });
  } catch (error) {
    console.error("로또 데이터 조회 오류:", error);
    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
