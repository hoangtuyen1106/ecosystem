import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
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
import { AuthorizeResponse, JWTPayload } from '@ecosystem/grpc';
import jwksRsa, { JwksClient } from 'jwks-rsa';


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private jwksClient: JwksClient;

  constructor(
    private readonly keycloakHttpService: KeycloakHttpService,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async login(params: LoginTcpRequest) {
    // this.logger.debug(params);
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

  async verifyUserToken(token: string): Promise<AuthorizeResponse> {
    const decoded = this.jwtService.decode(token, {
      complete: true,
    });

    if (!decoded || !decoded.header?.kid) {
      throw new UnauthorizedException('Invalid token structure');
    }

    try {
      const key = await this.jwksClient.getSigningKey(decoded.header.kid);
      const publicKey = key.getPublicKey();

      const payload = await this.jwtService.verifyAsync<JWTPayload>(
        token,
        {
          publicKey,
          algorithms: ['RS256'],
        },
      );

      this.logger.debug({ userId: payload.sub });

      const user = await this.userValidation(payload.sub);

      return {
        valid: true,
        metadata: {
          jwt: payload,
          permissions: (user.roles as unknown as Role[])
            .flatMap((role) => role.permissions),
          user,
          userId: user.id,
        },
      };
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
