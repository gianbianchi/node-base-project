import { AppError } from '../errors/AppError';
import { Errback, NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';

export function catchErrors(
  erro: Errback,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (erro instanceof AppError) {
    return res.status(erro.statusCode).send(erro);
  } else if (erro instanceof yup.ValidationError) {
    const validationErrors: Record<string, string> = {};

    erro.inner.forEach((error) => {
      if (error.path === undefined) return;
      validationErrors[error.path] = error.message;
    });

    const errosString: string = JSON.stringify(validationErrors);

    const erroDefault = new AppError(
      `Os dados não são válidos. ${errosString}`,
      StatusCodes.NOT_ACCEPTABLE
    );
    return res.status(erroDefault.statusCode).send(erroDefault);
  } else if (erro) {
    const erroDefault = new AppError(
      `Erro interno não identificado. Mensagem do erro não identificado: ${erro.toString()}`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
    return res.status(erroDefault.statusCode).send(erroDefault);
  } else next();
}
