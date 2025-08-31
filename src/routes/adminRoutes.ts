import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import {
  getAdminUserById,
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  getAdminThemes,
  createAdminTheme,
  getAdminThemeById,
  updateAdminTheme,
  deleteAdminTheme,
  getRecentGameStatus,
} from "../controllers/adminController";

const router = Router();

// 모든 관리자 API에 인증 및 관리자 권한 확인 미들웨어 적용
router.use(requireAuth);
router.use(requireAdmin);

// 사용자 관리 API
router.get("/users", getAdminUsers); // 전체 사용자 목록 조회
router.get("/users/:user_id", getAdminUserById); // 특정 사용자 정보 조회
router.put("/users/:user_id", updateAdminUser); // 사용자 정보 수정
router.delete("/users/:user_id", deleteAdminUser); // 사용자 계정 삭제

// 테마 관리 API
router.get("/themes", getAdminThemes); // 전체 테마 목록 조회
router.post("/themes", createAdminTheme); // 새 테마 생성
router.get("/themes/:theme_id", getAdminThemeById); // 특정 테마 조회
router.put("/themes/:theme_id", updateAdminTheme); // 테마 정보 수정
router.delete("/themes/:theme_id", deleteAdminTheme); // 테마 삭제

// 게임 최신 반영 상태
router.get("/games/recent-status", getRecentGameStatus);

export default router;
