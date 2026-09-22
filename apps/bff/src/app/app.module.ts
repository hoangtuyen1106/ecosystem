import { LoggerModule } from '@ecosystem/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
