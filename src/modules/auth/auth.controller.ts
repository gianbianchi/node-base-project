import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthUseCase } from './auth.useCase';

const useCase = new AuthUseCase();

class AuthController {
  async signUp(request: Request, response: Response): Promise<Response> {
    const { name, email, user_level } = request.body;
    await useCase.signUp(name, email, user_level);
    return response.status(StatusCodes.NO_CONTENT).json();
  }

  async login(request: Request, response: Response): Promise<Response> {
    const { email, password } = request.body;
    const res = await useCase.login(email, password);
    return response.status(StatusCodes.OK).json(res);
  }

  async changePassword(
    request: Request,
    response: Response
  ): Promise<Response> {
    const { id } = request.user;
    const { oldPassword, newPassword, confirmPassword } = request.body;
    await useCase.changePassword(id, oldPassword, newPassword, confirmPassword);
    return response.status(StatusCodes.NO_CONTENT).json();
  }

  async findAllUsers(request: Request, response: Response): Promise<Response> {
    const res = await useCase.findAllUsers();
    return response.status(StatusCodes.OK).json(res);
  }

  async findUserById(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const res = await useCase.findUserById(id);
    return response.status(StatusCodes.OK).json(res);
  }

  async editUser(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const { name, email } = request.body;
    await useCase.editUser(id, name, email);
    return response.status(StatusCodes.NO_CONTENT).json();
  }

  async refreshToken(request: Request, response: Response): Promise<Response> {
    const { refreshToken } = request.body;
    const res = await useCase.refreshToken(refreshToken);
    return response.status(StatusCodes.OK).json(res);
  }
}

export { AuthController };
