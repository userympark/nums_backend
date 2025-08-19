import { Request, Response, NextFunction } from "express";

export interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Sequelize 유효성 검사 에러
  if (err.name === "SequelizeValidationError") {
    const message = (err as any).errors.map((e: any) => e.message).join(", ");
    error = { message, statusCode: 400 } as CustomError;
  }

  // Sequelize 중복 키 에러
  if (err.name === "SequelizeUniqueConstraintError") {
    const message = "Duplicate field value entered";
    error = { message, statusCode: 400 } as CustomError;
  }

  // Sequelize 외래 키 제약 조건 에러
  if (err.name === "SequelizeForeignKeyConstraintError") {
    const message = "Referenced record not found";
    error = { message, statusCode: 400 } as CustomError;
  }

  // Sequelize 데이터베이스 연결 에러
  if (err.name === "SequelizeConnectionError") {
    const message = "Database connection error";
    error = { message, statusCode: 500 } as CustomError;
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Server Error";

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
