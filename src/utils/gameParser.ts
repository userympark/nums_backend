interface ParsedGameData {
  round: number;
  draw_date: Date;
  first_prize_winners: number;
  first_prize_amount: number;
  second_prize_winners: number;
  second_prize_amount: number;
  third_prize_winners: number;
  third_prize_amount: number;
  fourth_prize_winners: number;
  fourth_prize_amount: number;
  fifth_prize_winners: number;
  fifth_prize_amount: number;
  number1: number;
  number2: number;
  number3: number;
  number4: number;
  number5: number;
  number6: number;
  bonus_number: number;
}

/**
 * 금액 문자열에서 숫자만 추출 (원, 쉼표 제거)
 */
const parseAmount = (amountStr: string): number => {
  return parseInt(amountStr.replace(/[원,]/g, ""), 10);
};

/**
 * 숫자 문자열에서 쉼표 제거
 */
const parseNumber = (numStr: string): number => {
  return parseInt(numStr.replace(/,/g, ""), 10);
};

/**
 * 날짜 문자열을 Date 객체로 변환 (YYYY.MM.DD 형식)
 */
const parseDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split(".").map((num) => parseInt(num, 10));
  return new Date(year, month - 1, day); // month는 0-based
};

/**
 * 로또 데이터 행을 파싱
 */
export const parseGameRow = (row: string): ParsedGameData => {
  const columns = row.split("\t");

  if (columns.length !== 19) {
    throw new Error(
      `Invalid data format. Expected 19 columns, got ${columns.length}`
    );
  }

  return {
    round: parseInt(columns[0], 10),
    draw_date: parseDate(columns[1]),
    first_prize_winners: parseNumber(columns[2]),
    first_prize_amount: parseAmount(columns[3]),
    second_prize_winners: parseNumber(columns[4]),
    second_prize_amount: parseAmount(columns[5]),
    third_prize_winners: parseNumber(columns[6]),
    third_prize_amount: parseAmount(columns[7]),
    fourth_prize_winners: parseNumber(columns[8]),
    fourth_prize_amount: parseAmount(columns[9]),
    fifth_prize_winners: parseNumber(columns[10]),
    fifth_prize_amount: parseAmount(columns[11]),
    number1: parseInt(columns[12], 10),
    number2: parseInt(columns[13], 10),
    number3: parseInt(columns[14], 10),
    number4: parseInt(columns[15], 10),
    number5: parseInt(columns[16], 10),
    number6: parseInt(columns[17], 10),
    bonus_number: parseInt(columns[18], 10),
  };
};

/**
 * 여러 행의 로또 데이터를 파싱
 */
export const parseGameData = (data: string): ParsedGameData[] => {
  const rows = data.trim().split("\n");
  return rows.map((row, index) => {
    try {
      return parseGameRow(row);
    } catch (error) {
      throw new Error(`Error parsing row ${index + 1}: ${error}`);
    }
  });
};
