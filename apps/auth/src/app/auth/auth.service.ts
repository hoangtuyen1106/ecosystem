import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginInput } from './dto/login.input';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { compare } from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './token-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { LoginTcpRequest } from '@ecosystem/interfaces';
import { PrismaService } from '../prisma/prisma.service';
import { KeycloakHttpService } from '../keycloak/keycloak-http.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly keycloakHttpService: KeycloakHttpService,
    private readonly prismaService: PrismaService,
  ) {}
  async login(params: LoginTcpRequest) {
    const { username, password } = params;
    const { access_token: accessToken, refresh_token: refreshToken } =
      await this.keycloakHttpService.exchangeUserToken({
        username,
        password,
      });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async verifyUser(identifier: string, password: string) {
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          OR: [{ username: identifier }, { email: identifier }],
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const authenticated = await compare(password, user.password);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch {
      throw new UnauthorizedException('Credentials are not valid');
    }
  }
}
