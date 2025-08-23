import express from "express";
import { createUserProfile } from "../controllers/userProfileController";
import { requireDB } from "../middleware/dbCheck";
import { requireAuth } from "../middleware/auth";

const router = express.Router();

// 모든 라우트에 인증 필요
router.use(requireAuth);

// 사용자 프로필 생성 (POST /api/user-profiles)
router.post("/", requireDB, createUserProfile);

export default router;
