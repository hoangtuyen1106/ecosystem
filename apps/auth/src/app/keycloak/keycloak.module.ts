import { Module } from '@nestjs/common';
import { KeycloakController } from './keycloak.controller';
import { KeycloakHttpService } from './keycloak-http.service';

@Module({
  controllers: [KeycloakController],
  providers: [KeycloakHttpService],
  exports: [KeycloakHttpService],
})
export class KeycloakModule {}
