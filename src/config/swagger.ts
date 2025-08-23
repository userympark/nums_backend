import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NUMS Backend API",
      version: "1.0.0",
      description: "로또 데이터 관리 API 서버",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:8080",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "JWT 토큰을 입력하세요. Bearer 접두사는 자동으로 추가됩니다.",
        },
      },
      schemas: {
        Health: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "서버 상태",
              example: true,
            },
            message: {
              type: "string",
              description: "상태 메시지",
              example: "Server is healthy",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "응답 시간",
              example: "2024-01-01T00:00:00.000Z",
            },
            environment: {
              type: "string",
              description: "환경 설정",
              example: "development",
            },
            database: {
              type: "object",
              properties: {
                status: {
                  type: "string",
                  enum: ["connected", "disconnected"],
                  description: "데이터베이스 연결 상태",
                  example: "connected",
                },
                type: {
                  type: "string",
                  description: "데이터베이스 타입",
                  example: "PostgreSQL + Sequelize",
                },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "요청 성공 여부",
              example: false,
            },
            message: {
              type: "string",
              description: "에러 메시지",
              example: "에러가 발생했습니다.",
            },
            errorCode: {
              type: "string",
              description: "에러 코드",
              example: "VALIDATION_ERROR",
            },
            error: {
              type: "string",
              description: "상세 에러 정보 (선택사항)",
              example: "Additional error details",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            user_id: {
              type: "integer",
              description: "사용자 고유 ID",
            },
            username: {
              type: "string",
              description: "사용자명 (3-50자, 영문/숫자/언더스코어만)",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "가입일",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "수정일",
            },
          },
        },
        Theme: {
          type: "object",
          properties: {
            theme_id: {
              type: "integer",
              description: "테마 고유 ID",
            },
            name: {
              type: "string",
              description: "테마 이름",
            },
            name_kr: {
              type: "string",
              description: "테마 한글 이름",
            },
            mode: {
              type: "string",
              enum: ["light", "dark"],
              description: "테마 모드",
            },
            colors: {
              type: "object",
              description: "Vuetify 컬러셋",
              properties: {
                primary: {
                  type: "string",
                  description: "주요 컬러",
                  example: "#1976D2",
                },
                secondary: {
                  type: "string",
                  description: "보조 컬러",
                  example: "#424242",
                },
                accent: {
                  type: "string",
                  description: "강조 컬러",
                  example: "#82B1FF",
                },
                error: {
                  type: "string",
                  description: "에러 컬러",
                  example: "#FF5252",
                },
                info: {
                  type: "string",
                  description: "정보 컬러",
                  example: "#2196F3",
                },
                success: {
                  type: "string",
                  description: "성공 컬러",
                  example: "#4CAF50",
                },
                warning: {
                  type: "string",
                  description: "경고 컬러",
                  example: "#FFC107",
                },
                background: {
                  type: "string",
                  description: "배경 컬러",
                  example: "#FFFFFF",
                },
                surface: {
                  type: "string",
                  description: "표면 컬러",
                  example: "#FFFFFF",
                },
                "on-primary": {
                  type: "string",
                  description: "주요 컬러 위의 텍스트 컬러",
                  example: "#FFFFFF",
                },
                "on-secondary": {
                  type: "string",
                  description: "보조 컬러 위의 텍스트 컬러",
                  example: "#FFFFFF",
                },
                "on-background": {
                  type: "string",
                  description: "배경 위의 텍스트 컬러",
                  example: "#000000",
                },
                "on-surface": {
                  type: "string",
                  description: "표면 위의 텍스트 컬러",
                  example: "#000000",
                },
              },
            },
            is_default: {
              type: "boolean",
              description: "기본 테마 여부",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "수정일",
            },
          },
        },
        UserProfile: {
          type: "object",
          properties: {
            user_id: {
              type: "integer",
              description: "사용자 고유 ID (users 테이블 참조)",
            },
            nickname: {
              type: "string",
              description: "닉네임 (1-50자)",
            },
            level: {
              type: "integer",
              description: "레벨 (1-999)",
              example: 1,
            },
            experience: {
              type: "integer",
              description: "경험치",
              example: 0,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "수정일",
            },
            user: {
              type: "object",
              description: "연결된 사용자 정보",
              properties: {
                user_id: {
                  type: "integer",
                  description: "사용자 고유 ID",
                },
                username: {
                  type: "string",
                  description: "사용자명",
                },
                createdAt: {
                  type: "string",
                  format: "date-time",
                  description: "가입일",
                },
              },
            },
          },
        },
        UserConfig: {
          type: "object",
          properties: {
            user_id: {
              type: "integer",
              description: "사용자 고유 ID (users 테이블 참조)",
            },
            active_theme: {
              type: "integer",
              description: "마지막 사용 테마 ID (themes 테이블 참조)",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "수정일",
            },
            user: {
              type: "object",
              description: "연결된 사용자 정보",
              properties: {
                user_id: {
                  type: "integer",
                  description: "사용자 고유 ID",
                },
                username: {
                  type: "string",
                  description: "사용자명",
                },
              },
            },
            theme: {
              type: "object",
              description: "연결된 테마 정보",
              properties: {
                theme_id: {
                  type: "integer",
                  description: "테마 고유 ID",
                },
                name: {
                  type: "string",
                  description: "테마 이름",
                },
                mode: {
                  type: "string",
                  enum: ["light", "dark"],
                  description: "테마 모드",
                },
                colors: {
                  type: "object",
                  description: "Vuetify 컬러셋",
                },
              },
            },
          },
        },
        Admin: {
          type: "object",
          properties: {
            admin_id: {
              type: "integer",
              description: "관리자 고유 ID",
            },
            user_id: {
              type: "integer",
              description: "사용자 고유 ID (users 테이블 참조)",
            },
            role: {
              type: "string",
              enum: ["admin", "super_admin"],
              description: "관리자 역할",
            },
            permissions: {
              type: "array",
              items: {
                type: "string",
              },
              description: "권한 목록",
              example: ["user_manage", "theme_manage", "game_manage"],
            },
            is_active: {
              type: "boolean",
              description: "관리자 계정 활성화 상태",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "수정일",
            },
          },
        },
        Game: {
          type: "object",
          properties: {
            game_id: {
              type: "integer",
              description: "고유 ID",
            },
            round: {
              type: "integer",
              description: "회차",
            },
            draw_date: {
              type: "string",
              format: "date-time",
              description: "추첨일",
            },
            first_prize_winners: {
              type: "integer",
              description: "1등당첨자수",
            },
            first_prize_amount: {
              type: "integer",
              description: "1등당첨금액",
            },
            second_prize_winners: {
              type: "integer",
              description: "2등당첨자수",
            },
            second_prize_amount: {
              type: "integer",
              description: "2등당첨금액",
            },
            third_prize_winners: {
              type: "integer",
              description: "3등당첨자수",
            },
            third_prize_amount: {
              type: "integer",
              description: "3등당첨금액",
            },
            fourth_prize_winners: {
              type: "integer",
              description: "4등당첨자수",
            },
            fourth_prize_amount: {
              type: "integer",
              description: "4등당첨금액",
            },
            fifth_prize_winners: {
              type: "integer",
              description: "5등당첨자수",
            },
            fifth_prize_amount: {
              type: "integer",
              description: "5등당첨금액",
            },
            number1: {
              type: "integer",
              description: "첫번째 당첨번호",
            },
            number2: {
              type: "integer",
              description: "두번째 당첨번호",
            },
            number3: {
              type: "integer",
              description: "세번째 당첨번호",
            },
            number4: {
              type: "integer",
              description: "네번째 당첨번호",
            },
            number5: {
              type: "integer",
              description: "다섯번째 당첨번호",
            },
            number6: {
              type: "integer",
              description: "여섯번째 당첨번호",
            },
            bonus_number: {
              type: "integer",
              description: "보너스번호",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "수정일",
            },
          },
        },
        UploadResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
            },
            message: {
              type: "string",
            },
            total: {
              type: "integer",
            },
            successCount: {
              type: "integer",
            },
            errorCount: {
              type: "integer",
            },
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  round: {
                    type: "integer",
                  },
                  status: {
                    type: "string",
                  },
                  message: {
                    type: "string",
                  },
                },
              },
            },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  round: {
                    type: "integer",
                  },
                  error: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        GameListResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
            },
            games: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Game",
              },
            },
            totalItems: {
              type: "integer",
            },
            pagination: {
              type: "object",
              properties: {
                currentPage: {
                  type: "integer",
                },
                totalPages: {
                  type: "integer",
                },
                totalItems: {
                  type: "integer",
                },
                itemsPerPage: {
                  type: "integer",
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // API 라우트 파일들
};

export const specs = swaggerJsdoc(options);
