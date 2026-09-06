import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByCorreo(correo: string) {
    return this.prisma.user.findUnique({
      where: { correo: correo.toLowerCase() },
    });
  }

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }
}