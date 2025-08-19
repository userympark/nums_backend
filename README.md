# NUMS Backend API Server

Node.js, Express, TypeScript, PostgreSQL, Sequelize를 사용한 백엔드 API 서버입니다.

## 🚀 기능

### 🛡️ 보안 및 성능

- PostgreSQL 데이터베이스 연동
- Sequelize ORM 사용
- TypeScript 지원
- 보안 미들웨어 (Helmet, CORS)
- 에러 핸들링
- 데이터베이스 마이그레이션 및 시드

## 📋 요구사항

- Node.js 16+
- PostgreSQL 12+
- npm 또는 yarn

## 🛠️ 설치 및 실행

1. **의존성 설치**

   ```bash
   npm install
   ```

2. **PostgreSQL 설치 및 설정**

   - PostgreSQL을 설치하고 서비스를 시작하세요
   - 데이터베이스를 생성하세요: `createdb nums_db`

3. **환경 변수 설정**

   ```bash
   copy env.example .env
   ```

   `.env` 파일을 편집하여 PostgreSQL 연결 정보를 입력하세요.

4. **데이터베이스 마이그레이션**

   ```bash
   npm run db:migrate
   ```

5. **개발 서버 실행**

   ```bash
   npm run dev
   ```

6. **프로덕션 빌드**
   ```bash
   npm run build
   npm start
   ```

## 📁 프로젝트 구조

```
src/
├── config/              # 설정 파일
│   ├── database.js      # Sequelize CLI 설정
│   └── database.ts      # TypeScript 데이터베이스 연결
├── controllers/         # 컨트롤러
├── middleware/          # 미들웨어
│   └── errorHandler.ts  # 에러 처리
├── models/              # Sequelize 모델
├── routes/              # 라우트
├── migrations/          # 데이터베이스 마이그레이션
├── seeders/             # 데이터 시드
├── utils/               # 유틸리티 함수
└── index.ts             # 메인 서버 파일
```

## 🔌 API 엔드포인트

### 기본

- `GET /` - 서버 정보
- `GET /api/health` - 헬스 체크

## 🔧 스크립트

- `npm run dev` - 개발 서버 실행 (nodemon)
- `npm run build` - TypeScript 컴파일
- `npm start` - 프로덕션 서버 실행
- `npm run db:migrate` - 데이터베이스 마이그레이션 실행
- `npm run db:migrate:undo` - 마지막 마이그레이션 되돌리기
- `npm run db:seed` - 시드 데이터 실행
- `npm run db:seed:undo` - 시드 데이터 되돌리기
- `npm run db:create` - 데이터베이스 생성
- `npm run db:drop` - 데이터베이스 삭제

## 📝 환경 변수

| 변수명         | 설명                  | 기본값                |
| -------------- | --------------------- | --------------------- |
| PORT           | 서버 포트             | 3000                  |
| NODE_ENV       | 환경 설정             | development           |
| DB_HOST        | PostgreSQL 호스트     | localhost             |
| DB_PORT        | PostgreSQL 포트       | 5432                  |
| DB_USER        | 데이터베이스 사용자   | postgres              |
| DB_PASSWORD    | 데이터베이스 비밀번호 | password              |
| DB_NAME        | 데이터베이스 이름     | nums_db               |
| DB_NAME_TEST   | 테스트 DB 이름        | nums_db_test          |
| JWT_SECRET     | JWT 시크릿 키         | -                     |
| JWT_EXPIRES_IN | JWT 만료 시간         | 24h                   |
| CORS_ORIGIN    | CORS 허용 도메인      | http://localhost:3000 |

## 🗄️ PostgreSQL + Sequelize 특징

### 데이터베이스 설정

- **PostgreSQL**: 강력한 관계형 데이터베이스
- **Sequelize ORM**: Node.js용 ORM
- **마이그레이션**: 데이터베이스 스키마 버전 관리
- **시드**: 초기 데이터 자동 생성

### 개발 도구

- **Sequelize CLI**: 마이그레이션 및 시드 관리
- **TypeScript**: 타입 안전성 보장
- **Hot Reload**: 개발 시 자동 재시작

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 ISC 라이선스 하에 배포됩니다.
