import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

// Express Request 타입 확장
declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: number;
        username: string;
        role?: string;
      };
    }
  }
}

// JWT 토큰 검증 미들웨어
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
        error: "No token provided",
        errorCode: "MISSING_AUTH_TOKEN",
      });
    }

    // "Bearer " 제거하고 토큰만 추출
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
        error: "Invalid token format",
        errorCode: "INVALID_TOKEN_FORMAT",
      });
    }

    // JWT 토큰 검증
    const jwtSecret = process.env.JWT_SECRET || "fallback_secret_key";

    try {
      const decoded = jwt.verify(token, jwtSecret) as any;

      // 요청 객체에 사용자 정보 추가
      req.user = {
        user_id: decoded.user_id,
        username: decoded.username,
      };

      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
        error: "Token verification failed",
        errorCode: "TOKEN_VERIFICATION_FAILED",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authentication error",
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "AUTHENTICATION_ERROR",
    });
  }
};

// 선택적 인증 미들웨어 (토큰이 있으면 검증, 없으면 통과)
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const jwtSecret = process.env.JWT_SECRET || "fallback_secret_key";

      try {
        const decoded = jwt.verify(token, jwtSecret) as any;
        req.user = {
          user_id: decoded.user_id,
          username: decoded.username,
        };
      } catch (jwtError) {
        // 토큰이 유효하지 않아도 통과 (선택적 인증)
        req.user = undefined;
      }
    } else {
      req.user = undefined;
    }

    next();
  } catch (error) {
    req.user = undefined;
    next();
  }
};

// 관리자 권한 확인 미들웨어
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "인증이 필요합니다.",
        errorCode: "AUTHENTICATION_REQUIRED",
      });
    }

    // Admin 모델을 동적으로 import (순환 참조 방지)
    const Admin = (await import("../models/Admin")).default;

    // 사용자가 관리자인지 확인
    const admin = await Admin.findOne({
      where: {
        user_id: req.user.user_id,
        is_active: true,
      },
    });

    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "관리자 권한이 필요합니다.",
        errorCode: "ADMIN_ACCESS_REQUIRED",
      });
    }

    // 관리자 정보를 요청 객체에 추가
    req.user = {
      ...req.user,
      role: admin.role,
    };

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "권한 확인 중 오류가 발생했습니다.",
      errorCode: "ADMIN_CHECK_ERROR",
    });
  }
};
