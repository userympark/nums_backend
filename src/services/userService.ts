import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import type { StringValue as MsStringValue } from "ms";
import User from "../models/User";
import UserProfile from "../models/UserProfile";
import UserConfig from "../models/UserConfig";
import Theme from "../models/Theme";
import Admin from "../models/Admin";

export async function registerUserService(username: string, password: string) {
  if (!username || !password) {
    const err: any = new Error("사용자명과 비밀번호를 모두 입력해주세요.");
    err.statusCode = 400;
    err.errorCode = "MISSING_REQUIRED_FIELDS";
    throw err;
  }

  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    const err: any = new Error("이미 존재하는 사용자명입니다.");
    err.statusCode = 409;
    err.errorCode = "USERNAME_ALREADY_EXISTS";
    throw err;
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const sequelize = User.sequelize;
  if (!sequelize) throw new Error("Database connection not available");

  const result = await sequelize.transaction(async (t) => {
    const newUser = await User.create(
      { username, password: hashedPassword },
      { transaction: t }
    );

    const newProfile = await UserProfile.create(
      {
        user_id: newUser.user_id,
        nickname: username,
        level: 0,
        experience: 0,
      },
      { transaction: t }
    );

    // 선택: 초기 UserConfig는 생성하지 않음 (기존 동작 유지)

    const { password: _pwd, ...userWithoutPassword } = newUser.toJSON();
    return { user: userWithoutPassword, profile: newProfile };
  });

  return result;
}

export async function loginUserService(username: string, password: string) {
  if (!username || !password) {
    const err: any = new Error("사용자명과 비밀번호를 모두 입력해주세요.");
    err.statusCode = 400;
    err.errorCode = "MISSING_REQUIRED_FIELDS";
    throw err;
  }

  const user = await User.findOne({ where: { username } });
  if (!user) {
    const err: any = new Error("사용자명 또는 비밀번호가 올바르지 않습니다.");
    err.statusCode = 401;
    err.errorCode = "INVALID_CREDENTIALS";
    throw err;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const err: any = new Error("사용자명 또는 비밀번호가 올바르지 않습니다.");
    err.statusCode = 401;
    err.errorCode = "INVALID_CREDENTIALS";
    throw err;
  }

  const jwtSecret = process.env.JWT_SECRET || "fallback_secret_key";
  // Narrow expiresIn to jsonwebtoken's expected template literal type from `ms` or a number
  const envExpires = process.env.JWT_EXPIRES_IN;
  const expiresIn: MsStringValue | number =
    (envExpires as unknown as MsStringValue | undefined) ?? ("24h" as MsStringValue);
  const token = jwt.sign(
    { user_id: user.user_id, username: user.username },
    jwtSecret,
    { expiresIn }
  );

  const { password: _pwd, ...userWithoutPassword } = user.toJSON();
  return { token, user: userWithoutPassword };
}

export async function listUsersService() {
  const users = await User.findAll({
    attributes: { exclude: ["password"] },
    order: [["createdAt", "DESC"]],
  });
  return users;
}

export async function getUserByIdService(user_id: number | string) {
  const user = await User.findByPk(user_id, { attributes: { exclude: ["password"] } });
  if (!user) {
    const err: any = new Error("사용자를 찾을 수 없습니다.");
    err.statusCode = 404;
    err.errorCode = "USER_NOT_FOUND";
    throw err;
  }
  return user;
}

export async function getMeService(user_id: number | string) {
  const profile = await UserProfile.findOne({ where: { user_id } });
  if (!profile) {
    const err: any = new Error("사용자 프로필을 찾을 수 없습니다.");
    err.statusCode = 404;
    err.errorCode = "USER_PROFILE_NOT_FOUND";
    throw err;
  }
  const userConfig = await UserConfig.findOne({ where: { user_id }, attributes: ["active_theme"] });
  return { profile, activeTheme: userConfig?.active_theme || null };
}

export async function updateMeService(
  user_id: number | string,
  payload: { username?: string; password?: string }
) {
  const user = await User.findByPk(user_id);
  if (!user) {
    const err: any = new Error("사용자를 찾을 수 없습니다.");
    err.statusCode = 404;
    err.errorCode = "USER_NOT_FOUND";
    throw err;
  }

  const updates: any = {};
  if (payload.username && payload.username !== user.username) {
    const dup = await User.findOne({ where: { username: payload.username } });
    if (dup) {
      const err: any = new Error("이미 존재하는 사용자명입니다.");
      err.statusCode = 409;
      err.errorCode = "USERNAME_ALREADY_EXISTS";
      throw err;
    }
    updates.username = payload.username;
  }
  if (payload.password) {
    if (payload.password.length < 6) {
      const err: any = new Error("비밀번호는 최소 6자 이상이어야 합니다.");
      err.statusCode = 400;
      err.errorCode = "PASSWORD_POLICY_VIOLATION";
      throw err;
    }
    updates.password = await bcrypt.hash(payload.password, 10);
  }

  await user.update(updates);
  const { password: _pwd, ...userWithoutPassword } = user.toJSON();
  return userWithoutPassword;
}

export async function deleteMeService(user_id: number | string) {
  const user = await User.findByPk(user_id);
  if (!user) {
    const err: any = new Error("사용자를 찾을 수 없습니다.");
    err.statusCode = 404;
    err.errorCode = "USER_NOT_FOUND";
    throw err;
  }

  const sequelize = User.sequelize;
  if (!sequelize) throw new Error("Database connection not available");
  await sequelize.transaction(async (t) => {
    await UserProfile.destroy({ where: { user_id }, transaction: t });
    await UserConfig.destroy({ where: { user_id }, transaction: t });
    await Admin.destroy({ where: { user_id }, transaction: t });
    await user.destroy({ transaction: t } as any);
  });
}

export async function getMyThemesService(user_id: number | string) {
  const availableThemes = await Theme.findAll({ where: { is_default: true }, order: [["theme_id", "ASC"]] });
  const userConfig = await UserConfig.findOne({ where: { user_id } });
  const activeTheme = userConfig?.active_theme ? await Theme.findByPk(userConfig.active_theme) : null;
  return { availableThemes, activeTheme };
}

export async function updateMyThemeService(user_id: number | string, theme_id: number) {
  const theme = await Theme.findByPk(theme_id);
  if (!theme) {
    const err: any = new Error("해당 테마를 찾을 수 없습니다.");
    err.statusCode = 404;
    err.errorCode = "THEME_NOT_FOUND";
    throw err;
  }
  let userConfig = await UserConfig.findOne({ where: { user_id } });
  if (userConfig) {
    await userConfig.update({ active_theme: theme_id });
  } else {
    userConfig = await UserConfig.create({ user_id: Number(user_id), active_theme: theme_id });
  }
  return userConfig;
}
