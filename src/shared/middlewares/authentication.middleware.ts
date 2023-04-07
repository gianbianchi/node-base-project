import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

export async function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return response.sendStatus(401);
  }

  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return response.sendStatus(401);
  }

  try {
    verify(token, process.env.TOKEN_SECRET, (err, user: any) => {
      if (err) {
        return response.sendStatus(403);
      }
      request.user = {
        id: user.id,
      };
      next();
    });
  } catch {
    return response.sendStatus(401);
  }
}
