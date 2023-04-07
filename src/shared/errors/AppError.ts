import { StatusCodes, getReasonPhrase } from 'http-status-codes';

export class AppError {
  public readonly message: string;
  public readonly statusCode: number;
  public readonly status: string;
  public readonly time: string;

  constructor(message: string, statusCode = StatusCodes.BAD_REQUEST) {
    this.message = message;
    this.statusCode = statusCode;
    this.status = getReasonPhrase(statusCode);
    this.time = new Date().toLocaleString('pt-BR');
  }
}
