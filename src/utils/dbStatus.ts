/**
 * 글로벌 데이터베이스 연결 상태 관리
 * TODO: DB 연결 상태가 변경될 때마다 이 클래스를 통해 상태를 업데이트해야 함
 * TODO: 추후 DB 재연결 로직이 추가되면 여기서 상태를 동기화할 것
 */
export class DBStatus {
  private static connected: boolean = false;

  /**
   * DB 연결 상태 설정
   * @param status - 연결 상태 (true: 연결됨, false: 연결 안됨)
   */
  static setConnected(status: boolean): void {
    this.connected = status;
    console.log(
      `📊 DB Status updated: ${status ? "Connected" : "Disconnected"}`
    );
  }

  /**
   * 현재 DB 연결 상태 확인
   * @returns 연결 상태
   */
  static isConnected(): boolean {
    return this.connected;
  }

  /**
   * DB 연결이 필요한 작업 전 상태 확인
   * @throws Error DB가 연결되지 않은 경우
   */
  static requireConnection(): void {
    if (!this.connected) {
      throw new Error("Database connection is required for this operation");
    }
  }
}

/**
 * 데이터베이스 사용 불가 에러 클래스
 */
export class DatabaseUnavailableError extends Error {
  constructor(message: string = "Database is currently unavailable") {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}
