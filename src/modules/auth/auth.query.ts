import { prisma } from '../../shared/middlewares/prisma.middleware';

class AuthQuery {
  async findAllUsers() {
    return await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        name: true,
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
}

export { AuthQuery };
