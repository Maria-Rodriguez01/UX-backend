import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { JwtAuthMiddleware } from '../auth/jwt-auth.middleware.js';

import { RecordsController } from './records.controller.js';

import { RecordsService } from './records.service.js';

@Module({
  controllers: [RecordsController],
  providers: [RecordsService],
})
export class RecordsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtAuthMiddleware).forRoutes(RecordsController);
  }
}
