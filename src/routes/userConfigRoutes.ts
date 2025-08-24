import express from "express";
import {
  getUserConfig,
  createUserConfig,
  updateUserConfig,
  deleteUserConfig,
} from "../controllers/userConfigController";
import { requireDB } from "../middleware/dbCheck";
import { requireAuth } from "../middleware/auth";

const router = express.Router();

// 모든 라우트에 인증 필요
router.use(requireAuth);

// 사용자 설정 조회 (GET /api/users/me/configs)
router.get("/", requireDB, requireAuth, getUserConfig);

// 사용자 설정 생성 (POST /api/users/me/configs)
router.post("/", requireDB, requireAuth, createUserConfig);

// 사용자 설정 수정 (PUT /api/users/me/configs)
router.put("/", requireDB, requireAuth, updateUserConfig);

// 사용자 설정 삭제 (DELETE /api/users/me/configs)
router.delete("/", requireDB, requireAuth, deleteUserConfig);

export default router;
