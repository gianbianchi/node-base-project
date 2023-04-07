import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthUseCase } from './auth.useCase';

const useCase = new AuthUseCase();

class AuthController {
  async signUp(request: Request, response: Response): Promise<Response> {
    const { name, email, user_level } = request.body;
    const res = await useCase.signUp(name, email, user_level);
    return response.status(StatusCodes.OK).json(res);
  }

  async login(request: Request, response: Response): Promise<Response> {
    const { email, password } = request.body;
    const res = await useCase.login(email, password);
    return response.status(StatusCodes.OK).json(res);
  }

  async firstAccess(request: Request, response: Response): Promise<Response> {
    const { id } = request.user;
    const { new_password, confirm_password } = request.body;
    await useCase.firstAccess(id, new_password, confirm_password);
    return response.status(StatusCodes.NO_CONTENT).json();
  }

  async forgotPassword(
    request: Request,
    response: Response
  ): Promise<Response> {
    const { email } = request.body;
    const res = await useCase.forgotPassword(email);
    return response.status(StatusCodes.OK).json(res);
  }

  async newPassword(request: Request, response: Response): Promise<Response> {
    const { code, password } = request.body;
    await useCase.newPassword(code, password);
    return response.status(StatusCodes.NO_CONTENT).json();
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

  async inactivateUser(
    request: Request,
    response: Response
  ): Promise<Response> {
    const { id } = request.params;
    await useCase.inactivateUser(id);
    return response.status(StatusCodes.NO_CONTENT).json();
  }

  async editUser(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const { name, email, user_function, user_level } = request.body;
    await useCase.editUser(id, name, email, user_function, user_level);
    return response.status(StatusCodes.NO_CONTENT).json();
  }

  async refreshToken(request: Request, response: Response): Promise<Response> {
    const { refreshToken } = request.body;
    const res = await useCase.refreshToken(refreshToken);
    return response.status(StatusCodes.OK).json(res);
  }
}

export { AuthController };
