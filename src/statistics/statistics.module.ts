import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { JwtAuthMiddleware } from '../auth/jwt-auth.middleware.js';

import { StatisticsController } from './statistics.controller.js';

import { StatisticsService } from './statistics.service.js';

@Module({
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtAuthMiddleware).forRoutes(StatisticsController);
  }
}
