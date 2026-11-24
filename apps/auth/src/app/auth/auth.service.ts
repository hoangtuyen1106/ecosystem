import { TCP_REQUEST_MESSAGE, TCP_SERVICES } from '@ecosystem/constants';
import {
  AuthResponse,
  AuthResult,
  GetUserByKeycloakIdTcpRequest,
  IUser,
  LoginTcpRequest,
  TcpClient,
  UserAuthInfoTcpResponse,
} from '@ecosystem/interfaces';
import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt, { Jwt, JwtPayload } from 'jsonwebtoken';
import JwksRsa, { JwksClient } from 'jwks-rsa';
import { firstValueFrom, map } from 'rxjs';
import { KeycloakHttpService } from '../keycloak/keycloak-http.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private jwksClient: JwksClient;

  constructor(
    private readonly keycloakHttpService: KeycloakHttpService,
    @Inject(TCP_SERVICES.USER_ACCESS_SERVICE)
    private readonly userAccessClient: TcpClient,
    private readonly configService: ConfigService,
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

  async verifyUserToken(token: string): Promise<AuthResponse> {
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    const decoded = jwt.decode(token, { complete: true }) as Jwt;
    if (!decoded || !decoded.header || !decoded.header?.kid) {
      throw new UnauthorizedException('Invalid token structure');
    }

    try {
      const key = await this.jwksClient.getSigningKey(decoded.header.kid);

      const publicKey = key.getPublicKey();
      const payload = jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
      }) as JwtPayload;

      const keycloakId = payload.sub;

      if(!keycloakId) {
        throw new UnauthorizedException();
      }

      const user = await this.userValidation(keycloakId);

      return {
        valid: true,
        metadata: {
          user,
          userId: user.id,
          jwt: token,
          permissions: []
        },
      };
    } catch (error) {
      this.logger.error({ error });
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async userValidation(keycloakId: string) {
    const user = await this.getUserByKeycloakId(keycloakId);

    this.logger.debug({ user });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private getUserByKeycloakId(keycloakId: string) {
    return firstValueFrom(
      this.userAccessClient
        .send<
          IUser,
          string
        >(TCP_REQUEST_MESSAGE.USER.GET_BY_KEYCLOAK_ID, keycloakId)
        .pipe(map((data) => data.data)),
    );
  }
}
