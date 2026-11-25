import { Controller, UseInterceptors } from '@nestjs/common';
import { KeycloakHttpService } from './keycloak-http.service';
import { TCP_REQUEST_MESSAGE } from '@ecosystem/constants';
import { MessagePattern } from '@nestjs/microservices';
import { RequestParams } from '@ecosystem/decorators';
import { CreateKeycloakUserTcpReq, Response } from '@ecosystem/interfaces';
import { TcpLoggingInterceptor } from '@ecosystem/interceptors';

@Controller('keycloak')
@UseInterceptors(TcpLoggingInterceptor)
export class KeycloakController {
    constructor(private readonly keycloakHttpService: KeycloakHttpService) {}

    @MessagePattern(TCP_REQUEST_MESSAGE.KEYCLOAK.CREATE_USER)
      async create(@RequestParams() data: CreateKeycloakUserTcpReq): Promise<Response<string>> {
        const result = await this.keycloakHttpService.createUser(data);
        return Response.success<string>(result);
      }
}
