import { sequelize } from "../config/database";
import Lotto from "./Lotto";
import User from "./User";

// 모델들을 객체로 내보내기
const models = {
  Lotto,
  User,
};

// 모델 간의 관계 설정 (필요시)
// 예: User.hasMany(Lotto, { foreignKey: 'userId' });

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
