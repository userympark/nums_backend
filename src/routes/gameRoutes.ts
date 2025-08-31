import { Router } from "express";
import {
  uploadGameData,
  getGameData,
  getGameByRound,
  getRecentGame,
} from "../controllers/gameController";

const router = Router();

// 로또 데이터 업로드
router.post("/upload", uploadGameData);

// 로또 데이터 조회 (페이지네이션 지원)
router.get("/", getGameData);

// 가장 최근(최대 회차) 로또 데이터 조회
router.get("/recent", getRecentGame);

// 특정 회차 로또 데이터 조회
router.get("/:round", getGameByRound);

export default router;
