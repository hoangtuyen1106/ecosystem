import { AuthorizeResponse, JWTPayload } from '@ecosystem/grpc';
import { LoginTcpRequest } from '@ecosystem/interfaces';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt, { Jwt, JwtPayload } from 'jsonwebtoken';
import JwksRsa, { JwksClient } from 'jwks-rsa';
import { KeycloakHttpService } from '../keycloak/keycloak-http.service';
import { UsersService } from '../users/users.service';



@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private jwksClient: JwksClient;

  constructor(
    private readonly keycloakHttpService: KeycloakHttpService,
    private readonly userService: UsersService,
    private readonly configService: ConfigService
  ) {
    const host = this.configService.getOrThrow('KEYCLOAK_HOST');
    const realm = this.configService.get('KEYCLOAK_REALM');

    this.jwksClient = JwksRsa({
      jwksUri: `${host}/realms/${realm}/protocol/openid-connect/certs`,
      cache: true,
      rateLimit: true,
    });

  }
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

  async verifyUserToken(token: string): Promise<AuthorizeResponse> {
    const decoded = jwt.decode(token, { complete: true }) as Jwt;
    if (!decoded || !decoded.header || !decoded.header?.kid) {
      throw new UnauthorizedException('Invalid token structure');
    }
    this.logger.debug(decoded);
    try {
      const key = await this.jwksClient.getSigningKey(decoded.header.kid);
      const publicKey = key.getPublicKey();
      const payload = jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
      }) as JwtPayload;

      if (!payload.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const user = await this.userValidation(payload.sub);

      return {
        valid: true,
        metadata: {
          keycloakId: user.id ?? undefined,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName ?? undefined,
            email: user.email,
            roles: user.roles.map(({ role }) => ({
              name: role.name,
              description: role.description ?? '',
              permissions: role.permissions,
            })),
          },
          jwt: {
            iss: payload.iss ?? '',
            aud: Array.isArray(payload.aud)
              ? payload.aud.join(',')
              : (payload.aud ?? ''),
            iat: payload.iat ?? 0,
            exp: payload.exp ?? 0,
            sub: payload.sub,
            atHash: payload['at_hash'] ?? '',
            sid: payload['sid'] ?? '',
            nonce: payload['nonce'] ?? '',
            isExpired: payload.exp ? payload.exp * 1000 <= Date.now() : false,
          },
        },
      };
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async userValidation(keycloakId: string) {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
