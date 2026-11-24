import { TCP_SERVICES } from '@ecosystem/constants';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { KeycloakHttpService } from '../keycloak/keycloak-http.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: KeycloakHttpService,
          useValue: {},
        },
        {
          provide: TCP_SERVICES.USER_ACCESS_SERVICE,
          useValue: { send: jest.fn(), emit: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => `mock-${key}`),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
