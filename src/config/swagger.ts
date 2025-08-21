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
        User: {
          type: "object",
          properties: {
            uid: {
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
        Lotto: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "고유 ID",
            },
            round: {
              type: "integer",
              description: "회차",
            },
            drawDate: {
              type: "string",
              format: "date-time",
              description: "추첨일",
            },
            firstPrizeWinners: {
              type: "integer",
              description: "1등당첨자수",
            },
            firstPrizeAmount: {
              type: "integer",
              description: "1등당첨금액",
            },
            secondPrizeWinners: {
              type: "integer",
              description: "2등당첨자수",
            },
            secondPrizeAmount: {
              type: "integer",
              description: "2등당첨금액",
            },
            thirdPrizeWinners: {
              type: "integer",
              description: "3등당첨자수",
            },
            thirdPrizeAmount: {
              type: "integer",
              description: "3등당첨금액",
            },
            fourthPrizeWinners: {
              type: "integer",
              description: "4등당첨자수",
            },
            fourthPrizeAmount: {
              type: "integer",
              description: "4등당첨금액",
            },
            fifthPrizeWinners: {
              type: "integer",
              description: "5등당첨자수",
            },
            fifthPrizeAmount: {
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
            bonusNumber: {
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
            data: {
              type: "object",
              properties: {
                total: {
                  type: "integer",
                },
                success: {
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
          },
        },
        LottoListResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
            },
            data: {
              type: "object",
              properties: {
                lottos: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Lotto",
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
    },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // API 라우트 파일들
};

export const specs = swaggerJsdoc(options);
