import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { JwtAuthMiddleware } from '../auth/jwt-auth.middleware.js';

import { HabitsController } from './habits.controller.js';

import { HabitsService } from './habits.service.js';

@Module({
  controllers: [HabitsController],
  providers: [HabitsService],
})
export class HabitsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtAuthMiddleware).forRoutes(HabitsController);
  }
}
