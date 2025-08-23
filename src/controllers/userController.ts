import { Request, Response } from "express";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import User from "../models/User";
import UserProfile from "../models/UserProfile";

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: 회원가입
 *     description: 새로운 사용자를 등록합니다. (인증 불필요)
 *     tags: [Users]
 *     security: [] # 인증 불필요
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: 사용자명 (3-50자, 영문/숫자/언더스코어만)
 *                 example: "testuser"
 *               password:
 *                 type: string
 *                 description: 비밀번호 (최소 6자)
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: 회원가입 성공
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
 *                   example: "회원가입이 완료되었습니다."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 profile:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: 잘못된 요청
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
 *                   example: "사용자명과 비밀번호를 모두 입력해주세요."
 *       409:
 *         description: 사용자명 중복
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
 *                   example: "이미 존재하는 사용자명입니다."
 *       500:
 *         description: 서버 오류
 */

// 회원가입
export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // 입력값 검증
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "사용자명과 비밀번호를 모두 입력해주세요.",
        errorCode: "MISSING_REQUIRED_FIELDS",
      });
    }

    // 사용자명 중복 확인
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "이미 존재하는 사용자명입니다.",
        errorCode: "USERNAME_ALREADY_EXISTS",
      });
    }

    // 비밀번호 해시화
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 트랜잭션으로 사용자와 프로필 동시 생성
    const sequelize = User.sequelize;
    if (!sequelize) {
      throw new Error("Database connection not available");
    }

    const result = await sequelize.transaction(async (t) => {
      // 1. 새 사용자 생성
      const newUser = await User.create(
        {
          username,
          password: hashedPassword,
        },
        { transaction: t }
      );

      // 2. 자동으로 user_profiles 테이블에 프로필 생성
      const newProfile = await UserProfile.create(
        {
          user_id: newUser.user_id,
          nickname: username, // 초기값은 username과 동일
          level: 0, // 초기값 0
          experience: 0, // 초기값 0
        },
        { transaction: t }
      );

      return { newUser, newProfile };
    });

    // 응답에서 비밀번호 제외
    const { password: _, ...userWithoutPassword } = result.newUser.toJSON();

    res.status(201).json({
      success: true,
      message: "회원가입이 완료되었습니다.",
      user: userWithoutPassword,
      profile: result.newProfile,
    });
  } catch (error) {
    console.error("회원가입 오류:", error);
    res.status(500).json({
      success: false,
      message: "회원가입 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 사용자 목록 조회
 *     description: 모든 사용자 목록을 조회합니다 (관리자용, 인증 필요).
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: 서버 오류
 */

// 사용자 목록 조회 (관리자용)
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] }, // 비밀번호 제외
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("사용자 목록 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "사용자 목록 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};

/**
 * @swagger
 * /api/users/{user_id}:
 *   get:
 *     summary: 특정 사용자 조회
 *     description: 사용자 ID를 통해 특정 사용자 정보를 조회합니다. (인증 필요)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 고유 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 사용자 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: 사용자를 찾을 수 없음
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
 *                   example: "사용자를 찾을 수 없습니다."
 *       500:
 *         description: 서버 오류
 */

// 특정 사용자 조회
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const user = await User.findByPk(user_id, {
      attributes: { exclude: ["password"] }, // 비밀번호 제외
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다.",
        errorCode: "USER_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("사용자 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "사용자 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: 로그인
 *     description: 사용자 로그인 후 JWT 토큰을 반환합니다. (인증 불필요)
 *     tags: [Users]
 *     security: [] # 인증 불필요
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: 사용자명
 *                 example: "testuser"
 *               password:
 *                 type: string
 *                 description: 비밀번호
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: 로그인 성공
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
 *                   example: "로그인이 완료되었습니다."
 *                 token:
 *                   type: string
 *                   description: JWT 토큰
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: 잘못된 요청
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
 *                   example: "사용자명과 비밀번호를 모두 입력해주세요."
 *       401:
 *         description: 인증 실패
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
 *                   example: "사용자명 또는 비밀번호가 올바르지 않습니다."
 *       500:
 *         description: 서버 오류
 */

// 로그인
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // 입력값 검증
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "사용자명과 비밀번호를 모두 입력해주세요.",
        errorCode: "MISSING_REQUIRED_FIELDS",
      });
    }

    // 사용자 조회
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "사용자명 또는 비밀번호가 올바르지 않습니다.",
        errorCode: "INVALID_CREDENTIALS",
      });
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "사용자명 또는 비밀번호가 올바르지 않습니다.",
        errorCode: "INVALID_CREDENTIALS",
      });
    }

    // JWT 토큰 생성
    const jwtSecret = process.env.JWT_SECRET || "fallback_secret_key";

    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
      },
      jwtSecret,
      { expiresIn: "24h" }
    );

    // 응답에서 비밀번호 제외
    const { password: _, ...userWithoutPassword } = user.toJSON();

    res.json({
      success: true,
      message: "로그인이 완료되었습니다.",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("로그인 오류:", error);
    res.status(500).json({
      success: false,
      message: "로그인 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: 본인 정보 조회
 *     description: JWT 토큰을 통해 본인의 사용자 정보와 프로필 정보를 조회합니다.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 본인 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 profile:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 사용자 또는 프로필을 찾을 수 없음
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

// 본인 정보 조회
export const getMe = async (req: Request, res: Response) => {
  try {
    // JWT 토큰에서 user_id 추출 (미들웨어에서 이미 확인됨)
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "인증이 필요합니다.",
        errorCode: "AUTHENTICATION_REQUIRED",
      });
    }

    // 사용자 정보 조회 (비밀번호 제외)
    const user = await User.findByPk(user_id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다.",
        errorCode: "USER_NOT_FOUND",
      });
    }

    // 사용자 프로필 정보 조회
    const profile = await UserProfile.findOne({
      where: { user_id },
    });

    // 응답 데이터 구성
    const responseData: any = {
      success: true,
      user,
    };

    // 프로필이 있으면 추가
    if (profile) {
      responseData.profile = profile;
    }

    res.json(responseData);
  } catch (error) {
    console.error("본인 정보 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "본인 정보 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: 본인 프로필 정보 수정
 *     description: JWT 토큰을 통해 본인의 프로필 정보를 수정합니다.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: 닉네임 (1-50자)
 *                 example: "게임마스터"
 *               level:
 *                 type: integer
 *                 description: 레벨
 *                 example: 5
 *               experience:
 *                 type: integer
 *                 description: 경험치
 *                 example: 1250
 *     responses:
 *       200:
 *         description: 프로필 정보 수정 성공
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
 *                   example: "프로필 정보가 수정되었습니다."
 *                 profile:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 프로필을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 닉네임 중복
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

// 본인 프로필 정보 수정
export const updateMe = async (req: Request, res: Response) => {
  try {
    // JWT 토큰에서 user_id 추출 (미들웨어에서 이미 확인됨)
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "인증이 필요합니다.",
        errorCode: "AUTHENTICATION_REQUIRED",
      });
    }

    const { nickname, level, experience } = req.body;

    // 프로필 존재 확인
    const profile = await UserProfile.findByPk(user_id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "사용자 프로필을 찾을 수 없습니다.",
        errorCode: "USER_PROFILE_NOT_FOUND",
      });
    }

    // 닉네임 중복 확인 (자신 제외)
    if (nickname && nickname !== profile.nickname) {
      const existingNickname = await UserProfile.findOne({
        where: { nickname },
      });
      if (existingNickname) {
        return res.status(409).json({
          success: false,
          message: "이미 사용 중인 닉네임입니다.",
          errorCode: "NICKNAME_ALREADY_EXISTS",
        });
      }
    }

    // 프로필 수정
    await profile.update({
      nickname: nickname || profile.nickname,
      level: level !== undefined ? level : profile.level,
      experience: experience !== undefined ? experience : profile.experience,
    });

    res.json({
      success: true,
      message: "프로필 정보가 수정되었습니다.",
      profile,
    });
  } catch (error) {
    console.error("본인 프로필 수정 오류:", error);
    res.status(500).json({
      success: false,
      message: "프로필 정보 수정 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};

/**
 * @swagger
 * /api/users/me:
 *   delete:
 *     summary: 본인 계정 및 모든 데이터 삭제
 *     description: JWT 토큰을 통해 본인의 계정과 관련된 모든 데이터를 삭제합니다.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 계정 삭제 성공
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
 *                   example: "계정과 모든 관련 데이터가 삭제되었습니다."
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 사용자를 찾을 수 없음
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

// 본인 계정 및 모든 데이터 삭제
export const deleteMe = async (req: Request, res: Response) => {
  try {
    // JWT 토큰에서 user_id 추출 (미들웨어에서 이미 확인됨)
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "인증이 필요합니다.",
        errorCode: "AUTHENTICATION_REQUIRED",
      });
    }

    // 사용자 존재 확인
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다.",
        errorCode: "USER_NOT_FOUND",
      });
    }

    // 트랜잭션으로 모든 관련 데이터 삭제
    const sequelize = User.sequelize;
    if (!sequelize) {
      throw new Error("Database connection not available");
    }

    await sequelize.transaction(async (t) => {
      // 1. user_profiles 테이블에서 데이터 삭제
      await UserProfile.destroy({
        where: { user_id },
        transaction: t,
      });

      // 2. user_configs 테이블에서 데이터 삭제
      const UserConfig = (await import("../models/UserConfig")).default;
      await UserConfig.destroy({
        where: { user_id },
        transaction: t,
      });

      // 3. admins 테이블에서 데이터 삭제 (관리자인 경우)
      const Admin = (await import("../models/Admin")).default;
      await Admin.destroy({
        where: { user_id },
        transaction: t,
      });

      // 4. users 테이블에서 사용자 삭제 (마지막에 삭제)
      await user.destroy({ transaction: t });
    });

    res.json({
      success: true,
      message: "계정과 모든 관련 데이터가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("본인 계정 삭제 오류:", error);
    res.status(500).json({
      success: false,
      message: "계정 삭제 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};

/**
 * @swagger
 * /api/users/me/themes:
 *   get:
 *     summary: 본인 테마 정보 조회
 *     description: 사용 가능한 테마 목록과 현재 활성화된 테마를 조회합니다.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *                 availableThemes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Theme'
 *                 activeTheme:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/Theme'
 *                     - type: "null"
 *       401:
 *         description: 인증 필요
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

// 본인 테마 정보 조회
export const getMyThemes = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "인증이 필요합니다.",
        errorCode: "AUTHENTICATION_REQUIRED",
      });
    }

    // 1. is_default이 true인 테마들을 availableThemes로 조회
    const Theme = (await import("../models/Theme")).default;
    const availableThemes = await Theme.findAll({
      where: { is_default: true },
      order: [["theme_id", "ASC"]],
    });

    // 2. user_configs 테이블에서 active_theme 값 조회
    const UserConfig = (await import("../models/UserConfig")).default;
    const userConfig = await UserConfig.findOne({
      where: { user_id },
    });

    let activeTheme = null;
    if (userConfig && userConfig.active_theme) {
      // active_theme 값이 있으면 해당 테마 조회
      activeTheme = await Theme.findByPk(userConfig.active_theme);
    }

    res.json({
      success: true,
      availableThemes,
      activeTheme,
    });
  } catch (error) {
    console.error("본인 테마 정보 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "테마 정보 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};

/**
 * @swagger
 * /api/users/me/themes:
 *   put:
 *     summary: 본인 테마 변경
 *     description: 사용자의 활성 테마를 변경합니다.
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
 *               - theme_id
 *             properties:
 *               theme_id:
 *                 type: integer
 *                 description: 변경할 테마의 ID
 *                 example: 1
 *     responses:
 *       200:
 *         description: 테마 변경 성공
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
 *                   example: "테마가 성공적으로 변경되었습니다."
 *                 userConfig:
 *                   $ref: '#/components/schemas/UserConfig'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 테마를 찾을 수 없음
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

// 본인 테마 변경
export const updateMyTheme = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "인증이 필요합니다.",
        errorCode: "AUTHENTICATION_REQUIRED",
      });
    }

    const { theme_id } = req.body;
    if (!theme_id || typeof theme_id !== "number") {
      return res.status(400).json({
        success: false,
        message: "유효한 theme_id가 필요합니다.",
        errorCode: "INVALID_THEME_ID",
      });
    }

    // 1. 테마 존재 확인
    const Theme = (await import("../models/Theme")).default;
    const theme = await Theme.findByPk(theme_id);
    if (!theme) {
      return res.status(404).json({
        success: false,
        message: "해당 테마를 찾을 수 없습니다.",
        errorCode: "THEME_NOT_FOUND",
      });
    }

    // 2. user_configs 테이블에 값 쓰기 또는 업데이트
    const UserConfig = (await import("../models/UserConfig")).default;
    let userConfig = await UserConfig.findOne({
      where: { user_id },
    });

    if (userConfig) {
      // 기존 설정이 있으면 업데이트
      await userConfig.update({ active_theme: theme_id });
    } else {
      // 기존 설정이 없으면 새로 생성
      userConfig = await UserConfig.create({
        user_id,
        active_theme: theme_id,
      });
    }

    res.json({
      success: true,
      message: "테마가 성공적으로 변경되었습니다.",
      userConfig,
    });
  } catch (error) {
    console.error("본인 테마 변경 오류:", error);
    res.status(500).json({
      success: false,
      message: "테마 변경 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};
