import { Request, Response } from "express";
import { listAllThemesService } from "../services/themeService";

/**
 * @swagger
 * /api/themes:
 *   get:
 *     summary: 모든 테마 정보 조회
 *     description: themes 테이블의 모든 테마 정보를 JSON으로 반환합니다. 인증이 필요하지 않습니다.
 *     tags: [Themes]
 *     responses:
 *       200:
 *         description: 테마 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 themes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Theme'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// 모든 테마 정보 조회 (Public API)
export const getAllThemes = async (req: Request, res: Response) => {
  try {
    const themes = await listAllThemesService();

    res.json({
      success: true,
      themes,
    });
  } catch (error) {
    console.error("테마 정보 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "테마 정보 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};

