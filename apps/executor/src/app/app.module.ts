import { Module } from '@nestjs/common';
import { JobsModule } from './jobs/jobs.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@ecosystem/nestjs';

@Module({
  imports: [JobsModule, LoggerModule, ConfigModule.forRoot({ isGlobal: true })],
})
export class AppModule {}
