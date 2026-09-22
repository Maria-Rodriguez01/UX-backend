import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';

import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../prisma/prisma.service.js';

import { LoginDto } from './dto/login.dto.js';

import { CreateUserDto } from '../users/dto/create-user.dto.js';

import { signToken } from './jwt.util.js';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(createUserDto: CreateUserDto) {
    const correo = createUserDto.correo.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({
      where: {
        correo,
      },
    });

    if (existing) {
      throw new ConflictException('El correo ya está registrado');
    }

    // 1. Generamos el salt
    const salt = await bcrypt.genSalt(10);

    // 2. Creamos el hash usando ese salt
    const contraseñaHash = await bcrypt.hash(createUserDto.contraseña, salt);

    try {
      const user = await this.prisma.user.create({
        data: {
          nombre: createUserDto.nombre,
          correo,
          contraseña: contraseñaHash,
          salt,
        },
      });

      return {
        message: 'Usuario registrado correctamente',

        user: {
          id: user.id,
          nombre: user.nombre,
          correo: user.correo,
          fechaRegistro: user.fechaRegistro,
        },
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('El correo ya está registrado');
      }

      throw new InternalServerErrorException('No se pudo registrar el usuario');
    }
  }

  async login(loginDto: LoginDto) {
    const correo = loginDto.correo.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: {
        correo,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 1. Tomamos el salt guardado del usuario
    const salt = user.salt;

    // 2. Generamos nuevamente el hash usando:
    //    contraseña ingresada + salt guardado
    const contraseñaHash = await bcrypt.hash(loginDto.contraseña, salt);

    // 3. Comparamos el hash generado con el hash almacenado
    if (contraseñaHash !== user.contraseña) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      throw new InternalServerErrorException('JWT_SECRET no está configurado');
    }

    const accessToken = signToken(
      {
        id: user.id,
        correo: user.correo,
        nombre: user.nombre,
        permissions: ['view:habits'],
      },
      JWT_SECRET,
      {
        expiresIn: '7d',
      },
    );

    return {
      access_token: accessToken,

      message: 'Inicio de sesión exitoso',

      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        fechaRegistro: user.fechaRegistro,
      },
    };
  }

  findUserByEmail(correo: string) {
    return this.prisma.user.findUnique({
      where: {
        correo: correo.toLowerCase(),
      },
    });
  }
}
