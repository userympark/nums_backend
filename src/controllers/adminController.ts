import { Request, Response } from "express";
import User from "../models/User";
import Admin from "../models/Admin";
import Theme from "../models/Theme";

/**
 * @swagger
 * /api/admin/users/{user_id}:
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

    // 관리자 권한 확인 (미들웨어에서 이미 확인됨)
    const adminUser = req.user;

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
    console.error("관리자 사용자 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "사용자 정보 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};

/**
 * @swagger
 * /api/admin/users:
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
    // 관리자 권한 확인 (미들웨어에서 이미 확인됨)
    const adminUser = req.user;

    const users = await User.findAll({
      attributes: { exclude: ["password"] }, // 비밀번호 제외
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("관리자 사용자 목록 조회 오류:", error);
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
 * /api/admin/users/{user_id}:
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

    // 관리자 권한 확인 (미들웨어에서 이미 확인됨)
    const adminUser = req.user;

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다.",
        errorCode: "USER_NOT_FOUND",
      });
    }

    // 수정할 데이터 준비
    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (is_active !== undefined) updateData.is_active = is_active;

    // 사용자 정보 수정
    await user.update(updateData);

    // 응답에서 비밀번호 제외
    const { password: _, ...userWithoutPassword } = user.toJSON();

    res.json({
      success: true,
      message: "사용자 정보가 수정되었습니다.",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("관리자 사용자 수정 오류:", error);
    res.status(500).json({
      success: false,
      message: "사용자 정보 수정 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};

/**
 * @swagger
 * /api/admin/users/{user_id}:
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

    // 관리자 권한 확인 (미들웨어에서 이미 확인됨)
    const adminUser = req.user;

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다.",
        errorCode: "USER_NOT_FOUND",
      });
    }

    // 사용자 계정 삭제
    await user.destroy();

    res.json({
      success: true,
      message: "사용자 계정이 삭제되었습니다.",
    });
  } catch (error) {
    console.error("관리자 사용자 삭제 오류:", error);
    res.status(500).json({
      success: false,
      message: "사용자 계정 삭제 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};

/**
 * @swagger
 * /api/admin/themes:
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
    const themes = await Theme.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      themes,
    });
  } catch (error) {
    console.error("관리자 테마 목록 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "테마 목록 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};

/**
 * @swagger
 * /api/admin/themes:
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
    const { name, mode, colors, is_default = false } = req.body;

    // 입력값 검증
    if (!name || !mode || !colors) {
      return res.status(400).json({
        success: false,
        message: "테마명, 모드, 컬러셋은 필수입니다.",
        errorCode: "MISSING_REQUIRED_FIELDS",
      });
    }

    // 모드 검증
    if (!["light", "dark"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "테마 모드는 'light' 또는 'dark'여야 합니다.",
        errorCode: "INVALID_THEME_MODE",
      });
    }

    // 테마명 중복 확인
    const existingTheme = await Theme.findOne({ where: { name } });
    if (existingTheme) {
      return res.status(400).json({
        success: false,
        message: "이미 존재하는 테마명입니다.",
        errorCode: "THEME_NAME_ALREADY_EXISTS",
      });
    }

    // 새 테마 생성
    const newTheme = await Theme.create({
      name,
      mode,
      colors,
      is_default,
    });

    res.status(201).json({
      success: true,
      message: "테마가 생성되었습니다.",
      theme: newTheme,
    });
  } catch (error) {
    console.error("관리자 테마 생성 오류:", error);
    res.status(500).json({
      success: false,
      message: "테마 생성 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};

/**
 * @swagger
 * /api/admin/themes/{theme_id}:
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

    const theme = await Theme.findByPk(theme_id);

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: "테마를 찾을 수 없습니다.",
        errorCode: "THEME_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      theme,
    });
  } catch (error) {
    console.error("관리자 테마 조회 오류:", error);
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
 * /api/admin/themes/{theme_id}:
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
    const { name, mode, colors, is_default } = req.body;

    const theme = await Theme.findByPk(theme_id);
    if (!theme) {
      return res.status(404).json({
        success: false,
        message: "테마를 찾을 수 없습니다.",
        errorCode: "THEME_NOT_FOUND",
      });
    }

    // 모드 검증
    if (mode && !["light", "dark"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "테마 모드는 'light' 또는 'dark'여야 합니다.",
        errorCode: "INVALID_THEME_MODE",
      });
    }

    // 테마명 중복 확인 (자신 제외)
    if (name && name !== theme.name) {
      const existingTheme = await Theme.findOne({ where: { name } });
      if (existingTheme) {
        return res.status(400).json({
          success: false,
          message: "이미 존재하는 테마명입니다.",
          errorCode: "THEME_NAME_ALREADY_EXISTS",
        });
      }
    }

    // 테마 정보 수정
    await theme.update({
      name: name || theme.name,
      mode: mode || theme.mode,
      colors: colors || theme.colors,
      is_default: is_default !== undefined ? is_default : theme.is_default,
    });

    res.json({
      success: true,
      message: "테마 정보가 수정되었습니다.",
      theme,
    });
  } catch (error) {
    console.error("관리자 테마 수정 오류:", error);
    res.status(500).json({
      success: false,
      message: "테마 정보 수정 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};

/**
 * @swagger
 * /api/admin/themes/{theme_id}:
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

    const theme = await Theme.findByPk(theme_id);
    if (!theme) {
      return res.status(404).json({
        success: false,
        message: "테마를 찾을 수 없습니다.",
        errorCode: "THEME_NOT_FOUND",
      });
    }

    // 기본 테마는 삭제 불가
    if (theme.is_default) {
      return res.status(400).json({
        success: false,
        message: "기본 테마는 삭제할 수 없습니다.",
        errorCode: "CANNOT_DELETE_DEFAULT_THEME",
      });
    }

    // 테마 삭제
    await theme.destroy();

    res.json({
      success: true,
      message: "테마가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("관리자 테마 삭제 오류:", error);
    res.status(500).json({
      success: false,
      message: "테마 삭제 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};
