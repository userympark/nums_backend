import { Request, Response } from "express";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import User from "../models/User";

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: 회원가입
 *     description: 새로운 사용자를 등록합니다.
 *     tags: [Users]
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
      });
    }

    // 사용자명 중복 확인
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "이미 존재하는 사용자명입니다.",
      });
    }

    // 비밀번호 해시화
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 새 사용자 생성
    const newUser = await User.create({
      username,
      password: hashedPassword,
    });

    // 응답에서 비밀번호 제외
    const { password: _, ...userWithoutPassword } = newUser.toJSON();

    res.status(201).json({
      success: true,
      message: "회원가입이 완료되었습니다.",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("회원가입 오류:", error);
    res.status(500).json({
      success: false,
      message: "회원가입 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 사용자 목록 조회
 *     description: 모든 사용자 목록을 조회합니다 (관리자용).
 *     tags: [Users]
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
    });
  }
};

/**
 * @swagger
 * /api/users/{uid}:
 *   get:
 *     summary: 특정 사용자 조회
 *     description: 사용자 ID를 통해 특정 사용자 정보를 조회합니다.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: uid
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
    const { uid } = req.params;
    const user = await User.findByPk(uid, {
      attributes: { exclude: ["password"] }, // 비밀번호 제외
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다.",
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
    });
  }
};

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: 로그인
 *     description: 사용자 로그인 후 JWT 토큰을 반환합니다.
 *     tags: [Users]
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
      });
    }

    // 사용자 조회
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "사용자명 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "사용자명 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    // JWT 토큰 생성
    const jwtSecret = process.env.JWT_SECRET || "fallback_secret_key";

    const token = jwt.sign(
      {
        uid: user.uid,
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
    });
  }
};
