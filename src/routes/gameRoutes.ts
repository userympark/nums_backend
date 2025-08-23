import { Router } from "express";
import {
  uploadGameData,
  getGameData,
  getGameByRound,
} from "../controllers/gameController";

const router = Router();

// 로또 데이터 업로드
router.post("/upload", uploadGameData);

// 로또 데이터 조회 (페이지네이션 지원)
router.get("/", getGameData);

// 특정 회차 로또 데이터 조회
router.get("/:round", getGameByRound);

export default router;
