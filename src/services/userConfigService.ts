import UserConfig from "../models/UserConfig";
import User from "../models/User";
import Theme from "../models/Theme";

export async function getUserConfigForUser(user_id: number | string) {
  const config = await UserConfig.findByPk(user_id, {
    include: [
      { model: User, as: "user", attributes: ["user_id", "username"] },
      { model: Theme, as: "theme", attributes: ["theme_id", "name", "mode", "colors"] },
    ],
  });
  if (!config) {
    const err: any = new Error("사용자 설정을 찾을 수 없습니다.");
    err.statusCode = 404;
    err.errorCode = "USER_CONFIG_NOT_FOUND";
    throw err;
  }
  return config;
}

export async function createUserConfigForUser(user_id: number | string, active_theme: number) {
  // 이미 존재하는지 확인
  const existing = await UserConfig.findByPk(user_id);
  if (existing) {
    const err: any = new Error("해당 사용자의 설정이 이미 존재합니다.");
    err.statusCode = 409;
    err.errorCode = "USER_CONFIG_ALREADY_EXISTS";
    throw err;
  }

  // 테마 존재 확인
  const theme = await Theme.findByPk(active_theme);
  if (!theme) {
    const err: any = new Error("해당 테마를 찾을 수 없습니다.");
    err.statusCode = 404;
    err.errorCode = "THEME_NOT_FOUND";
    throw err;
  }

  const config = await UserConfig.create({ user_id: Number(user_id), active_theme });
  return config;
}

export async function updateUserConfigForUser(user_id: number | string, payload: { active_theme?: number }) {
  const config = await UserConfig.findByPk(user_id);
  if (!config) {
    const err: any = new Error("사용자 설정을 찾을 수 없습니다.");
    err.statusCode = 404;
    err.errorCode = "USER_CONFIG_NOT_FOUND";
    throw err;
  }
  if (payload.active_theme !== undefined) {
    const theme = await Theme.findByPk(payload.active_theme);
    if (!theme) {
      const err: any = new Error("해당 테마를 찾을 수 없습니다.");
      err.statusCode = 404;
      err.errorCode = "THEME_NOT_FOUND";
      throw err;
    }
  }
  await config.update({ active_theme: payload.active_theme ?? config.active_theme });
  return config;
}

export async function deleteUserConfigForUser(user_id: number | string) {
  const config = await UserConfig.findByPk(user_id);
  if (!config) {
    const err: any = new Error("사용자 설정을 찾을 수 없습니다.");
    err.statusCode = 404;
    err.errorCode = "USER_CONFIG_NOT_FOUND";
    throw err;
  }
  await config.destroy();
}

