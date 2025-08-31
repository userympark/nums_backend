import User from "../models/User";
import UserProfile from "../models/UserProfile";

interface CreateUserProfileParams {
  user_id: number;
  nickname: string;
  level?: number;
  experience?: number;
}

export async function createUserProfileForUser(params: CreateUserProfileParams) {
  const { user_id, nickname, level, experience } = params;

  // 사용자 존재 확인
  const user = await User.findByPk(user_id);
  if (!user) {
    const err: any = new Error("User not found");
    err.statusCode = 404;
    err.errorCode = "USER_NOT_FOUND";
    throw err;
  }

  // 프로필 중복 확인
  const existingProfile = await UserProfile.findByPk(user_id);
  if (existingProfile) {
    const err: any = new Error("User profile already exists");
    err.statusCode = 409;
    err.errorCode = "USER_PROFILE_ALREADY_EXISTS";
    throw err;
  }

  // 닉네임 중복 확인
  const existingNickname = await UserProfile.findOne({ where: { nickname } });
  if (existingNickname) {
    const err: any = new Error("Nickname already exists");
    err.statusCode = 409;
    err.errorCode = "NICKNAME_ALREADY_EXISTS";
    throw err;
  }

  // 생성 (0값 보존 위해 nullish 연산자 사용)
  const profile = await UserProfile.create({
    user_id,
    nickname,
    level: level ?? 0,
    experience: experience ?? 0,
  });

  return profile;
}

interface UpdateUserProfileParams {
  user_id: number;
  nickname?: string;
  level?: number;
  experience?: number;
}

export async function updateUserProfileForUser(params: UpdateUserProfileParams) {
  const { user_id, nickname, level, experience } = params;

  const profile = await UserProfile.findByPk(user_id);
  if (!profile) {
    const err: any = new Error("사용자 프로필을 찾을 수 없습니다.");
    err.statusCode = 404;
    err.errorCode = "USER_PROFILE_NOT_FOUND";
    throw err;
  }

  if (nickname && nickname !== profile.nickname) {
    const existingNickname = await UserProfile.findOne({ where: { nickname } });
    if (existingNickname) {
      const err: any = new Error("이미 사용 중인 닉네임입니다.");
      err.statusCode = 409;
      err.errorCode = "NICKNAME_ALREADY_EXISTS";
      throw err;
    }
  }

  await profile.update({
    nickname: nickname ?? profile.nickname,
    level: level ?? profile.level,
    experience: experience ?? profile.experience,
  });

  return profile;
}
