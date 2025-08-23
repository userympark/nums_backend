import express from "express";
import {
  register,
  login,
  getUsers,
  getUserById,
  getMe,
  updateMe,
  deleteMe,
  getMyThemes,
  updateMyTheme,
} from "../controllers/userController";
import { requireDB } from "../middleware/dbCheck";
import { requireAuth } from "../middleware/auth";

const router = express.Router();

// 회원가입 (POST /api/users/register)
router.post("/register", requireDB, register);

// 로그인 (POST /api/users/login)
router.post("/login", requireDB, login);

// 사용자 목록 조회 (GET /api/users) - 관리자용 (인증 필요)
router.get("/", requireDB, requireAuth, getUsers);

// 본인 정보 조회 (GET /api/users/me) - 인증 필요
router.get("/me", requireDB, requireAuth, getMe);

// 본인 프로필 정보 수정 (PUT /api/users/me) - 인증 필요
router.put("/me", requireDB, requireAuth, updateMe);

// 본인 계정 및 모든 데이터 삭제 (DELETE /api/users/me) - 인증 필요
router.delete("/me", requireDB, requireAuth, deleteMe);

// 본인 테마 정보 조회 (GET /api/users/me/themes) - 인증 필요
router.get("/me/themes", requireDB, requireAuth, getMyThemes);

// 본인 테마 변경 (PUT /api/users/me/themes) - 인증 필요
router.put("/me/themes", requireDB, requireAuth, updateMyTheme);

// 특정 사용자 조회 (GET /api/users/:user_id) - 인증 필요
router.get("/:user_id", requireDB, requireAuth, getUserById);

export default router;
