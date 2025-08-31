import { Request, Response } from "express";
// Business logic handled in services; remove direct crypto/model imports
import { registerUserService, listUsersService, getUserByIdService, loginUserService, getMeService, updateMeService, deleteMeService, getMyThemesService, updateMyThemeService } from "../services/userService";
import { updateUserProfileForUser } from "../services/userProfileService";

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
    const { user, profile } = await registerUserService(username, password);
    return res.status(201).json({ success: true, message: "회원가입이 완료되었습니다.", user, profile });
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
    const users = await listUsersService();
    return res.json({ success: true, users });
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
    const user = await getUserByIdService(user_id);
    return res.json({ success: true, user });
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
    const { token, user } = await loginUserService(username, password);
    return res.json({ success: true, message: "로그인이 완료되었습니다.", token, user });
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
 *     description: JWT 토큰을 통해 본인의 프로필 정보와 활성 테마를 조회합니다.
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
 *                 profile:
 *                   $ref: '#/components/schemas/UserProfile'
 *                 activeTheme:
 *                   type: integer
 *                   nullable: true
 *                   description: 활성 테마 ID (없으면 null)
 *                   example: 1
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

    const data = await getMeService(user_id);
    return res.json({ success: true, ...data });
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
    const profile = await updateUserProfileForUser({ user_id, nickname, level, experience });
    return res.json({ success: true, message: "프로필 정보가 수정되었습니다.", profile });
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

    await deleteMeService(user_id);
    return res.json({ success: true, message: "계정과 모든 관련 데이터가 삭제되었습니다." });
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

    const data = await getMyThemesService(user_id);
    return res.json({ success: true, ...data });
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

    const userConfig = await updateMyThemeService(user_id, theme_id);
    return res.json({ success: true, message: "테마가 성공적으로 변경되었습니다.", userConfig });
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
