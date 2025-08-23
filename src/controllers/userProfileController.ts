import { Request, Response } from "express";
import UserProfile from "../models/UserProfile";
import User from "../models/User";

/**
 * @swagger
 * /api/user-profiles:
 *   post:
 *     summary: 사용자 프로필 생성
 *     description: 새로운 사용자 프로필을 생성합니다.
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
 *               - user_id
 *               - nickname
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: 사용자 고유 ID
 *                 example: 1
 *               nickname:
 *                 type: string
 *                 description: 닉네임 (1-50자)
 *                 example: "게임마스터"
 *               level:
 *                 type: integer
 *                 description: 레벨 (기본값: 1)
 *                 example: 1
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
    const { user_id, nickname, level, experience } = req.body;

    // 입력값 검증
    if (!user_id || !nickname) {
      return res.status(400).json({
        success: false,
        message: "사용자 ID와 닉네임을 모두 입력해주세요.",
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

    // 프로필 이미 존재하는지 확인
    const existingProfile = await UserProfile.findByPk(user_id);
    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "해당 사용자의 프로필이 이미 존재합니다.",
        errorCode: "USER_PROFILE_ALREADY_EXISTS",
      });
    }

    // 닉네임 중복 확인
    const existingNickname = await UserProfile.findOne({ where: { nickname } });
    if (existingNickname) {
      return res.status(409).json({
        success: false,
        message: "이미 사용 중인 닉네임입니다.",
        errorCode: "NICKNAME_ALREADY_EXISTS",
      });
    }

    // 새 프로필 생성
    const newProfile = await UserProfile.create({
      user_id: user_id,
      nickname,
      level: level || 1,
      experience: experience || 0,
    });

    res.status(201).json({
      success: true,
      message: "사용자 프로필이 생성되었습니다.",
      profile: newProfile,
    });
  } catch (error) {
    console.error("사용자 프로필 생성 오류:", error);
    res.status(500).json({
      success: false,
      message: "사용자 프로필 생성 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};
