import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { PassportGlobalModule } from './auth/passport-global.module.js';
import { UsersModule } from './users/users.module.js';
import { HabitsModule } from './habits/habits.module.js';
import { RecordsModule } from './records/records.module.js';
import { StatisticsModule } from './statistics/statistics.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    PassportGlobalModule,
    AuthModule,
    UsersModule,
    HabitsModule,
    RecordsModule,
    StatisticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}