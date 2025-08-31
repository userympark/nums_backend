import Game from "../models/Game";
import { parseGameData } from "../utils/gameParser";

export async function uploadGameDataService(data: string) {
  if (!data || typeof data !== "string") {
    const err: any = new Error("데이터가 필요합니다. 문자열 형태로 전달해주세요.");
    err.statusCode = 400;
    err.errorCode = "INVALID_REQUEST_BODY";
    throw err;
  }

  const parsedData = parseGameData(data);
  if (!Array.isArray(parsedData) || parsedData.length === 0) {
    const err: any = new Error("파싱할 수 있는 데이터가 없습니다.");
    err.statusCode = 400;
    err.errorCode = "PARSED_DATA_EMPTY";
    throw err;
  }

  const results: Array<{ round: number; status: string; message: string }> = [];
  const errors: Array<{ round: number; error: string }> = [];

  for (const gameData of parsedData) {
    try {
      const existingGame = await Game.findOne({ where: { round: gameData.round } });
      if (existingGame) {
        await existingGame.update(gameData);
        results.push({
          round: gameData.round,
          status: "updated",
          message: "기존 데이터가 업데이트되었습니다.",
        });
      } else {
        await Game.create(gameData);
        results.push({
          round: gameData.round,
          status: "created",
          message: "새 데이터가 생성되었습니다.",
        });
      }
    } catch (e) {
      errors.push({
        round: gameData.round,
        error: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }

  return {
    total: parsedData.length,
    successCount: results.length,
    errorCount: errors.length,
    results,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export async function listGamesService(params: {
  page?: number | string;
  limit?: number | string;
  round?: number | string | undefined;
  all?: string | undefined;
}) {
  const { page = 1, limit = 10, round, all } = params;

  let whereClause: any = {};
  if (round !== undefined) {
    whereClause = { round: Number(round) };
  }

  if (all === "true" || all === "1") {
    const rows = await Game.findAll({ where: whereClause, order: [["round", "DESC"]] });
    return {
      mode: "all",
      games: rows,
      totalItems: rows.length,
    } as const;
  }

  const offset = (Number(page) - 1) * Number(limit);
  const { count, rows } = await Game.findAndCountAll({
    where: whereClause,
    order: [["round", "DESC"]],
    limit: Number(limit),
    offset,
  });

  return {
    mode: "paged",
    games: rows,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(count / Number(limit)),
      totalItems: count,
      itemsPerPage: Number(limit),
    },
  } as const;
}

export async function getGameByRoundService(round: number | string) {
  const game = await Game.findOne({ where: { round: Number(round) } });
  if (!game) {
    const err: any = new Error("해당 회차의 로또 데이터를 찾을 수 없습니다.");
    err.statusCode = 404;
    err.errorCode = "GAME_NOT_FOUND";
    throw err;
  }
  return game;
}

export async function getRecentGameService() {
  const game = await Game.findOne({ order: [["round", "DESC"]] });
  if (!game) {
    const err: any = new Error("로또 데이터가 존재하지 않습니다.");
    err.statusCode = 404;
    err.errorCode = "GAME_NOT_FOUND";
    throw err;
  }
  return game;
}
