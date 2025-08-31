import { Request, Response } from "express";
// Models are accessed via services; no direct model imports needed here
import { getAdminUserByIdService, listAdminUsersService, listAdminThemesService, getAdminThemeByIdService, updateAdminUserService, deleteAdminUserService, createAdminThemeService, updateAdminThemeService, deleteAdminThemeService, getRecentGameStatusService } from "../services/adminService";

/**
 * @swagger
 * /api/admins/users/{user_id}:
 *   get:
 *     summary: 특정 사용자 정보 조회 (관리자용)
 *     description: 관리자 권한으로 특정 사용자의 정보를 조회합니다.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조회할 사용자 고유 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 사용자 정보 조회 성공
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
 *       403:
 *         description: 관리자 권한 없음
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

// 특정 사용자 정보 조회 (관리자용)
export const getAdminUserById = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const user = await getAdminUserByIdService(user_id);
    return res.json({ success: true, user });
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
 * /api/admins/users:
 *   get:
 *     summary: 전체 사용자 목록 조회 (관리자용)
 *     description: 관리자 권한으로 모든 사용자 목록을 조회합니다.
 *     tags: [Admin]
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
 *       403:
 *         description: 관리자 권한 없음
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

// 전체 사용자 목록 조회 (관리자용)
export const getAdminUsers = async (req: Request, res: Response) => {
  try {
    const users = await listAdminUsersService();
    return res.json({ success: true, users });
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
 * /api/admins/users/{user_id}:
 *   put:
 *     summary: 사용자 정보 수정 (관리자용)
 *     description: 관리자 권한으로 특정 사용자의 정보를 수정합니다.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 수정할 사용자 고유 ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: 새로운 사용자명
 *                 example: "newusername"
 *               is_active:
 *                 type: boolean
 *                 description: 계정 활성화 상태
 *                 example: true
 *     responses:
 *       200:
 *         description: 사용자 정보 수정 성공
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
 *                   example: "사용자 정보가 수정되었습니다."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       403:
 *         description: 관리자 권한 없음
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */

// 사용자 정보 수정 (관리자용)
export const updateAdminUser = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const { username, is_active } = req.body;
    const user = await updateAdminUserService(user_id, { username, is_active });
    return res.json({ success: true, message: "사용자 정보가 수정되었습니다.", user });
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
 * /api/admins/users/{user_id}:
 *   delete:
 *     summary: 사용자 계정 삭제 (관리자용)
 *     description: 관리자 권한으로 특정 사용자 계정을 삭제합니다.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 삭제할 사용자 고유 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 사용자 계정 삭제 성공
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
 *                   example: "사용자 계정이 삭제되었습니다."
 *       403:
 *         description: 관리자 권한 없음
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */

// 사용자 계정 삭제 (관리자용)
export const deleteAdminUser = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    await deleteAdminUserService(user_id);
    return res.json({ success: true, message: "사용자 계정이 삭제되었습니다." });
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
 * /api/admins/themes:
 *   get:
 *     summary: 전체 테마 목록 조회 (관리자용)
 *     description: 관리자 권한으로 모든 테마 목록을 조회합니다.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 테마 목록 조회 성공
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
 *       403:
 *         description: 관리자 권한 없음
 *       500:
 *         description: 서버 오류
 */

// 전체 테마 목록 조회 (관리자용)
export const getAdminThemes = async (req: Request, res: Response) => {
  try {
    const themes = await listAdminThemesService();
    return res.json({ success: true, themes });
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
 * /api/admins/themes:
 *   post:
 *     summary: 새 테마 생성 (관리자용)
 *     description: 관리자 권한으로 새로운 테마를 생성합니다.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - mode
 *               - colors
 *             properties:
 *               name:
 *                 type: string
 *                 description: 테마 이름
 *                 example: "light"
 *               mode:
 *                 type: string
 *                 enum: ["light", "dark"]
 *                 description: 테마 모드
 *                 example: "light"
 *               colors:
 *                 type: object
 *                 description: Vuetify 컬러셋
 *                 example: {"primary": "#1976D2", "secondary": "#424242"}
 *               variables:
 *                 type: object
 *                 nullable: true
 *                 description: 테마별 추가 변수 (JSON)
 *                 example: {"border-radius": "8px", "font-size": "14px"}
 *               is_default:
 *                 type: boolean
 *                 description: 기본 테마 여부
 *                 example: false
 *     responses:
 *       201:
 *         description: 테마 생성 성공
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
 *                   example: "테마가 생성되었습니다."
 *                 theme:
 *                   $ref: '#/components/schemas/Theme'
 *       400:
 *         description: 잘못된 요청 데이터
 *       403:
 *         description: 관리자 권한 없음
 *       500:
 *         description: 서버 오류
 */

// 새 테마 생성 (관리자용)
export const createAdminTheme = async (req: Request, res: Response) => {
  try {
    const { name, mode, colors, variables, is_default = false } = req.body;
    const theme = await createAdminThemeService({ name, mode, colors, variables, is_default });
    return res.status(201).json({ success: true, message: "테마가 생성되었습니다.", theme });
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
 * /api/admins/themes/{theme_id}:
 *   get:
 *     summary: 특정 테마 조회 (관리자용)
 *     description: 관리자 권한으로 특정 테마 정보를 조회합니다.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: theme_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조회할 테마 고유 ID
 *         example: 1
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
 *                 theme:
 *                   $ref: '#/components/schemas/Theme'
 *       403:
 *         description: 관리자 권한 없음
 *       404:
 *         description: 테마를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */

// 특정 테마 조회 (관리자용)
export const getAdminThemeById = async (req: Request, res: Response) => {
  try {
    const { theme_id } = req.params;
    const theme = await getAdminThemeByIdService(theme_id);
    return res.json({ success: true, theme });
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
 * /api/admins/games/recent-status:
 *   get:
 *     summary: 최근 로또 데이터 최신 반영 상태 조회 (관리자)
 *     description: round가 가장 큰 게임의 추첨일 기준 경과일을 계산하여 최신 반영 여부를 반환합니다.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 상태 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     round:
 *                       type: integer
 *                     drawDate:
 *                       type: string
 *                       format: date-time
 *                     daysElapsed:
 *                       type: integer
 *                     thresholdDays:
 *                       type: integer
 *                     isUpToDate:
 *                       type: boolean
 *                     serverNow:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: 데이터 없음
 *       500:
 *         description: 서버 오류
 */
export const getRecentGameStatus = async (_req: Request, res: Response) => {
  try {
    const data = await getRecentGameStatusService();
    return res.json({ success: true, data });
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
 * /api/admins/themes/{theme_id}:
 *   put:
 *     summary: 테마 정보 수정 (관리자용)
 *     description: 관리자 권한으로 특정 테마 정보를 수정합니다.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: theme_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 수정할 테마 고유 ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 새로운 테마 이름
 *                 example: "new_light"
 *               mode:
 *                 type: string
 *                 enum: ["light", "dark"]
 *                 description: 새로운 테마 모드
 *                 example: "light"
 *               colors:
 *                 type: object
 *                 description: 새로운 Vuetify 컬러셋
 *               variables:
 *                 type: object
 *                 nullable: true
 *                 description: 테마별 추가 변수 (JSON)
 *                 example: {"border-radius": "8px", "font-size": "14px"}
 *               is_default:
 *                 type: boolean
 *                 description: 기본 테마 여부
 *                 example: false
 *     responses:
 *       200:
 *         description: 테마 정보 수정 성공
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
 *                   example: "테마 정보가 수정되었습니다."
 *                 theme:
 *                   $ref: '#/components/schemas/Theme'
 *       403:
 *         description: 관리자 권한 없음
 *       404:
 *         description: 테마를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */

// 테마 정보 수정 (관리자용)
export const updateAdminTheme = async (req: Request, res: Response) => {
  try {
    const { theme_id } = req.params;
    const { name, mode, colors, variables, is_default } = req.body;
    const theme = await updateAdminThemeService(theme_id, { name, mode, colors, variables, is_default });
    return res.json({ success: true, message: "테마 정보가 수정되었습니다.", theme });
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
 * /api/admins/themes/{theme_id}:
 *   delete:
 *     summary: 테마 삭제 (관리자용)
 *     description: 관리자 권한으로 특정 테마를 삭제합니다.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: theme_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 삭제할 테마 고유 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 테마 삭제 성공
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
 *                   example: "테마가 삭제되었습니다."
 *       403:
 *         description: 관리자 권한 없음
 *       404:
 *         description: 테마를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */

// 테마 삭제 (관리자용)
export const deleteAdminTheme = async (req: Request, res: Response) => {
  try {
    const { theme_id } = req.params;
    await deleteAdminThemeService(theme_id);
    return res.json({ success: true, message: "테마가 삭제되었습니다." });
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
