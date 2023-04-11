import { StatusCodes } from 'http-status-codes';
import { AppError } from '../../shared/errors/AppError';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthQuery } from './auth.query';

const query = new AuthQuery();

class AuthUseCase {
  async signUp(name: string, email: string, user_level: number): Promise<void> {
    const password = `${Math.floor(100000 + Math.random() * 900000)}`;

    const results = await query.findUserByEmail(email);

    if (results) {
      throw new AppError('E-mail já cadastrado.', StatusCodes.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await query.createUser({
      name,
      email,
      password: hashedPassword,
      user_level,
    });
  }

  async login(email: string, password: string): Promise<object> {
    const result = await query.findUserByEmail(email);

    if (!result) {
      throw new AppError('Email ou senha inválido.', StatusCodes.UNAUTHORIZED);
    }

    const checkPassword = await bcrypt.compare(password, result.password);

    if (!checkPassword) {
      throw new AppError('Email ou senha inválido.', StatusCodes.UNAUTHORIZED);
    }

    const token = jwt.sign(result, process.env.TOKEN_SECRET, {
      expiresIn: process.env.EXPIRES_IN,
    });

    const refreshToken = jwt.sign(result, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.REFRESH_EXPIRES_IN,
    });

    return {
      msg: 'Logado com sucesso.',
      token,
      refreshToken,
    };
  }

  async changePassword(
    id: string,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<void> {
    if (newPassword !== confirmPassword) {
      throw new AppError('As senhas devem ser iguais');
    }

    const user = await query.findUserById(id);

    if (!user) {
      throw new AppError('Usuário não existente.', StatusCodes.NOT_FOUND);
    }

    const checkPassword = await bcrypt.compare(oldPassword, user.password);

    if (!checkPassword) {
      throw new AppError(
        'E-mail ou senha inválido.',
        StatusCodes.UNPROCESSABLE_ENTITY
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await query.updateUserById(user.id, { password: hashedPassword });
  }

  async findAllUsers(): Promise<object[]> {
    const users = await query.findAllUsers();
    return users;
  }

  async findUserById(id: string): Promise<object> {
    const user = await query.findUserFieldsById(id);
    return user;
  }

  async editUser(id: string, name?: string, email?: string): Promise<void> {
    const user = await query.findUserById(id);

    if (!user) {
      throw new AppError('Usuário não encontrado.', StatusCodes.NOT_FOUND);
    }

    let data = {};
    if (name) data = { ...data, name };
    if (email) data = { ...data, email };

    await query.updateUserById(id, data);
  }

  async refreshToken(refreshToken: string): Promise<object> {
    return jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, user: any) => {
        if (err) {
          throw new AppError('The token is invalid.', StatusCodes.FORBIDDEN);
        }

        const obj = {
          id: user.id,
          name: user.name,
          preferred_name: user.preferred_name,
          user_level: user.user_level,
        };

        const token = jwt.sign(obj, process.env.TOKEN_SECRET, {
          expiresIn: process.env.EXPIRES_IN,
        });

        const response = {
          token,
        };

        return response;
      }
    );
  }
}

export { AuthUseCase };
