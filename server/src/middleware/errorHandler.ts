import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction): void {
  // Redact any potential credentials or secrets from log
  const sanitizedMessage = String(err.message || err).replace(
    /(?:bearer|token|secret|password|key)\s*[:=]\s*['"]?[^\s'";,]+['"]?/gi,
    '[REDACTED]'
  );

  console.error(`[Error] ${req.method} ${req.originalUrl}:`, sanitizedMessage);

  const status = typeof err.statusCode === 'number' ? err.statusCode : 500;
  const userMessage = err.isPublic ? err.message : (
    status === 500 ? 'An internal server error occurred. Please try again later.' : (err.message || 'Operation failed')
  );

  res.status(status).json({
    error: userMessage,
    ...(config.nodeEnv === 'development' && { details: sanitizedMessage })
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: `Resource not found: ${req.method} ${req.originalUrl}`
  });
}
