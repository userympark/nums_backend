import sequelize from "../config/database";
import Game from "./Game";
import User from "./User";
import Theme from "./Theme";
import UserProfile from "./UserProfile";
import UserConfig from "./UserConfig";
import Admin from "./Admin";

// 모델들을 객체로 내보내기
const models = {
  Game,
  User,
  Theme,
  UserProfile,
  UserConfig,
  Admin,
};

// 모델 간의 관계 설정 (필요시)
// 예: User.hasMany(Game, { foreignKey: 'userId' });

// 데이터베이스 동기화
export const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ Database synchronized");
  } catch (error) {
    console.error("❌ Database sync failed:", error);
    throw error;
  }
};

export { sequelize };
export default models;
