import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../errors/AppError';

export function incorrectRoute(req: Request) {
  const error = new AppError(
    `Endpoint '${req.method}: ${req.baseUrl}' não existe!`,
    StatusCodes.NOT_FOUND
  );
  throw error;
}
