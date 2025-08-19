import { Router } from "express";
import {
  uploadLottoData,
  getLottoData,
  getLottoByRound,
} from "../controllers/lottoController";

const router = Router();

// 로또 데이터 업로드
router.post("/upload", uploadLottoData);

// 로또 데이터 조회 (페이지네이션 지원)
router.get("/", getLottoData);

// 특정 회차 로또 데이터 조회
router.get("/:round", getLottoByRound);

export default router;
