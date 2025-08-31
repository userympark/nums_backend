import { Request, Response } from "express";
import { createUserProfileForUser } from "../services/userProfileService";

/**
 * @swagger
 * /api/user-profiles:
 *   post:
 *     summary: 사용자 프로필 생성
 *     description: 새로운 사용자 프로필을 생성합니다. 인증된 사용자 기준으로 생성되며, 요청 본문에 user_id는 필요하지 않습니다.
 *     tags: [UserProfiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nickname
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: 닉네임 (1-50자)
 *                 example: "게임마스터"
 *               level:
 *                 type: integer
 *                 description: 레벨 (기본값: 0)
 *                 example: 0
 *               experience:
 *                 type: integer
 *                 description: 경험치 (기본값: 0)
 *                 example: 0
 *     responses:
 *       201:
 *         description: 프로필 생성 성공
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
 *                   example: "사용자 프로필이 생성되었습니다."
 *                 profile:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 닉네임 중복 또는 사용자 프로필 이미 존재
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

// 사용자 프로필 생성
export const createUserProfile = async (req: Request, res: Response) => {
  try {
    const authUserId = req.user?.user_id;
    const { nickname, level, experience } = req.body;
    const user_id = authUserId;

    // 인증 및 입력값 검증
    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "인증이 필요합니다.",
        errorCode: "AUTHENTICATION_REQUIRED",
      });
    }
    if (!nickname) {
      return res.status(400).json({
        success: false,
        message: "닉네임을 입력해 주세요.",
        errorCode: "MISSING_REQUIRED_FIELDS",
      });
    }

    // 서비스 레이어에서 검증 및 생성
    const newProfile = await createUserProfileForUser({
      user_id,
      nickname,
      level,
      experience,
    });

    res.status(201).json({
      success: true,
      message: "사용자 프로필이 생성되었습니다.",
      profile: newProfile,
    });
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
 * /api/users/me/profile:
 *   post:
 *     summary: 사용자 프로필 생성 (me)
 *     description: 인증된 사용자의 프로필을 생성합니다. 요청 본문에 user_id는 필요하지 않습니다.
 *     tags: [UserProfiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nickname
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: 닉네임 (1-50자)
 *                 example: "게임마스터"
 *               level:
 *                 type: integer
 *                 description: 레벨 (기본값: 0)
 *                 example: 0
 *               experience:
 *                 type: integer
 *                 description: 경험치 (기본값: 0)
 *                 example: 0
 *     responses:
 *       201:
 *         description: 프로필 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 profile:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 닉네임 중복 또는 사용자 프로필 이미 존재
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
