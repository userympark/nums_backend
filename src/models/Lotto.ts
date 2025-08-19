import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

interface LottoAttributes {
  id?: number;
  round: number; // 회차
  drawDate: Date; // 추첨일
  firstPrizeWinners: number; // 1등당첨자수
  firstPrizeAmount: number; // 1등당첨금액
  secondPrizeWinners: number; // 2등당첨자수
  secondPrizeAmount: number; // 2등당첨금액
  thirdPrizeWinners: number; // 3등당첨자수
  thirdPrizeAmount: number; // 3등당첨금액
  fourthPrizeWinners: number; // 4등당첨자수
  fourthPrizeAmount: number; // 4등당첨금액
  fifthPrizeWinners: number; // 5등당첨자수
  fifthPrizeAmount: number; // 5등당첨금액
  number1: number; // 첫번째 당첨번호
  number2: number; // 두번째 당첨번호
  number3: number; // 세번째 당첨번호
  number4: number; // 네번째 당첨번호
  number5: number; // 다섯번째 당첨번호
  number6: number; // 여섯번째 당첨번호
  bonusNumber: number; // 보너스번호
  createdAt?: Date;
  updatedAt?: Date;
}

class Lotto extends Model<LottoAttributes> implements LottoAttributes {
  public id!: number;
  public round!: number;
  public drawDate!: Date;
  public firstPrizeWinners!: number;
  public firstPrizeAmount!: number;
  public secondPrizeWinners!: number;
  public secondPrizeAmount!: number;
  public thirdPrizeWinners!: number;
  public thirdPrizeAmount!: number;
  public fourthPrizeWinners!: number;
  public fourthPrizeAmount!: number;
  public fifthPrizeWinners!: number;
  public fifthPrizeAmount!: number;
  public number1!: number;
  public number2!: number;
  public number3!: number;
  public number4!: number;
  public number5!: number;
  public number6!: number;
  public bonusNumber!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Lotto.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    round: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    drawDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    firstPrizeWinners: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    firstPrizeAmount: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    secondPrizeWinners: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    secondPrizeAmount: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    thirdPrizeWinners: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    thirdPrizeAmount: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    fourthPrizeWinners: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fourthPrizeAmount: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    fifthPrizeWinners: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fifthPrizeAmount: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    number1: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    number2: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    number3: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    number4: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    number5: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    number6: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bonusNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "lottos",
    timestamps: true,
  }
);

export default Lotto;
