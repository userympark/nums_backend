import { Router } from "express";
import { getAllThemes } from "../controllers/themeController";
import { requireDB } from "../middleware/dbCheck";

const router = Router();

// 모든 테마 정보 조회 (Public API, DB 연결만 필요)
router.get("/", requireDB, getAllThemes);

export default router;
