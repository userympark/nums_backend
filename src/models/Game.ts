import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

interface GameAttributes {
  game_id?: number;
  round: number; // 회차
  draw_date: Date; // 추첨일
  first_prize_winners: number; // 1등당첨자수
  first_prize_amount: number; // 1등당첨금액
  second_prize_winners: number; // 2등당첨자수
  second_prize_amount: number; // 2등당첨금액
  third_prize_winners: number; // 3등당첨자수
  third_prize_amount: number; // 3등당첨금액
  fourth_prize_winners: number; // 4등당첨자수
  fourth_prize_amount: number; // 4등당첨금액
  fifth_prize_winners: number; // 5등당첨자수
  fifth_prize_amount: number; // 5등당첨금액
  number1: number; // 첫번째 당첨번호
  number2: number; // 두번째 당첨번호
  number3: number; // 세번째 당첨번호
  number4: number; // 네번째 당첨번호
  number5: number; // 다섯번째 당첨번호
  number6: number; // 여섯번째 당첨번호
  bonus_number: number; // 보너스번호
  createdAt?: Date;
  updatedAt?: Date;
}

class Game extends Model<GameAttributes> implements GameAttributes {
  public game_id!: number;
  public round!: number;
  public draw_date!: Date;
  public first_prize_winners!: number;
  public first_prize_amount!: number;
  public second_prize_winners!: number;
  public second_prize_amount!: number;
  public third_prize_winners!: number;
  public third_prize_amount!: number;
  public fourth_prize_winners!: number;
  public fourth_prize_amount!: number;
  public fifth_prize_winners!: number;
  public fifth_prize_amount!: number;
  public number1!: number;
  public number2!: number;
  public number3!: number;
  public number4!: number;
  public number5!: number;
  public number6!: number;
  public bonus_number!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Game.init(
  {
    game_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    round: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    draw_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    first_prize_winners: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    first_prize_amount: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    second_prize_winners: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    second_prize_amount: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    third_prize_winners: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    third_prize_amount: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    fourth_prize_winners: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fourth_prize_amount: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    fifth_prize_winners: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fifth_prize_amount: {
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
    bonus_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "games",
    timestamps: true,
  }
);

export default Game;
