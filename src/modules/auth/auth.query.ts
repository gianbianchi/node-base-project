import { prisma } from '../../shared/middlewares/prisma.middleware';

class AuthQuery {
  async findAllActiveUsers() {
    return await prisma.users.findMany({
      where: {
        state: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        name: true,
        state: true,
        user_level: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async findUserById(id: string) {
    return prisma.users.findUnique({
      where: {
        id,
      },
    });
  }

  async findUserByEmail(email: string) {
    return prisma.users.findUnique({
      where: {
        email,
      },
    });
  }

  async findUserFieldsById(id: string) {
    return await prisma.users.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        state: true,
        user_level: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async createUser(data: any) {
    await prisma.users.create({
      data: data,
    });
  }

  async updateUserById(id: string, data: any) {
    await prisma.users.update({
      where: {
        id: id,
      },
      data: data,
    });
  }

  async findUserLoginAttemptsByUserId(user_id: string) {
    return prisma.users_login_attempts.findFirst({
      where: { user_id },
    });
  }

  async createUserLoginAttempts(data: any) {
    await prisma.users_login_attempts.create({
      data: data,
    });
  }

  async updateUserLoginAttempts(id: string, attempts: number) {
    await prisma.users_login_attempts.update({
      where: {
        id: id,
      },
      data: {
        attempts: attempts + 1,
      },
    });
  }

  async userForgotPassCreate(data: any) {
    await prisma.users_forgot_pass.create({
      data: data,
    });
  }

  async findFirstUsersForgotPassByCode(code: string) {
    return await prisma.users_forgot_pass.findFirst({
      where: {
        code,
      },
    });
  }

  async updateUsersForgotPassById(id: string, data: any) {
    await prisma.users_forgot_pass.update({
      where: {
        id: id,
      },
      data: data,
    });
  }
}

export { AuthQuery };
