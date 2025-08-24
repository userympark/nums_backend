import { Request, Response } from "express";
import UserConfig from "../models/UserConfig";
import User from "../models/User";
import Theme from "../models/Theme";

/**
 * @swagger
 * /api/users/me/configs:
 *   get:
 *     summary: 사용자 설정 조회
 *     description: 현재 로그인한 사용자의 설정 정보를 조회합니다.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 설정 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 config:
 *                   $ref: '#/components/schemas/UserConfig'
 *       404:
 *         description: 설정을 찾을 수 없음
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

// 사용자 설정 조회
export const getUserConfig = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "인증되지 않은 사용자입니다.",
        errorCode: "UNAUTHORIZED",
      });
    }

    const config = await UserConfig.findByPk(user_id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "username"],
        },
        {
          model: Theme,
          as: "theme",
          attributes: ["theme_id", "name", "mode", "colors"],
        },
      ],
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "사용자 설정을 찾을 수 없습니다.",
        errorCode: "USER_CONFIG_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      config,
    });
  } catch (error) {
    console.error("사용자 설정 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "사용자 설정 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};

/**
 * @swagger
 * /api/users/me/configs:
 *   post:
 *     summary: 사용자 설정 생성
 *     description: 현재 로그인한 사용자의 설정을 생성합니다.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - active_theme
 *             properties:
 *               active_theme:
 *                 type: integer
 *                 description: 마지막 사용 테마 ID
 *                 example: 1
 *     responses:
 *       201:
 *         description: 설정 생성 성공
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
 *                   example: "사용자 설정이 생성되었습니다."
 *                 config:
 *                   $ref: '#/components/schemas/UserConfig'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 사용자 설정 이미 존재
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

// 사용자 설정 생성
export const createUserConfig = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "인증되지 않은 사용자입니다.",
        errorCode: "UNAUTHORIZED",
      });
    }

    const { active_theme } = req.body;

    // 입력값 검증
    if (!active_theme) {
      return res.status(400).json({
        success: false,
        message: "테마 ID를 입력해주세요.",
        errorCode: "MISSING_REQUIRED_FIELDS",
      });
    }

    // 사용자 존재 확인
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "해당 사용자를 찾을 수 없습니다.",
        errorCode: "USER_NOT_FOUND",
      });
    }

    // 테마 존재 확인
    const theme = await Theme.findByPk(active_theme);
    if (!theme) {
      return res.status(404).json({
        success: false,
        message: "해당 테마를 찾을 수 없습니다.",
        errorCode: "THEME_NOT_FOUND",
      });
    }

    // 설정 이미 존재하는지 확인
    const existingConfig = await UserConfig.findByPk(user_id);
    if (existingConfig) {
      return res.status(409).json({
        success: false,
        message: "해당 사용자의 설정이 이미 존재합니다.",
        errorCode: "USER_CONFIG_ALREADY_EXISTS",
      });
    }

    // 새 설정 생성
    const newConfig = await UserConfig.create({
      user_id,
      active_theme,
    });

    res.status(201).json({
      success: true,
      message: "사용자 설정이 생성되었습니다.",
      config: newConfig,
    });
  } catch (error) {
    console.error("사용자 설정 생성 오류:", error);
    res.status(500).json({
      success: false,
      message: "사용자 설정 생성 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};

/**
 * @swagger
 * /api/users/me/configs:
 *   put:
 *     summary: 사용자 설정 수정
 *     description: 현재 로그인한 사용자의 설정을 수정합니다.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - active_theme
 *             properties:
 *               active_theme:
 *                 type: integer
 *                 description: 마지막 사용 테마 ID
 *                 example: 2
 *     responses:
 *       200:
 *         description: 설정 수정 성공
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
 *                   example: "사용자 설정이 수정되었습니다."
 *                 config:
 *                   $ref: '#/components/schemas/UserConfig'
 *       404:
 *         description: 설정을 찾을 수 없음
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

// 사용자 설정 수정
export const updateUserConfig = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "인증되지 않은 사용자입니다.",
        errorCode: "UNAUTHORIZED",
      });
    }

    const { active_theme } = req.body;

    // 설정 존재 확인
    const config = await UserConfig.findByPk(user_id);
    if (!config) {
      return res.status(404).json({
        success: false,
        message: "사용자 설정을 찾을 수 없습니다.",
        errorCode: "USER_CONFIG_NOT_FOUND",
      });
    }

    // 테마 존재 확인
    if (active_theme) {
      const theme = await Theme.findByPk(active_theme);
      if (!theme) {
        return res.status(404).json({
          success: false,
          message: "해당 테마를 찾을 수 없습니다.",
          errorCode: "THEME_NOT_FOUND",
        });
      }
    }

    // 설정 수정
    await config.update({
      active_theme: active_theme || config.active_theme,
    });

    res.json({
      success: true,
      message: "사용자 설정이 수정되었습니다.",
      config,
    });
  } catch (error) {
    console.error("사용자 설정 수정 오류:", error);
    res.status(500).json({
      success: false,
      message: "사용자 설정 수정 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};

/**
 * @swagger
 * /api/users/me/configs:
 *   delete:
 *     summary: 사용자 설정 삭제
 *     description: 현재 로그인한 사용자의 설정을 삭제합니다.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 설정 삭제 성공
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
 *                   example: "사용자 설정이 삭제되었습니다."
 *       404:
 *         description: 설정을 찾을 수 없음
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

// 사용자 설정 삭제
export const deleteUserConfig = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "인증되지 않은 사용자입니다.",
        errorCode: "UNAUTHORIZED",
      });
    }

    // 설정 존재 확인
    const config = await UserConfig.findByPk(user_id);
    if (!config) {
      return res.status(404).json({
        success: false,
        message: "사용자 설정을 찾을 수 없습니다.",
        errorCode: "USER_CONFIG_NOT_FOUND",
      });
    }

    // 설정 삭제
    await config.destroy();

    res.json({
      success: true,
      message: "사용자 설정이 삭제되었습니다.",
    });
  } catch (error) {
    console.error("사용자 설정 삭제 오류:", error);
    res.status(500).json({
      success: false,
      message: "사용자 설정 삭제 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};
