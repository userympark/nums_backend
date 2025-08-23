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

// 사용자 설정 조회 (GET /api/user-configs/:user_id)
router.get("/:user_id", requireDB, getUserConfig);

// 사용자 설정 생성 (POST /api/user-configs)
router.post("/", requireDB, createUserConfig);

// 사용자 설정 수정 (PUT /api/user-configs/:user_id)
router.put("/:user_id", requireDB, updateUserConfig);

// 사용자 설정 삭제 (DELETE /api/user-configs/:user_id)
router.delete("/:user_id", requireDB, deleteUserConfig);

export default router;
