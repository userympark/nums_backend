import User from "../models/User";
import Theme from "../models/Theme";
import Game from "../models/Game";

export async function getAdminUserByIdService(user_id: number | string) {
  const user = await User.findByPk(user_id, { attributes: { exclude: ["password"] } });
  if (!user) {
    const err: any = new Error("사용자를 찾을 수 없습니다.");
    err.statusCode = 404;
    err.errorCode = "USER_NOT_FOUND";
    throw err;
  }
  return user;
}

export async function listAdminUsersService() {
  const users = await User.findAll({
    attributes: { exclude: ["password"] },
    order: [["createdAt", "DESC"]],
  });
  return users;
}

export async function listAdminThemesService() {
  const themes = await Theme.findAll({ order: [["theme_id", "ASC"]] });
  return themes;
}

export async function getAdminThemeByIdService(theme_id: number | string) {
  const theme = await Theme.findByPk(theme_id);
  if (!theme) {
    const err: any = new Error("테마를 찾을 수 없습니다.");
    err.statusCode = 404;
    err.errorCode = "THEME_NOT_FOUND";
    throw err;
  }
  return theme;
}

export async function updateAdminUserService(
  user_id: number | string,
  payload: { username?: string; is_active?: boolean }
) {
  const user = await User.findByPk(user_id);
  if (!user) {
    const err: any = new Error("사용자를 찾을 수 없습니다.");
    err.statusCode = 404;
    err.errorCode = "USER_NOT_FOUND";
    throw err;
  }

  if (payload.username && payload.username !== user.username) {
    const dup = await User.findOne({ where: { username: payload.username } });
    if (dup) {
      const err: any = new Error("이미 존재하는 사용자명입니다.");
      err.statusCode = 409;
      err.errorCode = "USERNAME_ALREADY_EXISTS";
      throw err;
    }
  }

  const updateData: any = {};
  if (payload.username !== undefined) updateData.username = payload.username;
  if (payload.is_active !== undefined) updateData.is_active = payload.is_active;

  await user.update(updateData);
  const { password: _pwd, ...userWithoutPassword } = user.toJSON();
  return userWithoutPassword;
}

export async function deleteAdminUserService(user_id: number | string) {
  const user = await User.findByPk(user_id);
  if (!user) {
    const err: any = new Error("사용자를 찾을 수 없습니다.");
    err.statusCode = 404;
    err.errorCode = "USER_NOT_FOUND";
    throw err;
  }
  await user.destroy();
}

export async function createAdminThemeService(params: {
  name: string;
  mode: "light" | "dark";
  colors: any;
  variables?: any;
  is_default?: boolean;
}) {
  const { name, mode, colors, variables, is_default = false } = params;
  if (!name || !mode || !colors) {
    const err: any = new Error("테마명, 모드, 컬러셋은 필수입니다.");
    err.statusCode = 400;
    err.errorCode = "MISSING_REQUIRED_FIELDS";
    throw err;
  }
  if (!["light", "dark"].includes(mode)) {
    const err: any = new Error("테마 모드는 'light' 또는 'dark'여야 합니다.");
    err.statusCode = 400;
    err.errorCode = "INVALID_THEME_MODE";
    throw err;
  }
  const existingTheme = await Theme.findOne({ where: { name } });
  if (existingTheme) {
    const err: any = new Error("이미 존재하는 테마명입니다.");
    err.statusCode = 400;
    err.errorCode = "THEME_NAME_ALREADY_EXISTS";
    throw err;
  }
  const newTheme = await Theme.create({ name, mode, colors, variables, is_default });
  return newTheme;
}

export async function updateAdminThemeService(
  theme_id: number | string,
  payload: { name?: string; mode?: "light" | "dark"; colors?: any; variables?: any; is_default?: boolean }
) {
  const theme = await Theme.findByPk(theme_id);
  if (!theme) {
    const err: any = new Error("테마를 찾을 수 없습니다.");
    err.statusCode = 404;
    err.errorCode = "THEME_NOT_FOUND";
    throw err;
  }
  if (payload.mode && !["light", "dark"].includes(payload.mode)) {
    const err: any = new Error("테마 모드는 'light' 또는 'dark'여야 합니다.");
    err.statusCode = 400;
    err.errorCode = "INVALID_THEME_MODE";
    throw err;
  }
  if (payload.name && payload.name !== theme.name) {
    const existingTheme = await Theme.findOne({ where: { name: payload.name } });
    if (existingTheme) {
      const err: any = new Error("이미 존재하는 테마명입니다.");
      err.statusCode = 400;
      err.errorCode = "THEME_NAME_ALREADY_EXISTS";
      throw err;
    }
  }

  await theme.update({
    name: payload.name ?? theme.name,
    mode: payload.mode ?? theme.mode,
    colors: payload.colors ?? theme.colors,
    variables: payload.variables !== undefined ? payload.variables : theme.variables,
    is_default: payload.is_default !== undefined ? payload.is_default : theme.is_default,
  });
  return theme;
}

export async function deleteAdminThemeService(theme_id: number | string) {
  const theme = await Theme.findByPk(theme_id);
  if (!theme) {
    const err: any = new Error("테마를 찾을 수 없습니다.");
    err.statusCode = 404;
    err.errorCode = "THEME_NOT_FOUND";
    throw err;
  }
  if (theme.is_default) {
    const err: any = new Error("기본 테마는 삭제할 수 없습니다.");
    err.statusCode = 400;
    err.errorCode = "CANNOT_DELETE_DEFAULT_THEME";
    throw err;
  }
  await theme.destroy();
}

export async function getRecentGameStatusService() {
  const game = await Game.findOne({ order: [["round", "DESC"]] });
  if (!game) {
    const err: any = new Error("로또 데이터가 존재하지 않습니다.");
    err.statusCode = 404;
    err.errorCode = "GAME_NOT_FOUND";
    throw err;
  }

  const thresholdDays = Number(process.env.GAME_RECENT_THRESHOLD_DAYS || 7);
  const now = new Date();
  const drawDate = new Date(game.draw_date);
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysElapsed = Math.floor((now.getTime() - drawDate.getTime()) / msPerDay);
  const isUpToDate = daysElapsed <= thresholdDays;

  return {
    round: game.round,
    drawDate: game.draw_date,
    daysElapsed,
    thresholdDays,
    isUpToDate,
    serverNow: now.toISOString(),
    game,
  };
}
