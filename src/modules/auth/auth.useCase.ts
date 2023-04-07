import { StatusCodes } from 'http-status-codes';
import { AppError } from '../../shared/errors/AppError';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../../shared/config/mailer';
import { AuthQuery } from './auth.query';

const query = new AuthQuery();

class AuthUseCase {
  async signUp(name: string, email: string, user_level: number): Promise<any> {
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

    await sendEmail(email, 'Primeiro acesso', 'template', password);

    return await {
      msg: 'Email cadastrado com sucesso!',
    };
  }

  async login(email: string, password: string): Promise<any> {
    const result = await query.findUserByEmail(email);

    if (!result || result.state === 'INACTIVE') {
      throw new AppError('Email ou senha inválido.', StatusCodes.UNAUTHORIZED);
    }

    const checkPassword = await bcrypt.compare(password, result.password);

    const attempts = await query.findUserLoginAttemptsByUserId(result.id);

    if (attempts && attempts.attempts >= 3) {
      throw new AppError('Número de tentativas excedido, altere sua senha.');
    }

    if (!checkPassword) {
      if (!attempts) {
        await query.createUserLoginAttempts({
          user_id: result.id,
          attempts: 1,
        });
      } else {
        await query.updateUserLoginAttempts(attempts.id, attempts.attempts);
      }
      throw new AppError('Email ou senha inválido.', StatusCodes.UNAUTHORIZED);
    }

    if (attempts) {
      await query.updateUserLoginAttempts(attempts.id, 0);
    }

    const token = jwt.sign(result, process.env.TOKEN_SECRET, {
      expiresIn: process.env.EXPIRES_IN,
    });

    const refreshToken = jwt.sign(result, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.REFRESH_EXPIRES_IN,
    });

    let first_access = false;
    if (result.state === 'FIRST_ACCESS') {
      first_access = true;
    }

    return {
      msg: 'Logado com sucesso.',
      token,
      refreshToken,
      first_access,
      user_level: result.user_level,
    };
  }

  async firstAccess(
    id: string,
    new_password: string,
    confirm_password: string
  ): Promise<any> {
    if (new_password !== confirm_password) {
      throw new AppError('As senhas devem ser iguais.');
    }

    const user = await query.findUserById(id);

    if (!user) {
      throw new AppError('Usuário não existente.', StatusCodes.NOT_FOUND);
    }
    const hashedPassword = await bcrypt.hash(new_password, 10);

    await query.updateUserById(user.id, {
      password: hashedPassword,
      state: 'ACTIVE',
    });

    await create_log(
      'PRIMEIRO ACESSO',
      `Usuário ${user?.name} realizou o primeiro acesso.`
    );
  }

  async forgotPassword(email: string): Promise<any> {
    const result = await query.findUserByEmail(email);

    if (!result) {
      throw new AppError('Email não registrado', StatusCodes.NOT_FOUND);
    }

    //gerar link ou código aleatório para mudar a senha.
    const expires_at = new Date(Date.now() + 3600000);

    const code = `${Math.floor(100000 + Math.random() * 900000)}`;
    const user_id = result.id;
    await query.userForgotPassCreate({
      code: code,
      user_id: user_id,
      expires_at: expires_at,
    });

    //enviar link para o email
    await sendEmail(email, 'Redefinir senha', 'template', code);

    return {
      msg: 'Email enviado para sua caixa de entrada!',
    };
  }

  async newPassword(code: string, password: string): Promise<any> {
    const result = await query.findFirstUsersForgotPassByCode(code);

    if (!result) {
      throw new AppError(
        'Código não equivalente',
        StatusCodes.UNPROCESSABLE_ENTITY
      );
    }

    if (result.expires_at.getTime() < Date.now()) {
      throw new AppError('Código expirado!', StatusCodes.UNAUTHORIZED);
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    await query.updateUserById(result.user_id, { password: hashedPassword });

    await query.updateUsersForgotPassById(result.id, {
      expires_at: new Date(),
    });

    const attempts = await query.findUserLoginAttemptsByUserId(result.user_id);

    if (attempts) {
      await query.updateUserLoginAttempts(attempts.id, 0);
    }

    //log
    const user = await query.findUserById(result.user_id);
    await create_log(
      'SENHA ALTERADA',
      `Usuário ${user?.name} criou uma nova senha.`
    );
  }

  async changePassword(
    id: string,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<any> {
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

    const attempts = await query.findUserLoginAttemptsByUserId(user.id);

    if (attempts) {
      await query.updateUserLoginAttempts(attempts.id, 0);
    }

    //log
    await create_log('SENHA ALTERADA', `Usuário ${user.name} alterou a senha.`);
  }

  async findAllUsers(): Promise<any> {
    const users = await query.findAllActiveUsers();
    return users;
  }

  async findUserById(id: string): Promise<any> {
    const user = await query.findUserFieldsById(id);
    return user;
  }

  async inactivateUser(id: string): Promise<any> {
    const user = await query.findUserById(id);

    if (!user) {
      throw new AppError('Usuário não encontrado.', StatusCodes.NOT_FOUND);
    }

    await query.updateUserById(id, {
      state: 'INACTIVE',
      email: `${user.email}_inactive`,
    });

    await create_log(
      'USUÁRIO INATIVADO',
      `Usuário ${user?.name} foi inativado.`
    );
  }

  async editUser(
    id: string,
    name?: string,
    email?: string,
    user_function?: string,
    user_level?: number
  ): Promise<any> {
    const user = await query.findUserById(id);

    if (!user) {
      throw new AppError('Usuário não encontrado.', StatusCodes.NOT_FOUND);
    }

    let data = {};
    if (name) data = { ...data, name };
    if (email) data = { ...data, email };
    if (user_function) data = { ...data, user_function };
    if (user_level) data = { ...data, user_level };

    await query.updateUserById(id, data);

    await create_log(
      'USUÁRIO ALTERADO',
      `Usuário ${user?.name} teve seu ${name ? 'nome, ' : ''}${
        email ? 'email, ' : ''
      }${user_function ? 'função, ' : ''}${
        user_level ? 'nível, ' : ''
      }alterado.`
    );
  }

  async refreshToken(refreshToken: string): Promise<any> {
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
