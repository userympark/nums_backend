interface ParsedLottoData {
  round: number;
  drawDate: Date;
  firstPrizeWinners: number;
  firstPrizeAmount: number;
  secondPrizeWinners: number;
  secondPrizeAmount: number;
  thirdPrizeWinners: number;
  thirdPrizeAmount: number;
  fourthPrizeWinners: number;
  fourthPrizeAmount: number;
  fifthPrizeWinners: number;
  fifthPrizeAmount: number;
  number1: number;
  number2: number;
  number3: number;
  number4: number;
  number5: number;
  number6: number;
  bonusNumber: number;
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
export const parseLottoRow = (row: string): ParsedLottoData => {
  const columns = row.split("\t");

  if (columns.length !== 19) {
    throw new Error(
      `Invalid data format. Expected 19 columns, got ${columns.length}`
    );
  }

  return {
    round: parseInt(columns[0], 10),
    drawDate: parseDate(columns[1]),
    firstPrizeWinners: parseNumber(columns[2]),
    firstPrizeAmount: parseAmount(columns[3]),
    secondPrizeWinners: parseNumber(columns[4]),
    secondPrizeAmount: parseAmount(columns[5]),
    thirdPrizeWinners: parseNumber(columns[6]),
    thirdPrizeAmount: parseAmount(columns[7]),
    fourthPrizeWinners: parseNumber(columns[8]),
    fourthPrizeAmount: parseAmount(columns[9]),
    fifthPrizeWinners: parseNumber(columns[10]),
    fifthPrizeAmount: parseAmount(columns[11]),
    number1: parseInt(columns[12], 10),
    number2: parseInt(columns[13], 10),
    number3: parseInt(columns[14], 10),
    number4: parseInt(columns[15], 10),
    number5: parseInt(columns[16], 10),
    number6: parseInt(columns[17], 10),
    bonusNumber: parseInt(columns[18], 10),
  };
};

/**
 * 여러 행의 로또 데이터를 파싱
 */
export const parseLottoData = (data: string): ParsedLottoData[] => {
  const rows = data.trim().split("\n");
  return rows.map((row, index) => {
    try {
      return parseLottoRow(row);
    } catch (error) {
      throw new Error(`Error parsing row ${index + 1}: ${error}`);
    }
  });
};
