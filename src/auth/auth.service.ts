import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const correo = createUserDto.correo.trim().toLowerCase();

    const existing = await this.usersService.findByCorreo(correo);
    if (existing) {
      throw new ConflictException('El correo ya está registrado');
    }

    const contraseñaHash = await bcrypt.hash(createUserDto.contraseña, 10);

    try {
      const user = await this.usersService.create({
        nombre: createUserDto.nombre,
        correo,
        contraseña: contraseñaHash,
      });
      return this.toSafeUser('Usuario registrado correctamente', user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('El correo ya está registrado');
        }
      }
      throw new InternalServerErrorException(
        'No se pudo registrar el usuario',
      );
    }
  }

  async login(loginDto: LoginDto) {
    const correo = loginDto.correo.trim().toLowerCase();

    const user = await this.usersService.findByCorreo(correo);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const contraseñaValida = await bcrypt.compare(
      loginDto.contraseña,
      user.contraseña,
    );
    if (!contraseñaValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      correo: user.correo,
    });

    return {
      access_token: accessToken,
      ...this.toSafeUser('Inicio de sesión exitoso', user),
    };
  }

  private toSafeUser(
    message: string,
    user: {
      id: string;
      nombre: string;
      correo: string;
      fechaRegistro: Date;
    },
  ) {
    return {
      message,
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        fechaRegistro: user.fechaRegistro,
      },
    };
  }
}