import express from "express";
import {
  register,
  login,
  getUsers,
  getUserById,
} from "../controllers/userController";
import { requireDB } from "../middleware/dbCheck";

const router = express.Router();

// 회원가입 (POST /api/users/register)
router.post("/register", requireDB, register);

// 로그인 (POST /api/users/login)
router.post("/login", requireDB, login);

// 사용자 목록 조회 (GET /api/users) - 관리자용
router.get("/", requireDB, getUsers);

// 특정 사용자 조회 (GET /api/users/:uid)
router.get("/:uid", requireDB, getUserById);

export default router;
